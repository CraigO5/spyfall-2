import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { broadcastPlayers, broadcastSystem } from "./lobby";

// Starts a new DynamoDB client much like supabase and DynamoDBDocumentClient wraps using JS objects
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());

// AWS calls it with an event input: Player connects to the websocket
export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId; // AWS's unique connection ID

  //   Client connects with wss://…/prod?code=ABCDE query string at $connect
  const lobbyCode = event.queryStringParameters?.code; // reads the lobby code from the url
  const name = event.queryStringParameters?.name ?? "Agent"; // Obtain name from url
  if (!lobbyCode) return { statusCode: 400 }; // Reject connections with no lobby

  await ddb.send(
    // Insert/overwrite an item writing a {connectionId} into table TABLE_NAME
    new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: { connectionId, lobbyCode, name }, // Store connection id, name, and lobby code together
    }),
  );

  await broadcastPlayers(lobbyCode);
  await broadcastSystem(lobbyCode, `${name} joined the lobby`);
  //   Confirmation status code
  return { statusCode: 200 };
};
