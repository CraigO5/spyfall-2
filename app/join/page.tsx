"use client";
import { useState } from "react";

export default function Join() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="flex flex-col">
      <label htmlFor="name">Name </label>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="code">Code </label>
      <input
        type="text"
        placeholder="ABCD"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
    </div>
  );
}
