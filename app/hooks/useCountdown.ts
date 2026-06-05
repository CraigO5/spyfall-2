"use client";
import { useEffect, useRef, useState } from "react";

// Counts down once per second; fires onEnd exactly once at 0. Pausable.
// Pass `startedAt` (a server epoch-ms timestamp) to sync the deadline across
// clients and survive refreshes: remaining is derived from the wall clock
// instead of counting from mount. Without it, it just decrements from `seconds`.
export function useCountdown(
  seconds: number,
  onEnd?: () => void,
  startedAt?: number,
) {
  const remainingFor = () =>
    startedAt
      ? Math.max(0, Math.ceil(seconds - (Date.now() - startedAt) / 1000))
      : seconds;

  const [remaining, setRemaining] = useState(remainingFor);
  const [paused, setPaused] = useState(false);
  const ended = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  // Re-baseline when a new round (startedAt) or duration arrives.
  useEffect(() => {
    ended.current = false;
    setRemaining(remainingFor());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, seconds]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setRemaining((s) => (startedAt ? remainingFor() : Math.max(0, s - 1))),
      1000,
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, startedAt, seconds]);

  useEffect(() => {
    if (remaining === 0 && !ended.current) {
      ended.current = true;
      onEndRef.current?.();
    }
  }, [remaining]);

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");
  return {
    remaining,
    label: `${mm}:${ss}`,
    paused,
    togglePause: () => setPaused((p) => !p),
  };
}
