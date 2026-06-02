"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CODE_LENGTH } from "../config";

export default function Join() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const isComplete = code.length === CODE_LENGTH;

  const submit = () => {
    if (isComplete) router.push(`/${code}`);
  };

  return (
    <div className="flex flex-col items-center gap-6 px-8 py-5 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center w-full relative">
        <button
          className="circle-button bg-white"
          onClick={() => router.push("/")}
        >
          B
        </button>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-4xl font-bold">Enter a lobby code</h2>
        <p className="text-muted-foreground">
          Ask the host for the {CODE_LENGTH}-character code in their lobby.
        </p>
      </div>

      {/* Code input */}
      <input
        type="text"
        value={code}
        onChange={(e) =>
          setCode(
            e.target.value
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")
              .slice(0, CODE_LENGTH),
          )
        }
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder={"ABCDE"}
        maxLength={CODE_LENGTH}
        className="w-full text-center text-4xl font-bold tracking-[0.4em] uppercase bg-card border-3 rounded-2xl shadow-[4px_4px_0px] px-5 py-4 placeholder:text-muted-foreground/40 focus:border-primary outline-none"
      />

      {/* Enter */}
      <button
        className="primary-button bg-primary disabled:opacity-50"
        disabled={!isComplete}
        onClick={submit}
      >
        Join
      </button>
    </div>
  );
}
