"use client";

import { notFound } from "next/navigation";
import PlayerList from "../components/PlayerList";
import LobbyCode from "../components/LobbyCode";
import Chat from "../components/Chat";
import GameScreen from "../components/GameScreen";
import VoteScreen from "../components/VoteScreen";
import SpyGuessScreen from "../components/SpyGuessScreen";
import SpyGuessWaiting from "../components/SpyGuessWaiting";
import RevealScreen from "../components/RevealScreen";
import LobbySettings from "../components/LobbySettings";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HelpIcon, SettingsIcon } from "../components/Icons";
import { useEffect, useState } from "react";
import { useLobby } from "../hooks/useLobby";
import { useName } from "../contexts/NameContext";
import type { GameSettings } from "../types/lobby";
import { PACKS, packById } from "../data/packs";
import { CODE_LENGTH } from "../config";
const CODE_PATTERN = new RegExp(`^[A-Z0-9]{${CODE_LENGTH}}$`);

// The screen flow within this link
// Lobby wait -> Game screen -> Vote for imposter -> Spy is found out and has to guess what the location is -> Spy reveal
type Phase = "lobby" | "game" | "voting" | "spyGuess" | "reveal"; // These screens should sync for everyone

export default function Create() {
  const { code } = useParams<{ code: string }>();
  const [isHost, setIsHost] = useState(true);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [packId, setPackId] = useState("classic");
  const [settings, setSettings] = useState<GameSettings>({});
  const [showSettings, setShowSettings] = useState(false);
  const { name, icon } = useName();

  const toggleSetting = (id: keyof GameSettings) =>
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));

  const {
    messages,
    send,
    players,
    round,
    startRound,
    resetRound,
    serverPhase,
    votes,
    reveal,
    caughtSpy,
  } = useLobby(code, name, icon);

  // When the server deals a round, everyone drops into the game together.
  useEffect(() => {
    if (round) setPhase("game");
  }, [round]);

  useEffect(() => {
    if (serverPhase) setPhase(serverPhase as Phase);
  }, [serverPhase]);

  if (!CODE_PATTERN.test(code)) {
    return notFound();
  }

  const showChat = phase === "lobby" || phase === "game";
  const isSpy = round?.role === "Spy";
  const pack = packById(round?.packId);
  const youWon = !!reveal && reveal.winners.includes(name);

  // Only surface the "secret goal" banner for the special innocent roles.
  // NOT for all-spy rounds — revealing that would spoil the whole gag; an
  // all-spy player should look exactly like a normal lone spy until the reveal.
  const special =
    round?.secretRole === "joker" || round?.secretRole === "doubleAgent";
  const goal =
    special && round?.secretRole === "doubleAgent" && round?.spy
      ? `${round.goal} The spy is ${round.spy}.`
      : special
        ? round?.goal
        : undefined;

  return (
    <div className="flex flex-col items-center gap-4 px-8 py-5 w-full max-w-3xl mx-auto">
      <div className="flex justify-between w-full">
        <Link href="/">
          <h1 className="font-bold">spyfall.</h1>
        </Link>
        <div className="flex gap-1">
          {isHost && phase === "lobby" && (
            <button
              className="circle-button bg-white"
              onClick={() => setShowSettings(true)}
              aria-label="Lobby settings"
            >
              <SettingsIcon />
            </button>
          )}
          <div className="circle-button bg-white">
            <HelpIcon />
          </div>
        </div>
      </div>

      {showSettings && (
        <LobbySettings
          settings={settings}
          onToggle={toggleSetting}
          onClose={() => setShowSettings(false)}
        />
      )}

      {phase === "lobby" && (
        <>
          <LobbyCode code={code} />
          <PlayerList players={players} />
          {isHost ? (
            <>
              <div className="w-full">
                <label className="uppercase tracking-widest font-bold text-muted-foreground text-sm">
                  Location Pack
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PACKS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPackId(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 font-semibold text-sm transition active:translate-y-0.5 ${
                        packId === p.id
                          ? "bg-primary text-white border-foreground shadow-hard-sm"
                          : "bg-card border-foreground/20"
                      }`}
                    >
                      <span>{p.icon}</span> {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="primary-button bg-primary"
                onClick={() => startRound(packId, settings)}
              >
                Start Game
              </button>
            </>
          ) : (
            <p className="font-bold text-muted-foreground">
              Waiting for host to start...
            </p>
          )}
        </>
      )}

      {phase === "game" && (
        <GameScreen
          players={players}
          location={isSpy ? "???" : (round?.location ?? "Loading…")}
          role={round?.role ?? "Loading…"}
          onTimeUp={() => send({ type: "voting" })}
          onCallVote={() => send({ type: "voting" })}
          isSpy={isSpy}
          onGuess={() => setPhase("spyGuess")}
          locations={pack.locations}
          firstPlayer={round?.firstPlayer || ""}
          goal={goal}
        />
      )}

      {phase === "voting" && (
        <VoteScreen
          players={players}
          myName={name}
          send={send}
          votes={votes}
          // Force the server to resolve now; it decides everyone's next screen.
          onLockIn={() => send({ type: "lockVotes" })}
        />
      )}

      {phase === "spyGuess" &&
        (isSpy ? (
          <SpyGuessScreen
            locations={pack.locations}
            onLockIn={(guess) => send({ type: "spyGuess", guess })}
          />
        ) : (
          <SpyGuessWaiting spyName={caughtSpy} />
        ))}

      {phase === "reveal" && reveal && (
        <RevealScreen
          result={reveal.result}
          youWon={youWon}
          spyName={reveal.spy || name}
          accused={reveal.accused}
          location={reveal.location}
          onPlayAgain={() => {
            resetRound();
            startRound(packId, settings);
          }}
          onBackToLobby={() => {
            resetRound();
            setPhase("lobby");
          }}
        />
      )}

      {showChat && (
        <Chat
          messages={messages}
          onSend={(text) => send({ type: "chat", name, text })}
        />
      )}
    </div>
  );
}
