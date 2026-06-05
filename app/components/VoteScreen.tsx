"use client";

import { useState } from "react";
import type { LobbyMessage, LobbyPlayer } from "../types/lobby";
import { useCountdown } from "../hooks/useCountdown";
import Avatar from "./Avatar";
import Stamp from "./Stamp";
// The Accusation — vote for who you think the spy is.
export default function VoteScreen({
  players,
  myName,
  onLockIn,
  send,
  votes = {},
  seconds = 30,
}: {
  players: LobbyPlayer[];
  myName: string;
  onLockIn: (target: string | null) => void;
  send: (msg: LobbyMessage) => void;
  votes?: Record<string, string[]>;
  seconds?: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [lockedIn, setLockedIn] = useState(false);

  // Commit my final vote. Until everyone does this, the round won't resolve —
  // the server only ends voting once all players have locked in.
  const lockIn = () => {
    if (!selected || lockedIn) return;
    setLockedIn(true);
    send({ type: "playerVote", target: selected });
  };

  // If the clock runs out, commit whatever's picked and force the round to
  // resolve so nobody can stall it forever.
  const { label } = useCountdown(seconds, () => {
    lockIn();
    onLockIn(selected);
  });

  const votesIn = Object.values(votes).reduce((n, v) => n + v.length, 0);

  return (
    <div className="w-full flex flex-col gap-4 fx-pop-in">
      {/* Header */}
      <div className="relative text-center">
        <p className="font-type text-[10px] tracking-[0.25em] text-muted-foreground">
          TIME&apos;S UP
        </p>
        <h1 className="text-3xl font-semibold">The Accusation</h1>
        <div className="absolute -top-1 right-0">
          <Stamp rotate={9} className="text-[9px]">
            Vote now
          </Stamp>
        </div>
      </div>

      {/* Prompt + countdown */}
      <div className="flex items-center justify-center gap-2 bg-secondary chunky border-foreground rounded-2xl py-2.5 shadow-hard">
        <span className="font-body font-extrabold text-[15px]">
          Who&apos;s the spy?
        </span>
        <span className="text-lg font-semibold text-primary tabular-nums">
          {label}
        </span>
      </div>

      {/* Candidates */}
      <div className="flex flex-col gap-2">
        {players.map((p, i) => {
          const isYou = p.name === myName;
          const sel = selected === p.name;
          const voters = votes[p.name] ?? [];
          const count = voters.length;
          return (
            <div
              key={`${p.name}-${i}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-2xl chunky shadow-hard-sm ${
                sel
                  ? "bg-[#F7E0D8] border-destructive"
                  : isYou
                    ? "bg-secondary border-foreground opacity-70"
                    : "bg-card border-foreground"
              }`}
            >
              <Avatar name={p.name} icon={p.icon} isYou={isYou} size={40} />
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-base ${sel ? "text-destructive" : ""}`}
                >
                  {p.name}
                  {isYou && (
                    <span className="font-body font-bold text-xs text-muted-foreground">
                      {" "}
                      · can&apos;t vote yourself
                    </span>
                  )}
                </p>
                {count > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-type font-bold text-[10.5px] text-muted-foreground">
                      {count} {count === 1 ? "vote" : "votes"} · {voters.join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {sel ? (
                <span className="w-[26px] h-[26px] rounded-full bg-destructive border-[2.5px] border-foreground flex items-center justify-center text-white text-sm font-black">
                  ✓
                </span>
              ) : (
                !isYou && (
                  <button
                    onClick={() => !lockedIn && setSelected(p.name)}
                    disabled={lockedIn}
                    className="font-semibold text-[12.5px] text-primary border-2 border-primary rounded-xl px-3 py-1 disabled:opacity-40"
                  >
                    Vote
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="font-body font-bold text-[12.5px] text-muted-foreground text-center">
        {lockedIn ? (
          <>
            Locked in on{" "}
            <span className="text-destructive font-extrabold">{selected}</span> ·
            waiting for the others
          </>
        ) : selected ? (
          <>
            You accused{" "}
            <span className="text-destructive font-extrabold">{selected}</span>
          </>
        ) : (
          "Tap a player to accuse"
        )}
      </p>

      <button
        onClick={lockIn}
        disabled={!selected || lockedIn}
        className="w-full py-3.5 rounded-[17px] chunky border-foreground bg-primary text-white font-semibold text-[17px] tracking-wide shadow-hard transition active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-hard"
      >
        {lockedIn
          ? `LOCKED IN · ${votesIn}/${players.length} READY`
          : "LOCK IN VOTE"}
      </button>
    </div>
  );
}
