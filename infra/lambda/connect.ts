import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  broadcastPlayers,
  broadcastSystem,
  lobbyConnections,
} from "./lobby";

// Starts a new DynamoDB client much like supabase and DynamoDBDocumentClient wraps using JS objects
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());

// AWS calls it with an event input: Player connects to the websocket
export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId; // AWS's unique connection ID

  //   Client connects with wss://…/prod?code=ABCDE query string at $connect
  const lobbyCode = event.queryStringParameters?.code; // reads the lobby code from the url
  const name = event.queryStringParameters?.name ?? "Agent"; // Obtain name from url
  const icon = event.queryStringParameters?.icon ?? ""; // Player's chosen icon
  if (!lobbyCode) return { statusCode: 400 }; // Reject connections with no lobby

  await ddb.send(
    // Insert/overwrite an item writing a {connectionId} into table TABLE_NAME
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: { connectionId, lobbyCode, name, icon }, // id, name, icon, lobby code
    }),
  );

  // First person in the lobby (nobody else is host yet) becomes the host.
  // They can't be told during $connect — they'll learn it from the sync reply.
  const others = await lobbyConnections(lobbyCode);
  const hasHost = others.some(
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

  await broadcastPlayers(lobbyCode);
  await broadcastSystem(lobbyCode, `${name} joined the lobby`);
  //   Confirmation status code
  return { statusCode: 200 };
};
