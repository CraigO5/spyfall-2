export interface LobbyMessage {
  type: "chat" | "system" | string;
  name?: string;
  text?: string;
}

export interface LobbyPlayer {
  name: string;
}
