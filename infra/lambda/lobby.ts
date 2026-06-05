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

// Deal a new round: pick a location, secretly make one player the spy, assign
// everyone else a role, and push each player ONLY their own secret.
export async function dealStart(lobbyCode: string, packId?: string) {
  const players = await lobbyConnections(lobbyCode);
  if (players.length === 0) return;

  const pack = packById(packId);
  const location = pick(pack.locations);
  const firstPlayerIndex = Math.floor(Math.random() * players.length);
  const firstPlayer = players[firstPlayerIndex].name;

  const spyIndex = Math.floor(Math.random() * players.length);
  const startedAt = Date.now();

  await Promise.all(
    players.map(async (player, i) => {
      const isSpy = i === spyIndex;

      // Remember the round facts server-side so we can judge the vote later,
      // and wipe last round's vote. (#loc because "location" is a reserved
      // word in DynamoDB expressions.)
      await ddb.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { connectionId: player.connectionId },
          UpdateExpression: "SET isSpy = :s, #loc = :l REMOVE votedFor",
          ExpressionAttributeNames: { "#loc": "location" },
          ExpressionAttributeValues: { ":s": isSpy, ":l": location.name },
        }),
      );

      // Whisper each player ONLY their own secret.
      await send(player.connectionId, {
        type: "start",
        startedAt,
        packId: pack.id,
        location: isSpy ? null : location.name,
        role: isSpy ? "Spy" : pick(location.roles),
        firstPlayer,
      });
    }),
  );
}

// Voting is over: find the most-accused player. If it's the spy, they get one
// chance to guess the location; otherwise the spy walks free.
export async function resolveVotes(lobbyCode: string) {
  const connections = await lobbyConnections(lobbyCode);

  // Count votes per accused name, then take the highest.
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

  const spy = connections.find((c) => c.isSpy);
  const spyName = spy?.name ?? "";
  const location = spy?.location ?? null;

  // Detectives caught the spy → spy gets to guess the location.
  if (accused && accused === spyName) {
    await broadcast(lobbyCode, { type: "spyTurn", spy: spyName });
    return;
  }
  // Wrong person (or nobody) accused → spy escapes.
  await broadcast(lobbyCode, {
    type: "reveal",
    outcome: "escaped",
    spy: spyName,
    location,
  });
}

// The caught spy guessed a location: right = spy steals the win, wrong = caught.
export async function resolveSpyGuess(lobbyCode: string, guess: string) {
  const connections = await lobbyConnections(lobbyCode);
  const spy = connections.find((c) => c.isSpy);
  const spyName = spy?.name ?? "";
  const location = spy?.location ?? null;

  const outcome = guess === location ? "escaped" : "caught";
  await broadcast(lobbyCode, {
    type: "reveal",
    outcome,
    spy: spyName,
    location,
  });
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
