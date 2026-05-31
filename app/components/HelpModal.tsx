"use client";
import { GAME_DESCRIPTION } from "../config";
import Markdown from "react-markdown";
export default function HelpModal({
  visible = false,
  onClose,
}: {
  visible?: boolean;
  onClose: () => void;
}) {
  console.log("Modal start");
  if (!visible) return null;

  return (
    <div
      className="flex gap-2 items-center fixed z-10 justify-center bg-black/50 w-full h-full inset-0"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center justify-center bg-card rounded-2xl px-8 py-5 gap-5 w-full mx-10"
      >
        <Markdown>{GAME_DESCRIPTION}</Markdown>
      </div>
    </div>
  );
}
