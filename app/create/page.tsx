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

export default function Create() {
  const [name, setName] = useState("Craig");
  const [code, setCode] = useState("ABCDE");
  const [players, setPlayers] = useState(["Joe", "James", "Bart", name]);

  return (
    <div className="flex flex-col items-center gap-4 px-8 p-5 max-w-xl mx-auto">
      <div className="flex justify-between w-full">
        <h1 className="font-bold">spyfall.</h1>
        <div className="flex gap-1">
          <div className="circle-button bg-white">S</div>
          <div className="circle-button bg-white">?</div>
        </div>
      </div>

      <div className="primary-button bg-secondary">
        <label htmlFor="code">Code</label>
        <p>{code}</p>

        <div className="flex gap-2">
          <button className="primary-button bg-white">Copy</button>
          <button className="primary-button bg-accent">Share</button>
        </div>
      </div>

      <div className="flex justify-between w-full">
        <label htmlFor="players" className="font-bold">
          Players
        </label>

        <p>{players.length}/100</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {players.map((player, i) => {
          return (
            <div
              key={i}
              className="flex items-center gap-3 font-semibold  justify-between"
            >
              <div className="flex items-center gap-3">
                <p className="profile-circle bg-terra">
                  {player.substring(0, 1)}
                </p>
                <p>{player}</p>
              </div>

              <p>Joining...</p>
            </div>
          );
        })}
      </div>

      <div>
        <label htmlFor="">Options</label>
        <div className="flex flex-col">
          {GAME_OPTIONS.map((option) => {
            return <div key={option.id}>{option.label}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
