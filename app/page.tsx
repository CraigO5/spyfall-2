"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HelpModal from "./components/HelpModal";
import ProfileModal from "./components/ProfileModal";
import CaseFile from "./components/CaseFile";
import { HelpIcon } from "./components/Icons";
import Link from "next/link";
import { randomCode } from "./config";
import { useName } from "./contexts/NameContext";
import Avatar from "./components/Avatar";

export default function Home() {
  const router = useRouter();
  const { name, icon } = useName();
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 px-8 py-5 w-full max-w-3xl mx-auto">
      <div className="flex justify-between w-full">
        <Link href="/">
          <h1 className="font-bold">spyfall.</h1>
        </Link>
        <div
          className="circle-button bg-white"
          onClick={() => setShowHelp(true)}
        >
          <HelpIcon />
        </div>
      </div>
      <CaseFile className="w-80 h-auto fx-float" />

      <h2 className="text-5xl text-center font-semibold">
        One of you is lying...
      </h2>
      <p className="text-muted-foreground text-center">
        Everyone knows the <span className="font-bold">location</span>, except
        for the <span className="font-bold">spy</span>. Ask, lie, and deduce
        your way to victory.{" "}
      </p>

      <div className="flex flex-col gap-3 w-full ">
        <button
          onClick={() => router.push(`${randomCode()}`)}
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
            <Avatar name={name} icon={icon || undefined} isYou size={44} />
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
