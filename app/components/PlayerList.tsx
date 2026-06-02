"use client";

import type { LobbyPlayer } from "../types/lobby";

export default function PlayerList({ players }: { players: LobbyPlayer[] }) {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between">
        <label htmlFor="players" className="font-bold">
          Players
        </label>
        <p>{players.length}/100</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {players.length === 0 ? (
          <p className="text-muted-foreground italic p-2">Loading…</p>
        ) : (
          players.map((player, i) => (
            <div
              key={i}
              className="flex items-center gap-3 font-semibold justify-between p-2"
            >
              <div className="flex items-center gap-3">
                <p className="profile-circle bg-terra">
                  {player.name.substring(0, 1)}
                </p>
                <p>{player.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
