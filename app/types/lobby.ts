export interface LobbyMessage {
  type: "chat" | "system" | "players" | "start" | string;
  name?: string;
  text?: string;
  icon?: string;
  players?: LobbyPlayer[];
  location?: string | null;
  role?: string;
  startedAt?: number;
  packId?: string;
  target?: string | null;
  votes?: Record<string, string[]>;
  guess?: string | null;
  spy?: string;
  // Optional game modes the host can enable.
  settings?: GameSettings;
  // Per-player secret dealt at round start.
  secretRole?: SecretRole;
  goal?: string;
  allSpy?: boolean;
  // Final verdict.
  result?: RoundResult;
  accused?: string | null;
  winners?: string[];
}

export type GameSettings = {
  allSpy?: boolean;
  joker?: boolean;
  doubleAgent?: boolean;
};

export type SecretRole = "spy" | "joker" | "doubleAgent" | "innocent";
export type RoundResult = "detectives" | "spy" | "joker" | "allSpy";

export interface LobbyPlayer {
  name: string;
  icon?: string;
}

export interface Round {
  location: string | null; // null when you're the spy
  role: string;
  startedAt: number;
  packId: string;
  firstPlayer: string;
  secretRole?: SecretRole;
  goal?: string;
  allSpy?: boolean;
  spy?: string; // the spy's name — only sent to the double agent
}
export interface Vote {
  voter: string;
  voted: string;
}
