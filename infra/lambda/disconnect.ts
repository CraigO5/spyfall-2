import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { broadcastPlayers, broadcastSystem } from "./lobby";

// Starts a new DynamoDB client much like supabase and DynamoDBDocumentClient wraps using JS objects
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());

// AWS calls it with an event input: Player connects to the websocket
export const handler = async (event: any) => {
  // AWS's unique connection ID
  const connectionId = event.requestContext.connectionId;

  // Get lobby code before deletion
  const got = await ddb.send(
    new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { connectionId },
    }),
  );
  const lobbyCode = got.Item?.lobbyCode;
  const name = got.Item?.name ?? "Agent";

  await ddb.send(
    // Delete an item writing a {connectionId} into table TABLE_NAME
    new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      // To write an item you want the whole item, to delete you want the key
      Key: { connectionId },
    }),
  );

  if (lobbyCode) {
    await broadcastPlayers(lobbyCode);
    await broadcastSystem(lobbyCode, `${name} left the lobby`);
  }

  //   Confirmation status code
  return { statusCode: 200 };
};
