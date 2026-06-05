"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CopyIcon, ShareIcon, CheckIcon } from "./Icons";

export default function LobbyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const url =
    typeof window !== "undefined" ? `${window.location.origin}/${code}` : "";

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
          onClick={() => setShowQR((s) => !s)}
          className="secondary-button bg-accent flex items-center justify-center gap-2"
        >
          <ShareIcon className="w-6 h-6" />
          {showQR ? "Hide QR" : "Share"}
        </button>
      </div>

      {showQR && (
        <div className="flex flex-col items-center gap-2 bg-white border-3 rounded-2xl p-4 w-full fx-pop-in">
          <QRCodeSVG value={url} size={168} bgColor="#ffffff" fgColor="#3e342a" />
          <p className="text-xs text-muted-foreground break-all text-center">
            {url}
          </p>
          <p className="text-xs font-bold text-muted-foreground">
            Scan to join the lobby
          </p>
        </div>
      )}
    </div>
  );
}
