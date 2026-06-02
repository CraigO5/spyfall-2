"use client";
import { useState } from "react";
import PlayerList from "../components/PlayerList";
import LobbySettings from "../components/LobbySettings";

export default function Create() {
  const [code, setCode] = useState("ABCDE");
  const [showLobbySettings, setShowLobbySettings] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 px-8 py-5 w-full max-w-3xl mx-auto">
      <div className="flex justify-between w-full">
        <h1 className="font-bold">spyfall.</h1>
        <div className="flex gap-1">
          <div
            className="circle-button bg-white"
            onClick={() => setShowLobbySettings(true)}
          >
            S
          </div>
          <div className="circle-button bg-white">?</div>
        </div>
      </div>

      <div className="primary-button bg-secondary items-center flex flex-col">
        <label htmlFor="code">Lobby Code</label>
        <div className="flex">
          {code.split("").map((char, i) => (
            <div
              key={i}
              className="p-3 bg-white mx-1 my-3 rounded-2xl border-3"
            >
              {char}
            </div>
          ))}
        </div>

        <div className="flex gap-2 w-full">
          <button className="primary-button bg-white">Copy</button>
          <button className="primary-button bg-accent">Share</button>
        </div>
      </div>

      <PlayerList />
      {showLobbySettings && (
        <LobbySettings onClose={() => setShowLobbySettings(false)} />
      )}
      <button className="primary-button bg-primary">Start Game</button>
    </div>
  );
}
