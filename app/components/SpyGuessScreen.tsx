"use client";

import { useState } from "react";
import { LOCATIONS, type GameLocation } from "../data/locations";
import { useCountdown } from "../hooks/useCountdown";
import Stamp from "./Stamp";

// Spy's Guess — the exposed spy's last chance to name the location and steal the win.
export default function SpyGuessScreen({
  onLockIn,
  seconds = 30,
  locations = LOCATIONS,
}: {
  onLockIn: (location: string | null) => void;
  seconds?: number;
  locations?: GameLocation[];
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const { label } = useCountdown(seconds, () => onLockIn(picked));

  return (
    <div className="w-full flex flex-col gap-[18px] fx-pop-in">
      {/* Reveal banner */}
      <div className="relative overflow-hidden bg-foreground rounded-[22px] px-5 pt-5 pb-[18px] text-center">
        <div className="absolute top-3 right-3">
          <Stamp color="pale" rotate={9} className="text-[9px]">
            Busted
          </Stamp>
        </div>
        <p className="font-type text-[10.5px] tracking-[0.25em] text-[#C9B89B]">
          YOU WERE CAUGHT — BUT
        </p>
        <h1 className="text-3xl font-semibold text-card mt-1.5 leading-none">
          You&apos;re the spy.
        </h1>
        <p className="font-body font-bold text-[13.5px] text-[#D8C8AC] mt-2 max-w-[250px] mx-auto">
          Name the secret location and you steal the win. One guess.
        </p>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2.5 bg-secondary chunky border-foreground rounded-2xl py-2 shadow-hard">
        <span className="w-[9px] h-[9px] rounded-full bg-primary pulse-dot" />
        <span className="text-[26px] font-semibold tabular-nums">{label}</span>
        <span className="font-type font-bold text-[10px] tracking-wide text-muted-foreground">
          TO GUESS
        </span>
      </div>

      {/* Prompt */}
      <div className="flex items-baseline justify-between">
        <span className="text-[17px] font-semibold">Where is everyone?</span>
        <span className="font-type font-bold text-[11.5px] tracking-wide text-primary">
          1 PICK
        </span>
      </div>

      {/* Location grid */}
      <div className="grid grid-cols-2 gap-[9px]">
        {locations.map((loc) => {
          const isPicked = picked === loc.name;
          return (
            <button
              key={loc.name}
              onClick={() => setPicked(loc.name)}
              className={`relative chunky border-foreground rounded-xl py-3 px-2 text-sm font-medium shadow-hard-sm transition active:translate-y-1 active:shadow-none ${
                isPicked ? "bg-primary text-white font-semibold" : "bg-card"
              }`}
            >
              {loc.name}
              {isPicked && (
                <span className="absolute -top-2 -right-1.5">
                  <Stamp rotate={10} className="text-[7.5px]">
                    My guess
                  </Stamp>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onLockIn(picked)}
        className="w-full py-[15px] rounded-[17px] chunky border-foreground bg-primary text-white font-semibold text-lg tracking-wide shadow-hard transition active:translate-y-1 active:shadow-none"
      >
        LOCK IN GUESS{picked ? ` → ${picked.toUpperCase()}` : ""}
      </button>
    </div>
  );
}
