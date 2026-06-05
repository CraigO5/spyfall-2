/**
 * Functional hook allowing the frontend to actually use WebSockets
 */
"use client";

import { useEffect, useRef, useState } from "react";
import type {
  GameSettings,
  LobbyMessage,
  LobbyPlayer,
  RoundResult,
  Round,
} from "../types/lobby";

export function useLobby(code: string, name: string, icon: string) {
  const [messages, setMessages] = useState<LobbyMessage[]>([]);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [round, setRound] = useState<Round | null>(null);
  const [serverPhase, setServerPhase] = useState<string | null>(null);
  // Server-authoritative tally: { accusedName: [voterName, ...] }
  const [votes, setVotes] = useState<Record<string, string[]>>({});
  // Name of the caught spy during the spy-guess phase (so waiters can show it).
  const [caughtSpy, setCaughtSpy] = useState("");
  // The final verdict, decided by the server.
  const [reveal, setReveal] = useState<{
    result: RoundResult;
    spy: string;
    accused: string | null;
    location: string | null;
    winners: string[];
  } | null>(null);
  // useRef: survives re-renders without causing them
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!name) return; // wait until the name has loaded

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}?code=${code}&name=${encodeURIComponent(
        name,
      )}&icon=${encodeURIComponent(icon)}`,
    );
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ connected to lobby", code);
      // Socket is open now — ask the server who's in the lobby.
      ws.send(JSON.stringify({ type: "sync" }));
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "players") {
          setPlayers(msg.players ?? []);
        } else if (msg.type === "start") {
          // New round — clear out the previous round's phase/votes/verdict.
          setServerPhase(null);
          setVotes({});
          setReveal(null);
          setRound({
            location: msg.location ?? null,
            role: msg.role,
            startedAt: msg.startedAt,
            packId: msg.packId ?? "classic",
            firstPlayer: msg.firstPlayer,
            secretRole: msg.secretRole,
            goal: msg.goal,
            allSpy: msg.allSpy,
            spy: msg.spy,
          });
        } else if (msg.type === "voting") {
          // Advance to the voting screen
          setServerPhase("voting");
        } else if (msg.type === "votes") {
          // Server recomputed the tally after someone voted.
          setVotes(msg.votes ?? {});
        } else if (msg.type === "spyTurn") {
          // Spy was caught — everyone moves to the spy-guess phase.
          setCaughtSpy(msg.spy ?? "");
          setServerPhase("spyGuess");
        } else if (msg.type === "reveal") {
          // Final verdict is in.
          setReveal({
            result: msg.result,
            spy: msg.spy ?? "",
            accused: msg.accused ?? null,
            location: msg.location ?? null,
            winners: msg.winners ?? [],
          });
          setServerPhase("reveal");
        } else {
          setMessages((prev) => [...prev, msg]);
        }
      } catch {}
    };
    ws.onclose = () => console.log("❌ disconnected");

    return () => ws.close();
  }, [code, name, icon]);

  const send = (msg: LobbyMessage) => {
    socketRef.current?.send(JSON.stringify(msg));
  };

  // Host triggers a fresh round; the server deals to everyone.
  const startRound = (packId?: string, settings?: GameSettings) =>
    send({ type: "start", packId, settings });
  const resetRound = () => setRound(null);

  return {
    messages,
    send,
    players,
    round,
    startRound,
    resetRound,
    serverPhase,
    votes,
    reveal,
    caughtSpy,
  };
}
