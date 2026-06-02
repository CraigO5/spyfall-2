"use client";

import { useState } from "react";

interface Player {
  name: string;
  status: "ready" | "joining";
}

export default function PlayerList() {
  const [name, setName] = useState("Craig");
  const [status, setStatus] = useState("ready");
  const [players, setPlayers] = useState([
    { name: "Joe", status: "joining" },
    { name: "Jim", status: "ready" },
    { name: "Bob", status: "joining" },
  ] as Player[]);

  console.log("Modal start");

  return (
    <div className="w-full">
      <div className="flex justify-between ">
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
              className="flex items-center gap-3 font-semibold justify-between p-2"
            >
              <div className="flex items-center gap-3">
                <p className="profile-circle bg-terra">
                  {player.name.substring(0, 1)}
                </p>
                <p>{player.name}</p>
              </div>

              <p>{player.status}</p>
            </div>
          );
        })}
        <div className="flex items-center gap-3 font-semibold justify-between border-3 rounded-2xl p-2 bg-white">
          <div className="flex items-center gap-3">
            <p className="profile-circle bg-terra">{name.substring(0, 1)}</p>
            <p>{name} (You)</p>
          </div>

          <p>{status}</p>
        </div>
      </div>
    </div>
  );
}
