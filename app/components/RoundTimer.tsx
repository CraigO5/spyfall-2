"use client";

import { useCountdown } from "../hooks/useCountdown";

function ClockIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// Isolated so the per-second tick only re-renders this pill, not the whole
// game screen (27 location chips + suspects).
export default function RoundTimer({
  seconds,
  onTimeUp,
}: {
  seconds: number;
  onTimeUp?: () => void;
}) {
  const { remaining, label, paused, togglePause } = useCountdown(
    seconds,
    onTimeUp,
  );
  const lowTime = remaining <= 30;

  return (
    <button
      onClick={togglePause}
      aria-label={paused ? "Resume timer" : "Pause timer"}
      className={`self-center flex items-center gap-2 bg-card chunky border-foreground rounded-full px-4 py-1.5 shadow-hard transition active:translate-y-1 active:shadow-none ${
        paused ? "border-accent" : ""
      } ${lowTime ? "text-destructive animate-pulse" : ""}`}
    >
      <ClockIcon />
      <span className="text-xl font-bold tabular-nums">{label}</span>
      <span className="font-type text-[10px] text-muted-foreground uppercase tracking-widest">
        {paused ? "Paused" : "Left"}
      </span>
    </button>
  );
}
