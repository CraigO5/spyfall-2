"use client";
import { useState } from "react";
import { CopyIcon, ShareIcon, CheckIcon } from "./Icons";

export default function LobbyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      flashCopied();
    } catch {
      // clipboard unavailable (e.g. insecure context) — ignore
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${code}`;
    const shareData = {
      title: "Spyfall",
      text: `Join my Spyfall lobby — code ${code}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // No Web Share API (most desktops) — fall back to copying the link.
        await navigator.clipboard.writeText(url);
        flashCopied();
      }
    } catch {
      // user dismissed the share sheet — ignore
    }
  };

  return (
    <div className="card bg-secondary flex flex-col items-center gap-3">
      <label
        htmlFor="code"
        className="self-start uppercase tracking-widest font-bold text-muted-foreground text-sm"
      >
        Lobby Code
      </label>
      <div className="flex gap-2">
        {code.split("").map((char, i) => (
          <div
            key={i}
            className="w-12 h-14 flex items-center justify-center bg-white rounded-2xl border-3 text-2xl font-bold"
          >
            {char}
          </div>
        ))}
      </div>

      <div className="flex gap-2 w-full">
        <button
          onClick={handleCopy}
          className="secondary-button bg-white flex items-center justify-center gap-2"
        >
          {copied ? (
            <CheckIcon className="w-6 h-6" />
          ) : (
            <CopyIcon className="w-6 h-6" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={handleShare}
          className="secondary-button bg-accent flex items-center justify-center gap-2"
        >
          <ShareIcon className="w-6 h-6" />
          Share
        </button>
      </div>
    </div>
  );
}
