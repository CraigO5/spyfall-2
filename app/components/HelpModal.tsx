"use client";
import { GAME_DESCRIPTION } from "../config";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";

// Tailwind's preflight strips default heading/list styling, so map each
// markdown element to themed, explicitly-styled components.
const markdownComponents: Components = {
  h2: ({ node, ...props }) => <h2 className="text-3xl font-bold" {...props} />,
  h3: ({ node, ...props }) => (
    <h3 className="text-lg font-bold text-primary mt-1" {...props} />
  ),
  p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
  ul: ({ node, ...props }) => (
    <ul className="list-disc pl-5 flex flex-col gap-1" {...props} />
  ),
  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
};

export default function HelpModal({
  visible = false,
  onClose,
}: {
  visible?: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <div
      className="flex items-center justify-center fixed z-10 bg-black/50 w-full h-full inset-0 p-6 fx-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col bg-card border-3 rounded-2xl shadow-[4px_4px_0px] w-full max-w-lg max-h-[80vh] fx-pop-in"
      >
        <button
          className="circle-button bg-white absolute top-4 right-4 z-10"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-3">
          <Markdown components={markdownComponents}>
            {GAME_DESCRIPTION}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
