import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { broadcastPlayers } from "./lobby";

// Starts a new DynamoDB client much like supabase and DynamoDBDocumentClient wraps using JS objects
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());

// How a lambda sends to a live connections
const api = new ApiGatewayManagementApiClient({
  endpoint: process.env.WS_ENDPOINT,
});

// AWS calls it with an event input: Player sends a message
// We need to find which lobby the sender is in and then fetch everyone in the lobby for messaging
export const handler = async (event: any) => {
  const senderId = event.requestContext.connectionId;
  const message = event.body ?? "";

  //   Find sender to find their lobby
  const sender = await ddb.send(
    new GetCommand({
      // Fetch item by primary key (connectionId)
      TableName: process.env.TABLE_NAME,
      Key: { connectionId: senderId },
    }),
  );

  const lobbyCode = sender.Item?.lobbyCode;
  if (!lobbyCode) return { statusCode: 400 };

  // A just-connected client asks for the roster once its socket is open.
  // (We can't push to a connection during its own $connect, so the newcomer
  // requests the player list here instead.)
  let incoming: any;
  try {
    incoming = JSON.parse(message);
  } catch {}
  if (incoming?.type === "sync") {
    await broadcastPlayers(lobbyCode);
    return { statusCode: 200 };
  }

  //   Query the GSI for everyone in the lobby
  const result = await ddb.send(
    new QueryCommand({
      // Query GSI instead of main table
      TableName: process.env.TABLE_NAME,
      IndexName: "byLobby",
      KeyConditionExpression: "lobbyCode = :code", // Syntax for DynamoDB (where lobbyCode equals...)
      ExpressionAttributeValues: { ":code": lobbyCode }, // :code is a placeholder
    }),
  );
  const Items = result.Items ?? []; // use [] if Items is missing

  //   Push the message to each player at once (async)
  await Promise.all(
    Items.map((item) =>
      api
        .send(
          // Pushes to each connection id
          new PostToConnectionCommand({
            ConnectionId: item.connectionId,
            Data: Buffer.from(message),
          }),
        )
        .catch(() => {
          // Ignore stale connection
        }),
    ),
  );

  //   Confirmation status code
  return { statusCode: 200 };
};
