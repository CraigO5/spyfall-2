"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "spyfall:name";

interface NameContextValue {
  name: string;
  setName: (name: string) => void;
}

const NameContext = createContext<NameContextValue>({
  name: "",
  setName: () => {},
});

export function NameProvider({ children }: { children: ReactNode }) {
  // Empty until we've read localStorage on the client — keeps the server and
  // first client render identical (no hydration mismatch).
  const [name, setNameState] = useState("");

  useEffect(() => {
    setNameState(localStorage.getItem(STORAGE_KEY) || "Agent");
  }, []);

  const setName = (value: string) => {
    setNameState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return (
    <NameContext.Provider value={{ name, setName }}>
      {children}
    </NameContext.Provider>
  );
}

export function useName() {
  return useContext(NameContext);
}
