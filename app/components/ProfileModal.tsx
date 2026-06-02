"use client";
import { MAX_NAME_LENGTH } from "../config";
import { useState } from "react";
import ProfileCircle from "./ProfileCircle";
import { useName } from "../contexts/NameContext";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { name, setName } = useName();
  const [nameInput, setNameInput] = useState(name);

  const handlePressSave = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setName(trimmed);
    onClose();
  };

  const handlePressCancel = () => {
    setNameInput(name);
    onClose();
  };

  return (
    <div
      className="flex gap-2 items-center fixed z-10 justify-center bg-black/50 w-full h-full inset-0 fx-fade-in"
      onClick={() => onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center justify-center bg-card rounded-2xl px-8 py-5 gap-5 w-full mx-10 fx-pop-in"
      >
        <ProfileCircle name={nameInput} size={100} />
        <div>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            className="text-2xl w-full px-5 py-3 border-2 rounded-full bg-white"
          />
          <p className="text-muted-foreground">
            {nameInput.length}/{MAX_NAME_LENGTH}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="secondary-button bg-primary"
            onClick={handlePressSave}
          >
            Save
          </button>
          <button
            className="secondary-button bg-white"
            onClick={handlePressCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
