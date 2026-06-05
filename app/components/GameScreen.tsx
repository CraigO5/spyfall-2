"use client";

import { useState } from "react";
import {
  LOCATIONS,
  GAME_DURATION_SECONDS,
  type GameLocation,
} from "../data/locations";
import type { LobbyPlayer } from "../types/lobby";
import { useName } from "../contexts/NameContext";
import Avatar from "./Avatar";
import Stamp from "./Stamp";
import RoundTimer from "./RoundTimer";

type Mark = "none" | "suspect" | "clear";
const nextMark: Record<Mark, Mark> = {
  none: "suspect",
  suspect: "clear",
  clear: "none",
};

// Zip-style chip states.
function suspectChip(mark: Mark) {
  if (mark === "suspect") return "bg-[#F7E0D8] border-destructive";
  if (mark === "clear") return "bg-sage/15 border-sage";
  return "bg-card border-foreground";
}
function suspectText(mark: Mark) {
  if (mark === "suspect") return "text-destructive";
  if (mark === "clear") return "text-sage line-through";
  return "";
}
function locationChip(mark: Mark) {
  if (mark === "suspect")
    return "bg-[#F7E0D8] border-destructive text-destructive shadow-hard-sm";
  if (mark === "clear") return "bg-sage/15 border-sage text-sage opacity-85";
  return "bg-card border-foreground shadow-hard-sm";
}

export default function GameScreen({
  players,
  location,
  role,
  onTimeUp,
  onCallVote,
  isSpy,
  onGuess,
  locations = LOCATIONS,
  firstPlayer,
  goal,
}: {
  players: LobbyPlayer[];
  location?: string;
  role?: string;
  onTimeUp?: () => void;
  onCallVote?: () => void;
  isSpy?: boolean;
  onGuess?: () => void;
  locations?: GameLocation[];
  firstPlayer: string;
  goal?: string;
}) {
  const { name: myName } = useName();
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [revealed, setRevealed] = useState(false);

  const cycle = (key: string) =>
    setMarks((m) => ({ ...m, [key]: nextMark[m[key] ?? "none"] }));
  const markOf = (key: string): Mark => marks[key] ?? "none";

  const ruledOut = locations.filter(
    (l) => markOf(`loc:${l.name}`) === "clear",
  ).length;

  return (
    <div className="w-full flex flex-col gap-5 fx-pop-in">
      {/* Who asks first */}
      {firstPlayer && (
        <div className="self-center flex items-center gap-2 bg-card chunky border-foreground rounded-full px-4 py-1.5 shadow-hard-sm font-body font-bold text-sm">
          <span>👉</span>
          <span className="font-semibold">{firstPlayer}</span>
          <span className="text-muted-foreground">asks first</span>
        </div>
      )}

      {/* Secret objective — only set for special roles (Joker / Double Agent) */}
      {goal && (
        <div className="bg-accent/15 chunky border-accent rounded-2xl px-4 py-2.5 text-center">
          <p className="font-type text-[10px] tracking-[0.2em] text-accent font-bold">
            YOUR SECRET GOAL
          </p>
          <p className="font-body font-bold text-sm mt-0.5">{goal}</p>
        </div>
      )}

      {/* Flip-to-reveal dossier */}
      <div className="[perspective:1200px]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setRevealed((r) => !r)}
          onKeyDown={(e) => e.key === "Enter" && setRevealed((r) => !r)}
          aria-label={revealed ? "Hide your dossier" : "Reveal your dossier"}
          className={`relative cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
            revealed ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <div className="card bg-secondary [backface-visibility:hidden] flex flex-col items-center justify-center gap-2 py-7 text-center">
            <span className="text-3xl">🕵️</span>
            <Stamp rotate={-6} className="text-[9px]">
              Classified
            </Stamp>
            <p className="font-type font-bold text-xs tracking-[0.2em] text-muted-foreground">
              TAP TO REVEAL
            </p>
          </div>

          <div className="absolute inset-0 card bg-secondary [backface-visibility:hidden] [transform:rotateY(180deg)] grid grid-cols-2 items-center">
            <div className="px-2 text-center">
              <p className="font-type font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                Your Location
              </p>
              <p className="text-2xl font-semibold mt-1">
                {location ?? "Loading…"}
              </p>
            </div>
            <div className="px-2 text-center border-l-2 border-dashed border-foreground/25">
              <p className="font-type font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                Your Role
              </p>
              <p className="text-2xl font-semibold mt-1">
                {role ?? "Loading…"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timer — isolated so its per-second tick doesn't re-render the screen */}
      <RoundTimer seconds={GAME_DURATION_SECONDS} onTimeUp={onTimeUp} />

      {/* Suspects — zip grid chips */}
      <div>
        <div className="flex justify-between items-baseline">
          <label className="font-bold">Suspects</label>
          <span className="font-type uppercase text-[11px] tracking-widest text-muted-foreground">
            Tap to accuse
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-2">
          {players.map((p) => {
            const key = `player:${p.name}`;
            const mark = markOf(key);
            return (
              <button
                key={key}
                onClick={() => cycle(key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-[14px] chunky shadow-hard-sm transition active:translate-y-0.5 active:shadow-none ${suspectChip(mark)}`}
              >
                <Avatar
                  name={p.name}
                  icon={p.icon}
                  isYou={p.name === myName}
                  size={30}
                />
                <span
                  className={`text-[15px] font-medium flex-1 text-left ${suspectText(mark)}`}
                >
                  {p.name}
                </span>
                {mark === "suspect" && (
                  <Stamp rotate={-6} className="text-[7.5px]">
                    ?
                  </Stamp>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Locations — zip grid chips */}
      <div>
        <div className="flex justify-between items-baseline">
          <label className="font-bold">Locations</label>
          <span className="font-type text-[11px] text-sage">
            {ruledOut} ruled out
          </span>
        </div>
        <p className="font-body text-xs italic text-muted-foreground mt-0.5">
          Tap once to flag{" "}
          <span className="text-destructive font-semibold not-italic">
            suspicious
          </span>{" "}
          — twice to mark{" "}
          <span className="text-sage font-semibold not-italic">clear</span>.
        </p>
        <div className="grid grid-cols-2 gap-[9px] mt-2">
          {locations.map((loc) => {
            const key = `loc:${loc.name}`;
            const mark = markOf(key);
            const struck = mark === "clear";
            return (
              <button
                key={key}
                onClick={() => cycle(key)}
                className={`flex items-center justify-center gap-1.5 px-2 py-[11px] rounded-[13px] chunky text-sm font-medium transition active:translate-y-0.5 ${locationChip(mark)}`}
              >
                <span className="text-base leading-none">{loc.icon}</span>
                <span className={struck ? "line-through" : ""}>{loc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skip the timer straight to the accusation */}
      {onCallVote && (
        <button
          onClick={onCallVote}
          className="w-full py-3.5 rounded-[17px] chunky border-foreground bg-primary text-white font-semibold tracking-wide shadow-hard transition active:translate-y-1 active:shadow-none"
        >
          Call the vote →
        </button>
      )}
    </div>
  );
}
