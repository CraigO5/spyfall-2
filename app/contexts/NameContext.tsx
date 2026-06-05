"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const NAME_KEY = "spyfall:name";
const ICON_KEY = "spyfall:icon";

interface NameContextValue {
  name: string;
  setName: (name: string) => void;
  icon: string;
  setIcon: (icon: string) => void;
}

const NameContext = createContext<NameContextValue>({
  name: "",
  setName: () => {},
  icon: "",
  setIcon: () => {},
});

export function NameProvider({ children }: { children: ReactNode }) {
  // Empty until we've read localStorage on the client (no hydration mismatch).
  const [name, setNameState] = useState("");
  const [icon, setIconState] = useState("");

  useEffect(() => {
    setNameState(localStorage.getItem(NAME_KEY) || "Agent");
    setIconState(localStorage.getItem(ICON_KEY) || "");
  }, []);

  const setName = (value: string) => {
    setNameState(value);
    localStorage.setItem(NAME_KEY, value);
  };

  const setIcon = (value: string) => {
    setIconState(value);
    localStorage.setItem(ICON_KEY, value);
  };

  return (
    <NameContext.Provider value={{ name, setName, icon, setIcon }}>
      {children}
    </NameContext.Provider>
  );
}

export function useName() {
  return useContext(NameContext);
}
