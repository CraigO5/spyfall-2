"use client";
import { useState } from "react";
import { SendIcon } from "./Icons";
import type { LobbyMessage } from "../types/lobby";

export default function Chat({
  messages,
  onSend,
}: {
  messages: LobbyMessage[];
  onSend: (text: string) => void;
}) {
  const [inputMessage, setInputMessage] = useState("");

  const send = () => {
    const text = inputMessage.trim();
    if (!text) return;
    onSend(text);
    setInputMessage("");
  };

  return (
    <div className="card bg-secondary flex flex-col gap-3">
      <label htmlFor="chat" className="uppercase font-bold text-2xl mx-auto">
        Chat
      </label>

      <div className="flex flex-col gap-1">
        {messages.map((msg, i) =>
          msg.type === "system" ? (
            <div key={i} className="flex items-center gap-2 px-1 py-1">
              <div className="flex-1 h-px bg-muted-foreground/30" />
              <p className="text-xs italic text-muted-foreground shrink-0">
                {msg.text}
              </p>
              <div className="flex-1 h-px bg-muted-foreground/30" />
            </div>
          ) : (
            <p key={i} className="px-1 leading-relaxed">
              <span className="font-bold text-terra">{msg.name}:</span>{" "}
              {msg.text}
            </p>
          ),
        )}
      </div>

      <div className="flex gap-2 items-center w-full border-3 rounded-full bg-white pl-4 pr-2 py-2 border-muted-foreground text-muted-foreground">
        <input
          type="text"
          className="w-full bg-transparent outline-none"
          placeholder="Message…"
          onKeyDown={(e) => e.key === "Enter" && send()}
          onChange={(e) => setInputMessage(e.target.value)}
          value={inputMessage}
        />
        <button
          onClick={send}
          className="circle-button bg-primary text-primary-foreground shrink-0"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
