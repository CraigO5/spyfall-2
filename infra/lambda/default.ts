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
  getLobby,
  resolveVotes,
  resolveSpyGuess,
  returnToLobby,
  send,
  startPayloadFor,
  updateLobby,
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

  // A just-connected client asks for the current state. Beyond the roster, we
  // hand back whatever round/voting/reveal state the lobby is in so a refresh
  // (or a slow joiner) lands exactly where everyone else is.
  if (incoming?.type === "sync") {
    await broadcastPlayers(lobbyCode);
    await send(senderId, { type: "self", isHost: !!sender.Item?.isHost });

    const lobby = await getLobby(lobbyCode);
    const phase = lobby?.phase ?? "lobby";

    // If a round is in progress, re-send this client their own dealt secret
    // and bring them up to whatever phase the room is on.
    if (phase !== "lobby" && sender.Item?.secretRole) {
      await send(senderId, startPayloadFor(lobby!, sender.Item));
    }

    if (phase === "voting") {
      await send(senderId, { type: "voting" });
      if (lobby?.votes) await send(senderId, { type: "votes", votes: lobby.votes });
    } else if (phase === "spyGuess") {
      await send(senderId, { type: "spyTurn", spy: lobby?.caughtSpy ?? "" });
    } else if (phase === "reveal" && lobby?.reveal) {
      await send(senderId, { type: "reveal", ...lobby.reveal });
    } else if (phase === "lobby") {
      // Make sure a stale client that thinks it's mid-round resets to lobby.
      await send(senderId, { type: "lobby" });
    }
    return { statusCode: 200 };
  }

  // Player started the round → deal each player their own private secret.
  // Only the host may start; ignore everyone else.
  if (incoming?.type === "start") {
    if (!sender.Item?.isHost) return { statusCode: 403 };
    await dealStart(lobbyCode, incoming.packId, incoming.settings);
    return { statusCode: 200 };
  }

  // Player skipped to the vote/timer ran out
  if (incoming?.type === "voting") {
    await updateLobby(lobbyCode, { phase: "voting" });
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

  // Host pulled the room back to the lobby screen after a reveal.
  if (incoming?.type === "backToLobby") {
    if (!sender.Item?.isHost) return { statusCode: 403 };
    await returnToLobby(lobbyCode);
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
  // Drop the lobby header row — only players should receive chat etc.
  const Items = (result.Items ?? []).filter(
    (i) => !(i.connectionId as string).startsWith("LOBBY#"),
  );

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
