// Shared helpers for the lobby: presence, system messages, dealing a round,
// and persisting authoritative per-lobby state (so reconnects can resume).
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { packById } from "./packs";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());
const api = new ApiGatewayManagementApiClient({
  endpoint: process.env.WS_ENDPOINT,
});

export type Phase = "lobby" | "game" | "voting" | "spyGuess" | "reveal";

// The byLobby GSI returns the lobby header row AND every player row. The
// header has connectionId = "LOBBY#<code>"; everything else is a player.
const headerKey = (code: string) => `LOBBY#${code}`;
const isPlayerRow = (item: Record<string, any>) =>
  !(item.connectionId as string).startsWith("LOBBY#");

// Everyone currently in a lobby (query the byLobby GSI, drop the header row).
export async function lobbyConnections(lobbyCode: string) {
  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: "byLobby",
      KeyConditionExpression: "lobbyCode = :code",
      ExpressionAttributeValues: { ":code": lobbyCode },
    }),
  );
  return Items.filter(isPlayerRow);
}

// Fetch the lobby header. Returns null if the lobby has never been seeded.
export async function getLobby(lobbyCode: string) {
  const { Item } = await ddb.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { connectionId: headerKey(lobbyCode) },
    }),
  );
  return (Item ?? null) as null | Record<string, any>;
}

// Make sure the header row exists; create it in the "lobby" phase if not.
export async function ensureLobby(lobbyCode: string) {
  const existing = await getLobby(lobbyCode);
  if (existing) return existing;
  const seed = {
    connectionId: headerKey(lobbyCode),
    lobbyCode,
    kind: "lobby",
    phase: "lobby" as Phase,
  };
  await ddb.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: seed,
      // Don't clobber a header someone else just wrote.
      ConditionExpression: "attribute_not_exists(connectionId)",
    }),
  ).catch(() => {});
  return seed;
}

// Patch fields on the lobby header. Pass undefined to clear a field.
export async function updateLobby(
  lobbyCode: string,
  patch: Record<string, any>,
) {
  const sets: string[] = [];
  const removes: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};
  let i = 0;
  for (const [k, v] of Object.entries(patch)) {
    const nameKey = `#k${i}`;
    names[nameKey] = k;
    if (v === undefined) {
      removes.push(nameKey);
    } else {
      const valKey = `:v${i}`;
      values[valKey] = v;
      sets.push(`${nameKey} = ${valKey}`);
    }
    i++;
  }
  const parts: string[] = [];
  if (sets.length) parts.push(`SET ${sets.join(", ")}`);
  if (removes.length) parts.push(`REMOVE ${removes.join(", ")}`);
  if (!parts.length) return;
  await ddb.send(
    new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: { connectionId: headerKey(lobbyCode) },
      UpdateExpression: parts.join(" "),
      ExpressionAttributeNames: names,
      ...(Object.keys(values).length ? { ExpressionAttributeValues: values } : {}),
    }),
  );
}

// Send a payload to a person.
export function send(connectionId: string, payload: object) {
  return api
    .send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(payload)),
      }),
    )
    .catch(() => {
      // stale connection — ignore
    });
}

// Push a payload to items/connections
async function pushTo(items: Record<string, any>[], payload: object) {
  await Promise.all(items.map((i) => send(i.connectionId, payload)));
}

// Randomly choose something within an array
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function broadcast(lobbyCode: string, payload: object) {
  const connections = await lobbyConnections(lobbyCode);
  await pushTo(connections, payload);
}

export async function broadcastSystem(lobbyCode: string, text: string) {
  await broadcast(lobbyCode, { type: "system", text });
}

export async function broadcastPlayers(lobbyCode: string) {
  const connections = await lobbyConnections(lobbyCode);
  const players = connections.map((i) => ({
    name: i.name ?? "Agent",
    icon: i.icon ?? "",
  }));
  await pushTo(connections, { type: "players", players });
}

