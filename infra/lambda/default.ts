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
import {
  broadcastPlayers,
  dealStart,
  broadcast,
  castVote,
  resolveVotes,
  resolveSpyGuess,
} from "./lobby";

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

  let incoming: any;
  try {
    incoming = JSON.parse(message);
  } catch {}

  // A just-connected client asks for the current roster (it couldn't be pushed
  // to during its own $connect).
  if (incoming?.type === "sync") {
    await broadcastPlayers(lobbyCode);
    return { statusCode: 200 };
  }

  // Player started the round → deal each player their own private secret.
  if (incoming?.type === "start") {
    await dealStart(lobbyCode, incoming.packId);
    return { statusCode: 200 };
  }

  // Player skipped to the vote/timer ran out
  if (incoming?.type === "voting") {
    await broadcast(lobbyCode, { type: "voting" });
    return { statusCode: 200 };
  }

  // Player sends vote in (auto-resolves once everyone has voted)
  if (incoming?.type === "playerVote") {
    await castVote(lobbyCode, senderId, incoming.target);
    return { statusCode: 200 };
  }

  // Someone hit "Lock in" → force the vote to resolve now.
  if (incoming?.type === "lockVotes") {
    await resolveVotes(lobbyCode);
    return { statusCode: 200 };
  }

  // The caught spy guessed a location → decide the winner.
  if (incoming?.type === "spyGuess") {
    await resolveSpyGuess(lobbyCode, incoming.guess);
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
