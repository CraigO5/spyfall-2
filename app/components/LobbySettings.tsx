"use client";

import { useState } from "react";

const GAME_OPTIONS = [
  {
    id: "allSpy",
    label: "All Spies",
    description: "Enable the chance to have everyone as an Spy",
  },
  {
    id: "joker",
    label: "Joker",
    description:
      "Enable the chance to include Joker as an additional role. The Joker has the goal of being voted out, which results in a win for the Joker only.",
  },
  {
    id: "doubleAgent",
    label: "Double Agent",
    description:
      "Enable the chance to include Double Agent as an additional role. The Double Agent has the goal of keeping themself and the Spy from being voted out, which results in a win for both of them.",
  },
];

export default function LobbySettings({ onClose }: { onClose: () => void }) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const toggle = (id: string) =>
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div
      className="flex gap-2 items-center fixed z-10 justify-center bg-black/50 w-full h-full inset-0 fx-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col bg-card rounded-2xl px-8 py-5 gap-4 w-full mx-10 max-w-md max-h-[80vh] overflow-y-auto fx-pop-in"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Lobby Settings</h2>
          <button className="circle-button bg-white" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {GAME_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="flex items-start justify-between gap-3 border-3 rounded-2xl p-3 bg-white"
            >
              <div>
                <p className="font-bold">{option.label}</p>
                <p className="text-muted-foreground text-sm">
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => toggle(option.id)}
                className={`shrink-0 w-12 h-7 rounded-full border-3 flex items-center px-0.5 transition ${
                  enabled[option.id]
                    ? "bg-primary justify-end"
                    : "bg-white justify-start"
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-foreground" />
              </button>
            </div>
          ))}
        </div>

        <button className="secondary-button bg-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