// Build the per-player `start` payload from a saved player row + lobby header.
// Used during a fresh deal AND when a reconnecting player needs to resume.
export function startPayloadFor(
  lobby: Record<string, any>,
  player: Record<string, any>,
) {
  const allSpy = !!lobby.allSpy;
  const knowsLocation = player.secretRole !== "spy" && !allSpy;
  return {
    type: "start" as const,
    startedAt: lobby.startedAt,
    packId: lobby.packId ?? "classic",
    location: knowsLocation ? lobby.location : null,
    role: player.role,
    secretRole: player.secretRole,
    goal: player.goal,
    allSpy,
    firstPlayer: lobby.firstPlayer,
    spy: player.spy, // only set for double agent
  };
}

// Optional game modes the host can enable.
type Settings = { allSpy?: boolean; joker?: boolean; doubleAgent?: boolean };
type SecretRole = "spy" | "joker" | "doubleAgent" | "innocent";

// When a mode is enabled, how often it actually fires in a given round.
const ALL_SPY_CHANCE = 0.18;
const JOKER_CHANCE = 0.5;
const DOUBLE_AGENT_CHANCE = 0.5;

// Drop a special role onto a random seat that's still a plain innocent.
function placeRole(roles: SecretRole[], role: SecretRole) {
  const free = roles
    .map((r, i) => (r === "innocent" ? i : -1))
    .filter((i) => i >= 0);
  if (free.length) roles[pick(free)] = role;
}

// The label + goal hint each player sees for their secret role.
function describeRole(role: SecretRole, roleName: string) {
  switch (role) {
    case "spy":
      // Deliberately identical whether or not it's an all-spy round — the
      // player must not be able to tell, or the all-spy reveal is spoiled.
      return {
        label: "Spy",
        goal: "Blend in. Work out the location without blowing your cover.",
      };
    case "joker":
      return {
        label: "Joker",
        goal: "Get yourself voted out — you win alone if the group accuses you.",
      };
    case "doubleAgent":
      return {
        label: "Double Agent",
        goal: "Protect the spy. You both win if neither of you is voted out.",
      };
    default:
      return {
        label: roleName,
        goal: "Find the spy — without giving away the location.",
      };
  }
}

// Deal a new round: pick a location, assign secret roles (honoring the host's
// enabled modes), and push each player ONLY their own secret. Also persists the
// round on the lobby header so a reconnect can recover state.
export async function dealStart(
  lobbyCode: string,
  packId?: string,
  settings: Settings = {},
) {
  const players = await lobbyConnections(lobbyCode);
  if (players.length === 0) return;

  const pack = packById(packId);
  const location = pick(pack.locations);
  const firstPlayer = pick(players).name;
  const startedAt = Date.now();

  // Decide everyone's secret role for this round.
  const allSpyRound =
    !!settings.allSpy && players.length >= 3 && Math.random() < ALL_SPY_CHANCE;

  const roles: SecretRole[] = players.map(() => "innocent");
  if (allSpyRound) {
    roles.fill("spy");
  } else {
    roles[Math.floor(Math.random() * players.length)] = "spy"; // exactly one spy
    if (settings.joker && Math.random() < JOKER_CHANCE)
      placeRole(roles, "joker");
    if (settings.doubleAgent && Math.random() < DOUBLE_AGENT_CHANCE)
      placeRole(roles, "doubleAgent");
  }

  const spyName = players[roles.indexOf("spy")]?.name ?? "";

  // Persist the round shape on the lobby header so reconnects can resume.
  await updateLobby(lobbyCode, {
    phase: "game",
    packId: pack.id,
    startedAt,
    location: allSpyRound ? null : location.name,
    firstPlayer,
    allSpy: allSpyRound,
    settings,
    // Clear stale verdict-related state from any prior round.
    caughtSpy: undefined,
    reveal: undefined,
  });

  await Promise.all(
    players.map(async (player, i) => {
      const role = roles[i];
      const { label, goal } = describeRole(role, pick(location.roles));
      const spyHint = role === "doubleAgent" ? spyName : undefined;

      // Remember the round facts server-side so we can judge the vote later,
      // re-hydrate a reconnect, and wipe last round's vote.
      // (#loc because "location" is reserved.)
      await ddb.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { connectionId: player.connectionId },
          UpdateExpression:
            spyHint !== undefined
              ? "SET secretRole = :sr, isSpy = :s, #role = :r, goal = :g, spyName = :sp, #loc = :l REMOVE votedFor"
              : "SET secretRole = :sr, isSpy = :s, #role = :r, goal = :g, #loc = :l REMOVE votedFor, spyName",
          ExpressionAttributeNames: {
            "#loc": "location",
            "#role": "role",
          },
          ExpressionAttributeValues: {
            ":sr": role,
            ":s": role === "spy",
            ":r": label,
            ":g": goal,
            ":l": role === "spy" || allSpyRound ? null : location.name,
            ...(spyHint !== undefined ? { ":sp": spyHint } : {}),
          },
        }),
      );

      // Whisper each player ONLY their own secret.
      await send(player.connectionId, {
        type: "start",
        startedAt,
        packId: pack.id,
        location: role === "spy" || allSpyRound ? null : location.name,
        role: label,
        secretRole: role,
        goal,
        allSpy: allSpyRound,
        firstPlayer,
        // The double agent privately learns who they're protecting.
        spy: spyHint,
      });
    }),
  );
}

