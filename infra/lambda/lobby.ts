// Shared helper for the lobby (broadcasts who is in the lobby, leaves, and joins)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient());

// How a lambda sends to live connections
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

// Push one payload to a list of connections.
async function pushTo(items: Record<string, any>[], payload: object) {
  const data = Buffer.from(JSON.stringify(payload));

  await Promise.all(
    items.map((item) =>
      api
        .send(
          new PostToConnectionCommand({
            ConnectionId: item.connectionId,
            Data: data,
          }),
        )
        .catch(() => {
          // Ignore stale connection
        }),
    ),
  );
}

export async function broadcastSystem(lobbyCode: string, text: string) {
  const items = await lobbyConnections(lobbyCode);
  await pushTo(items, { type: "system", text });
}

export async function broadcastPlayers(lobbyCode: string) {
  const items = await lobbyConnections(lobbyCode);
  const players = items.map((i) => ({ name: i.name ?? "Agent" }));
  await pushTo(items, { type: "players", players });
}
