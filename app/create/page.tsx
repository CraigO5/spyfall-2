"use client";
import { useState } from "react";
import PlayerList from "../components/PlayerList";
import LobbySettings from "../components/LobbySettings";
import LobbyCode from "../components/LobbyCode";
import { SettingsIcon, HelpIcon } from "../components/Icons";
import Link from "next/link";

export default function Create() {
  const [code, setCode] = useState("ABCDE");
  const [showLobbySettings, setShowLobbySettings] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 px-8 py-5 w-full max-w-3xl mx-auto">
      <div className="flex justify-between w-full">
        <Link href="/">
          <h1 className="font-bold">spyfall.</h1>
        </Link>
        <div className="flex gap-1">
          <div
            className="circle-button bg-white"
            onClick={() => setShowLobbySettings(true)}
          >
            <SettingsIcon />
          </div>
          <div className="circle-button bg-white">
            <HelpIcon />
          </div>
        </div>
      </div>

      <LobbyCode code={code} />

      <PlayerList />
      {showLobbySettings && (
        <LobbySettings onClose={() => setShowLobbySettings(false)} />
      )}
    </div>
  );
}
