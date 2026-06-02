/**
 * Functional hook allowing the frontend to actually use WebSockets
 */
"use client";

import { useEffect, useRef, useState } from "react";
import type { LobbyMessage, LobbyPlayer } from "../types/lobby";

export function useLobby(code: string, name: string) {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  // useRef: survives re-renders without causing them
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!name) return; // wait until the player's name has loaded

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?code=${code}&name=${name}`,
    );
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ connected to lobby", code);
      // Socket is open now — ask the server who's in the lobby.
      // (The server couldn't push this to us during $connect.)
      ws.send(JSON.stringify({ type: "sync" }));
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "players") {
          setPlayers(msg.players);
        } else {
          setMessages((prev) => [...prev, msg]);
        }
      } catch {}
    };
    ws.onclose = () => console.log("❌ disconnected");

    return () => ws.close();
  }, [code, name]);

  const send = (msg: LobbyMessage) => {
    socketRef.current?.send(JSON.stringify(msg));
  };

  return { messages, send, players };
}
