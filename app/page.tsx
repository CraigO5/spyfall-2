"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Markdown from "react-markdown";
import ProfileCircle from "./components/ProfileCircle";
import HelpModal from "./components/HelpModal";
import ProfileModal from "./components/ProfileModal";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("Craig");
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 px-8 py-5 w-full max-w-3xl mx-auto">
      <div className="flex justify-between w-full">
        <h1 className="font-bold">spyfall.</h1>
        <div
          className="circle-button bg-white"
          onClick={() => {
            setShowHelp(true);
            console.log("Open Modal");
          }}
        >
          ?
        </div>
      </div>
      <h2 className="text-5xl text-center font-semibold">
        One of you is lying...
      </h2>
      <p className="text-gray">
        Everyone knows the <span className="font-bold">location</span>, except
        for the <span className="font-bold">spy</span>. Ask, lie, and deduce
        your way to victory.{" "}
      </p>

      <div className="flex flex-col gap-3 w-full ">
        <button
          onClick={() => router.push("/create")}
          className="primary-button bg-primary"
        >
          Create Game
        </button>
        <button
          onClick={() => router.push("/join")}
          className="primary-button bg-white"
        >
          Join Game
        </button>
      </div>

      <div className="flex items-center flex-col">
        <div className="flex flex-row items-center gap-2 text-xl">
          <p>
            Welcome, <span className="font-bold text-terra"> {name}</span>
          </p>
          <div className="flex gap-2 items-center">
            <p className="profile-circle bg-terra">{name.substring(0, 1)}</p>
          </div>
        </div>
        <button className="underline" onClick={() => setShowProfile(true)}>
          Edit Profile
        </button>
      </div>

      {showHelp && (
        <HelpModal visible={true} onClose={() => setShowHelp(false)} />
      )}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
