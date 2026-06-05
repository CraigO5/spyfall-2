"use client";

import { useMemo, type CSSProperties } from "react";
import { identityFor } from "../lib/identity";

const PALETTE = ["#D2724E", "#E0A23A", "#8C9E76", "#EFE3CC", "#C0543F", "#E9C39E"];

// Four states: you're the spy or not, crossed with win or loss.
const COPY = {
  spyWin: {
    stamp: "ESCAPED",
    sub: "YOU WIN",
    line: "You slipped the net.",
    meta: () => "Clean getaway — nobody pinned the spy.",
  },
  spyLose: {
    stamp: "BUSTED",
    sub: "YOU LOSE",
    line: "Your cover cracked.",
    meta: () => "The detectives saw right through you.",
  },
  detWin: {
    stamp: "CAUGHT",
    sub: "YOU WIN",
    line: "Spy unmasked — nice work, detective.",
    meta: (spy: string) => `${spy} couldn't keep the cover story straight.`,
  },
  detLose: {
    stamp: "ESCAPED",
    sub: "YOU LOSE",
    line: "The spy slipped away…",
    meta: (spy: string) => `${spy} slipped through your fingers.`,
  },
};

export default function RevealScreen({
  outcome,
  spyName,
  isSpy,
  location,
  onPlayAgain,
  onBackToLobby,
}: {
  outcome: "caught" | "escaped";
  spyName: string;
  isSpy: boolean;
  location?: string | null;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}) {
  // "escaped" = the spy won; "caught" = the detectives won.
  const youWon = isSpy ? outcome === "escaped" : outcome === "caught";
  const state = isSpy
    ? youWon
      ? "spyWin"
      : "spyLose"
    : youWon
      ? "detWin"
      : "detLose";
  const copy = COPY[state];
  const { color, icon } = identityFor(spyName);
  const verdictColor = youWon ? "#8C9E76" : "#C0543F"; // sage green / stamp red

  // Confetti whenever *you* won.
  const confetti = useMemo(() => {
    if (!youWon) return [];
    return Array.from({ length: 40 }, (_, i) => ({
      left: Math.random() * 100,
      bg: PALETTE[i % PALETTE.length],
      d: 1.8 + Math.random() * 1.6,
      delay: 1.2 + Math.random() * 0.6,
      r: Math.random() * 720 - 360,
      round: Math.random() < 0.4,
    }));
  }, [youWon]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-[22px] px-6 py-8 flex flex-col items-center text-center min-h-[560px] fx-fade-in"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 34%, rgba(234,217,182,.16), transparent 60%), #2a241d",
        color: "#EFE3CC",
      }}
    >
      {/* confetti */}
      {confetti.map((c, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={
            {
              left: `${c.left}%`,
              width: c.round ? 7 : 6,
              height: c.round ? 7 : 10,
              background: c.bg,
              borderRadius: c.round ? "50%" : 2,
              opacity: 0,
              "--r": `${c.r}deg`,
              animation: `rv-fall ${c.d}s linear ${c.delay}s forwards`,
            } as CSSProperties
          }
        />
      ))}

      {/* eyebrow */}
      <p
        className="font-type text-[10px] tracking-[0.25em] text-[#C9B89B]"
        style={{ animation: "rv-rise .5s ease-out both" }}
      >
        CASE CLOSED · FILE DD-7
      </p>

      {/* lead */}
      <p
        className="font-semibold text-2xl mt-3"
        style={{ animation: "rv-rise .5s ease-out .15s both" }}
      >
        The spy was
        <span className="inline-flex ml-1">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              style={{
                animation: `rv-dot 1.4s ease-in-out ${d * 0.2}s infinite`,
              }}
            >
              .
            </span>
          ))}
        </span>
      </p>

      {/* mug shot */}
      <div
        className="mt-5 bg-card chunky border-foreground rounded-2xl p-3 w-[170px] -rotate-2 shadow-hard"
        style={{ animation: "rv-rise .5s ease-out .4s both" }}
      >
        <div
          className="relative aspect-square rounded-lg overflow-hidden border-2 border-foreground flex items-center justify-center"
          style={{ background: color }}
        >
          <span className="text-5xl font-bold text-foreground/80">
            {(spyName.charAt(0) || "?").toUpperCase()}
          </span>
          <span className="absolute right-1.5 bottom-1 text-2xl">{icon}</span>
          <span
            className="absolute left-0 right-0 h-7 bg-white/25"
            style={{ animation: "rv-scan 2.2s ease-in-out infinite" }}
          />
        </div>
        <p className="font-type text-[9px] tracking-widest text-muted-foreground mt-2">
          IDENTITY CONFIRMED
        </p>
        <p
          className="text-xl font-bold text-foreground leading-tight"
          style={{ animation: "rv-name .6s ease-out .9s both" }}
        >
          {spyName}
        </p>
        <p className="font-type text-[9px] text-muted-foreground">
          ID-4451 · agent of record
        </p>
      </div>

      {/* verdict */}
      <div
        className="mt-6 font-semibold uppercase tracking-[0.18em] text-[42px] leading-none rounded-xl px-5 py-2 whitespace-nowrap"
        style={{
          color: verdictColor,
          border: `6px solid ${verdictColor}`,
          background: "rgba(255,250,239,.06)",
          animation: "rv-slam .7s cubic-bezier(.2,.8,.2,1) 1.1s both",
        }}
      >
        {copy.stamp}
      </div>
      <p
        className="font-type font-bold text-[11px] tracking-[0.2em] mt-2"
        style={{
          color: verdictColor,
          animation: "rv-rise .4s ease-out 1.6s both",
        }}
      >
        {copy.sub}
      </p>

      {/* result + actions */}
      <div
        className="mt-auto w-full"
        style={{ animation: "rv-rise .5s ease-out 1.75s both" }}
      >
        <p className="font-body font-extrabold text-base text-[#EFE3CC]">
          {copy.line}
        </p>
        <p className="font-type text-[11px] tracking-wide text-[#C9B89B] mt-1">
          {copy.meta(spyName)}
        </p>
        {location && (
          <p className="font-type text-[11px] tracking-[0.18em] text-[#C9B89B] mt-2">
            THE LOCATION WAS{" "}
            <span className="text-card font-bold">{location}</span>
          </p>
        )}
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={onBackToLobby}
            className="flex-1 py-3 rounded-[15px] chunky border-foreground bg-card text-foreground font-semibold shadow-hard transition active:translate-y-1 active:shadow-none"
          >
            Back to lobby
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-[15px] chunky border-foreground bg-primary text-white font-semibold shadow-hard transition active:translate-y-1 active:shadow-none"
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
