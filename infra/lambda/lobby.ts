// Shared helpers for the lobby: presence, system messages, and dealing a round.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
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

// Everyone currently in a lobby (query the byLobby GSI).
async function lobbyConnections(lobbyCode: string) {
  const { Items = [] } = await ddb.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: "byLobby",
      KeyConditionExpression: "lobbyCode = :code",
      ExpressionAttributeValues: { ":code": lobbyCode },
    }),
  );
  return Items;
}

// Send a payload to a person
function send(connectionId: string, payload: object) {
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
// enabled modes), and push each player ONLY their own secret.
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

  await Promise.all(
    players.map(async (player, i) => {
      const role = roles[i];
      const knowsLocation = role !== "spy"; // only spies are kept in the dark
      const storedLocation = allSpyRound ? null : location.name;
      const { label, goal } = describeRole(role, pick(location.roles));

      // Remember the round facts server-side so we can judge the vote later,
      // and wipe last round's vote. (#loc because "location" is reserved.)
      await ddb.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { connectionId: player.connectionId },
          UpdateExpression:
            "SET secretRole = :sr, isSpy = :s, #loc = :l REMOVE votedFor",
          ExpressionAttributeNames: { "#loc": "location" },
          ExpressionAttributeValues: {
            ":sr": role,
            ":s": role === "spy",
            ":l": storedLocation,
          },
        }),
      );

      // Whisper each player ONLY their own secret.
      await send(player.connectionId, {
        type: "start",
        startedAt,
        packId: pack.id,
        location: knowsLocation ? location.name : null,
        role: label,
        secretRole: role,
        goal,
        allSpy: allSpyRound,
        firstPlayer,
        // The double agent privately learns who they're protecting.
        spy: role === "doubleAgent" ? spyName : undefined,
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
  const accused = mostAccused(connections);

  const spy = connections.find((c) => c.secretRole === "spy");
  const spyName = spy?.name ?? "";
  const location = spy?.location ?? null;

  // ALL-SPY round: there are no innocents — everyone's in on it, everyone wins.
  const allSpy =
    connections.length > 0 && connections.every((c) => c.secretRole === "spy");
  if (allSpy) {
    await broadcast(lobbyCode, {
      type: "reveal",
      result: "allSpy",
      spy: "",
      accused,
      location: null,
      winners: connections.map((c) => c.name),
    });
    return;
  }

  const joker = connections.find((c) => c.secretRole === "joker");
  const doubleAgent = connections.find((c) => c.secretRole === "doubleAgent");

  // The Joker got themselves voted out → Joker wins alone.
  if (joker && accused === joker.name) {
    await broadcast(lobbyCode, {
      type: "reveal",
      result: "joker",
      spy: spyName,
      accused,
      location,
      winners: [joker.name],
    });
    return;
  }

  // Spy got voted out → they get one chance to guess the location.
  if (accused && accused === spyName) {
    await broadcast(lobbyCode, { type: "spyTurn", spy: spyName });
    return;
  }

  // Spy was NOT caught → spy escapes. The double agent rides along, as long as
  // they weren't the one voted out.
  const winners = [spyName];
  if (doubleAgent && accused !== doubleAgent.name) winners.push(doubleAgent.name);
  await broadcast(lobbyCode, {
    type: "reveal",
    result: "spy",
    spy: spyName,
    accused,
    location,
    winners,
  });
}

// The caught spy guessed a location: right = spy steals the win, wrong = the
// innocents (detectives) win. A caught spy means the double agent already lost.
export async function resolveSpyGuess(lobbyCode: string, guess: string) {
  const connections = await lobbyConnections(lobbyCode);
  const spy = connections.find((c) => c.secretRole === "spy");
  const spyName = spy?.name ?? "";
  const location = spy?.location ?? null;

  if (guess === location) {
    await broadcast(lobbyCode, {
      type: "reveal",
      result: "spy",
      spy: spyName,
      accused: spyName,
      location,
      winners: [spyName],
    });
  } else {
    const detectives = connections
      .filter((c) => c.secretRole === "innocent")
      .map((c) => c.name);
    await broadcast(lobbyCode, {
      type: "reveal",
      result: "detectives",
      spy: spyName,
      accused: spyName,
      location,
      winners: detectives,
    });
  }
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

  const votes: Record<string, string[]> = {}; // Record who voted for who

  connections.forEach((i) => {
    if (!i.votedFor) return;

    if (i.votedFor in votes) {
      votes[i.votedFor].push(i.name);
    } else {
      votes[i.votedFor] = [i.name];
    }
  });
  await pushTo(connections, { type: "votes", votes });

  // Once every player has voted, end the round automatically.
  const allVoted = connections.every((c) => c.votedFor);
  if (allVoted) await resolveVotes(lobbyCode);
}
