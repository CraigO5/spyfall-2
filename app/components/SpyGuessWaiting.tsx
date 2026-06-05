"use client";

import Stamp from "./Stamp";

// Shown to everyone EXCEPT the spy while the caught spy makes their guess.
export default function SpyGuessWaiting({ spyName }: { spyName: string }) {
  return (
    <div className="w-full flex flex-col gap-[18px] fx-pop-in">
      <div className="relative overflow-hidden bg-foreground rounded-[22px] px-5 pt-5 pb-[18px] text-center">
        <div className="absolute top-3 right-3">
          <Stamp color="pale" rotate={9} className="text-[9px]">
            Caught
          </Stamp>
        </div>
        <p className="font-type text-[10.5px] tracking-[0.25em] text-[#C9B89B]">
          THE SPY WAS EXPOSED
        </p>
        <h1 className="text-3xl font-semibold text-card mt-1.5 leading-none">
          {spyName || "The spy"} is the spy.
        </h1>
        <p className="font-body font-bold text-[13.5px] text-[#D8C8AC] mt-2 max-w-[260px] mx-auto">
          They get one chance to name the location. Guess right and they steal
          the win.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2.5 bg-secondary chunky border-foreground rounded-2xl py-3 shadow-hard">
        <span className="w-[9px] h-[9px] rounded-full bg-primary pulse-dot" />
        <span className="font-body font-extrabold text-[15px]">
          Waiting for {spyName || "the spy"} to guess…
        </span>
      </div>
    </div>
  );
}