// Find the most-accused player (null if nobody voted).
function mostAccused(connections: Record<string, any>[]) {
  const tally: Record<string, number> = {};
  connections.forEach((c) => {
    if (c.votedFor) tally[c.votedFor] = (tally[c.votedFor] ?? 0) + 1;
  });
  let accused: string | null = null;
  let best = 0;
  for (const [name, n] of Object.entries(tally)) {
    if (n > best) {
      best = n;
      accused = name;
    }
  }
  return accused;
}

// Voting is over: decide the round based on who got accused and the roles in
// play. `winners` lists the names who won, so each client can check itself.
export async function resolveVotes(lobbyCode: string) {
  const connections = await lobbyConnections(lobbyCode);
  // Only this round's participants vote/get judged. (A late-joiner won't have
  // a secretRole — they shouldn't be able to stall or skew the vote.)
  const roundConnections = connections.filter((c) => c.secretRole);
  const accused = mostAccused(roundConnections);

  const spy = roundConnections.find((c) => c.secretRole === "spy");
  const spyName = spy?.name ?? "";
  const location = spy?.location ?? null;

  // ALL-SPY round: there are no innocents — everyone's in on it, everyone wins.
  const allSpy =
    roundConnections.length > 0 &&
    roundConnections.every((c) => c.secretRole === "spy");
  if (allSpy) {
    const reveal = {
      result: "allSpy",
      spy: "",
      accused,
      location: null,
      winners: roundConnections.map((c) => c.name),
    };
    await updateLobby(lobbyCode, { phase: "reveal", reveal });
    await broadcast(lobbyCode, { type: "reveal", ...reveal });
    return;
  }

  const joker = roundConnections.find((c) => c.secretRole === "joker");
  const doubleAgent = roundConnections.find(
    (c) => c.secretRole === "doubleAgent",
  );

  // The Joker got themselves voted out → Joker wins alone.
  if (joker && accused === joker.name) {
    const reveal = {
      result: "joker",
      spy: spyName,
      accused,
      location,
      winners: [joker.name],
    };
    await updateLobby(lobbyCode, { phase: "reveal", reveal });
    await broadcast(lobbyCode, { type: "reveal", ...reveal });
    return;
  }

  // Spy got voted out → they get one chance to guess the location.
  if (accused && accused === spyName) {
    await updateLobby(lobbyCode, { phase: "spyGuess", caughtSpy: spyName });
    await broadcast(lobbyCode, { type: "spyTurn", spy: spyName });
    return;
  }

  // Spy was NOT caught → spy escapes. The double agent rides along, as long as
  // they weren't the one voted out.
  const winners = [spyName];
  if (doubleAgent && accused !== doubleAgent.name) winners.push(doubleAgent.name);
  const reveal = { result: "spy", spy: spyName, accused, location, winners };
  await updateLobby(lobbyCode, { phase: "reveal", reveal });
  await broadcast(lobbyCode, { type: "reveal", ...reveal });
}

