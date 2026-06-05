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
  outcome?: "caught" | "escaped";
}

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
}
export interface Vote {
  voter: string;
  voted: string;
}
