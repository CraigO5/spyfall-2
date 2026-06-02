"use client";

import { useEffect, useState } from "react";
import { LOCATIONS, GAME_DURATION_SECONDS } from "../data/locations";
import type { LobbyPlayer } from "../types/lobby";

// Tapping a name/location cycles through these states.
type Mark = "none" | "suspect" | "clear";

const nextMark: Record<Mark, Mark> = {
  none: "suspect",
  suspect: "clear",
  clear: "none",
};

function markClasses(mark: Mark) {
  if (mark === "suspect")
    return "bg-destructive/15 border-destructive text-destructive line-through";
  if (mark === "clear") return "bg-sage/20 border-sage text-foreground";
  return "bg-white border-foreground/20";
}

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const id = setInterval(
      () => setRemaining((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");
  return { remaining, label: `${mm}:${ss}` };
}

export default function GameScreen({
  players,
  location,
  role,
}: {
  players: LobbyPlayer[];
  location?: string;
  role?: string;
}) {
  const { remaining, label } = useCountdown(GAME_DURATION_SECONDS);
  const [marks, setMarks] = useState<Record<string, Mark>>({});

  const cycle = (key: string) =>
    setMarks((m) => ({ ...m, [key]: nextMark[m[key] ?? "none"] }));
  const markOf = (key: string): Mark => marks[key] ?? "none";

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Your secret info + timer */}
      <div className="card bg-secondary flex flex-col items-center gap-3 text-center">
        <div>
          <p className="uppercase text-xs tracking-widest font-bold text-muted-foreground">
            Your location
          </p>
          <p className="text-2xl font-bold">{location ?? "Loading…"}</p>
        </div>
        <div>
          <p className="uppercase text-xs tracking-widest font-bold text-muted-foreground">
            Your role
          </p>
          <p className="text-2xl font-bold">{role ?? "Loading…"}</p>
        </div>
        <p
          className={`text-4xl font-bold tabular-nums ${
            remaining <= 30 ? "text-destructive" : ""
          }`}
        >
          {label}
        </p>
      </div>

      {/* Players */}
      <div className="w-full">
        <label className="font-bold">Players</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {players.map((player) => {
            const key = `player:${player.name}`;
            return (
              <button
                key={key}
                onClick={() => cycle(key)}
                className={`border-2 rounded-xl p-2 font-semibold transition ${markClasses(markOf(key))}`}
              >
                {player.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Locations */}
      <div className="w-full">
        <label className="font-bold">Locations</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {LOCATIONS.map((loc) => {
            const key = `loc:${loc.name}`;
            return (
              <button
                key={key}
                onClick={() => cycle(key)}
                className={`border-2 rounded-xl p-2 text-sm font-semibold transition ${markClasses(markOf(key))}`}
              >
                {loc.name}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center italic px-2">
        Hint: tap a name or location repeatedly to mark it{" "}
        <span className="text-destructive font-bold">suspicious</span> or{" "}
        <span className="text-sage font-bold">clear</span>.
      </p>
    </div>
  );
}