// The caught spy guessed a location: right = spy steals the win, wrong = the
// innocents (detectives) win. A caught spy means the double agent already lost.
export async function resolveSpyGuess(lobbyCode: string, guess: string) {
  const connections = await lobbyConnections(lobbyCode);
  const roundConnections = connections.filter((c) => c.secretRole);
  const spy = roundConnections.find((c) => c.secretRole === "spy");
  const spyName = spy?.name ?? "";
  const location = spy?.location ?? null;

  let reveal;
  if (guess === location) {
    reveal = {
      result: "spy",
      spy: spyName,
      accused: spyName,
      location,
      winners: [spyName],
    };
  } else {
    const detectives = roundConnections
      .filter((c) => c.secretRole === "innocent")
      .map((c) => c.name);
    reveal = {
      result: "detectives",
      spy: spyName,
      accused: spyName,
      location,
      winners: detectives,
    };
  }
  await updateLobby(lobbyCode, { phase: "reveal", reveal });
  await broadcast(lobbyCode, { type: "reveal", ...reveal });
}

// True if every active round participant has cast a vote (so we can resolve).
function allVoted(connections: Record<string, any>[]) {
  const participants = connections.filter((c) => c.secretRole);
  return participants.length > 0 && participants.every((c) => c.votedFor);
}

// Build the broadcast tally from current connection rows.
function tallyVotes(connections: Record<string, any>[]) {
  const votes: Record<string, string[]> = {};
  connections.forEach((i) => {
    if (!i.votedFor) return;
    if (i.votedFor in votes) votes[i.votedFor].push(i.name);
    else votes[i.votedFor] = [i.name];
  });
  return votes;
}

export async function castVote(
  lobbyCode: string,
  voterId: string,
  target: string,
) {
  await ddb.send(
    new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: { connectionId: voterId },
      UpdateExpression: "SET votedFor = :t",
      ExpressionAttributeValues: { ":t": target },
    }),
  );

  const connections = await lobbyConnections(lobbyCode);

  // The GSI is eventually consistent, so it may not show the vote we just
  // wrote. Patch it in locally so the tally + "everyone voted?" check are exact.
  connections.forEach((c) => {
    if (c.connectionId === voterId) c.votedFor = target;
  });

  const votes = tallyVotes(connections);
  await updateLobby(lobbyCode, { votes });
  await pushTo(connections, { type: "votes", votes });

  // Once every player has voted, end the round automatically.
  if (allVoted(connections)) await resolveVotes(lobbyCode);
}

// Called when a player leaves while voting is in progress — the remaining
// players might already satisfy "everyone voted", so re-evaluate.
export async function maybeResolveVotesAfterLeave(lobbyCode: string) {
  const lobby = await getLobby(lobbyCode);
  if (lobby?.phase !== "voting") return;
  const connections = await lobbyConnections(lobbyCode);
  // Refresh the broadcast tally in case the leaver had voted.
  const votes = tallyVotes(connections);
  await updateLobby(lobbyCode, { votes });
  await pushTo(connections, { type: "votes", votes });
  if (allVoted(connections)) await resolveVotes(lobbyCode);
}

// Host reset → everyone back to the lobby screen and clear round state.
export async function returnToLobby(lobbyCode: string) {
  await updateLobby(lobbyCode, {
    phase: "lobby",
    startedAt: undefined,
    packId: undefined,
    location: undefined,
    firstPlayer: undefined,
    allSpy: undefined,
    settings: undefined,
    votes: undefined,
    caughtSpy: undefined,
    reveal: undefined,
  });
  // Wipe each player's round-private data so a stale role can't leak.
  const players = await lobbyConnections(lobbyCode);
  await Promise.all(
    players.map((p) =>
      ddb
        .send(
          new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: { connectionId: p.connectionId },
            UpdateExpression:
              "REMOVE secretRole, isSpy, #role, goal, #loc, spyName, votedFor",
            ExpressionAttributeNames: { "#loc": "location", "#role": "role" },
          }),
        )
        .catch(() => {}),
    ),
  );
  await broadcast(lobbyCode, { type: "lobby" });
}
