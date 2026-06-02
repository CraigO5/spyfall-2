"use client";

import { notFound } from "next/navigation";
import PlayerList from "../components/PlayerList";
import LobbyCode from "../components/LobbyCode";
import Chat from "../components/Chat";
import GameScreen from "../components/GameScreen";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HelpIcon } from "../components/Icons";
import { useState } from "react";
import { useLobby } from "../hooks/useLobby";
import { useName } from "../contexts/NameContext";
import { CODE_LENGTH } from "../config";
const CODE_PATTERN = new RegExp(`^[A-Z0-9]{${CODE_LENGTH}}$`);

export default function Create() {
  const { code } = useParams<{ code: string }>();
  const [isHost, setIsHost] = useState(true);
  const [started, setStarted] = useState(false);
  const { name } = useName();

  const { messages, send, players } = useLobby(code, name);

  if (!CODE_PATTERN.test(code)) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center gap-4 px-8 py-5 w-full max-w-3xl mx-auto">
      <div className="flex justify-between w-full">
        <Link href="/">
          <h1 className="font-bold">spyfall.</h1>
        </Link>
        <div className="flex gap-1">
          <div className="circle-button bg-white">
            <HelpIcon />
          </div>
        </div>
      </div>

      {started ? (
        <GameScreen players={players} />
      ) : (
        <>
          <LobbyCode code={code} />

          <PlayerList players={players} />
          {isHost ? (
            <button
              className="primary-button bg-primary"
              onClick={() => setStarted(true)}
            >
              Start Game
            </button>
          ) : (
            <p className="font-bold text-muted-foreground">
              Waiting for host to start...
            </p>
          )}
        </>
      )}

      <Chat
        messages={messages}
        onSend={(text) => send({ type: "chat", name, text })}
      />
    </div>
  );
}
