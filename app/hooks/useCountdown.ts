"use client";
import { useEffect, useRef, useState } from "react";

// Counts down once per second; fires onEnd exactly once at 0. Pausable.
export function useCountdown(seconds: number, onEnd?: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const [paused, setPaused] = useState(false);
  const ended = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [paused]);

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
