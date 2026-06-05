"use client";
import { MAX_NAME_LENGTH } from "../config";
import { useState } from "react";
import Avatar from "./Avatar";
import { useName } from "../contexts/NameContext";
import { identityFor } from "../lib/identity";

const EMOJI_CHOICES = [
  "🦊", "🦅", "🐺", "🦉", "🐍", "🦂",
  "🐅", "🦈", "🦇", "🐙", "🦝", "🐻",
  "🕵️", "🎩", "🔍", "🗝️", "🎭", "🃏",
  "👑", "🧪", "🚀", "⚓", "🌙", "🔥",
];

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { name, setName, icon, setIcon } = useName();
  const [nameInput, setNameInput] = useState(name);
  const [iconInput, setIconInput] = useState(icon || identityFor(name).icon);

  const save = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setName(trimmed);
    setIcon(iconInput);
    onClose();
  };

  return (
    <div
      className="flex items-center justify-center fixed z-10 bg-black/50 w-full h-full inset-0 p-6 fx-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center bg-card chunky border-foreground rounded-[22px] shadow-hard w-full max-w-sm p-6 gap-4 fx-pop-in"
      >
        <h2 className="text-2xl font-bold">Edit Profile</h2>

        <Avatar name={nameInput || "Agent"} icon={iconInput} isYou size={90} />

        {/* Codename */}
        <div className="w-full">
          <label className="font-type text-[10px] uppercase tracking-widest text-muted-foreground">
            Codename
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            autoFocus
            className="w-full text-xl font-semibold px-4 py-2.5 chunky border-foreground rounded-2xl bg-white mt-1 outline-none focus:border-primary"
          />
          <p className="text-right text-xs text-muted-foreground mt-1">
            {nameInput.length}/{MAX_NAME_LENGTH}
          </p>
        </div>

        {/* Icon picker */}
        <div className="w-full">
          <label className="font-type text-[10px] uppercase tracking-widest text-muted-foreground">
            Icon
          </label>
          <div className="grid grid-cols-6 gap-2 mt-1.5">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                onClick={() => setIconInput(e)}
                aria-label={`Choose ${e}`}
                className={`aspect-square rounded-xl border-2 text-xl flex items-center justify-center transition ${
                  iconInput === e
                    ? "border-primary bg-primary/10 scale-110"
                    : "border-foreground/15 bg-white hover:border-foreground/40"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 w-full mt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl chunky border-foreground bg-white font-semibold transition active:translate-y-0.5"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 py-2.5 rounded-2xl chunky border-foreground bg-primary text-white font-semibold shadow-hard-sm transition active:translate-y-1 active:shadow-none"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
