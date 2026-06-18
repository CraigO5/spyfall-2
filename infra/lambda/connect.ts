import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  broadcastPlayers,
  broadcastSystem,
  ensureLobby,
  lobbyConnections,
} from "./lobby";

// Starts a new DynamoDB client much like supabase and DynamoDBDocumentClient wraps using JS objects
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());

// AWS calls it with an event input: Player connects to the websocket
export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId; // AWS's unique connection ID

  //   Client connects with wss://…/prod?code=ABCDE&clientId=… query string at $connect
  const lobbyCode = event.queryStringParameters?.code; // reads the lobby code from the url
  const name = event.queryStringParameters?.name ?? "Agent"; // Obtain name from url
  const icon = event.queryStringParameters?.icon ?? ""; // Player's chosen icon
  const clientId = event.queryStringParameters?.clientId ?? ""; // Stable per-browser id
  if (!lobbyCode) return { statusCode: 400 }; // Reject connections with no lobby

  // Make sure the lobby header row exists so phase/round can be persisted.
  await ensureLobby(lobbyCode);

  // If this clientId already has a row in the lobby (refresh / quick reconnect
  // before the old $disconnect fired), inherit its game-state and drop the old
  // row so the player keeps their role + host status across the reconnect.
  const existing = await lobbyConnections(lobbyCode);
  const prior = clientId
    ? existing.find((c) => c.clientId === clientId)
    : undefined;

  const carry: Record<string, any> = {};
  let rejoining = false;
  if (prior) {
    rejoining = true;
    // Game-state fields we want to keep across a reconnect.
    for (const k of [
      "isHost",
      "secretRole",
      "isSpy",
      "role",
      "goal",
      "location",
      "spyName",
      "votedFor",
    ]) {
      if (prior[k] !== undefined) carry[k] = prior[k];
    }
    // Tear down the old connection row.
    await ddb
      .send(
        new DeleteCommand({
          TableName: process.env.TABLE_NAME,
          Key: { connectionId: prior.connectionId },
        }),
      )
      .catch(() => {});
  }

  await ddb.send(
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        connectionId,
        lobbyCode,
        kind: "player",
        clientId,
        name,
        icon,
        ...carry,
      },
    }),
  );

  // First person in the lobby (nobody else is host yet) becomes the host.
  // They can't be told during $connect — they'll learn it from the sync reply.
  // Skip when we already inherited host status from a prior connection.
  if (!carry.isHost) {
    const remaining = await lobbyConnections(lobbyCode);
    const hasHost = remaining.some(
      (c) => c.isHost && c.connectionId !== connectionId,
    );
    if (!hasHost) {
      await ddb.send(
        new UpdateCommand({
          TableName: process.env.TABLE_NAME,
          Key: { connectionId },
          UpdateExpression: "SET isHost = :h",
          ExpressionAttributeValues: { ":h": true },
        }),
      );
    }
  }

  await broadcastPlayers(lobbyCode);
  // Don't spam the chat when a player refreshes — only on a real first join.
  if (!rejoining) {
    await broadcastSystem(lobbyCode, `${name} joined the lobby`);
  }
  //   Confirmation status code
  return { statusCode: 200 };
};
