// Deterministic per-player identity: a stable color, animal icon, and spy
// codename derived from the player's name (so it's consistent everywhere).

const COLORS = ["#E9C39E", "#CFDBB6", "#F0D199", "#E6C2BA", "#BFD3CE", "#EAC9A0"];

const ANIMALS = [
  { icon: "🦊", word: "Fox" },
  { icon: "🦅", word: "Falcon" },
  { icon: "🐺", word: "Wolf" },
  { icon: "🦉", word: "Owl" },
  { icon: "🐍", word: "Viper" },
  { icon: "🦂", word: "Scorpion" },
  { icon: "🐅", word: "Tiger" },
  { icon: "🦈", word: "Shark" },
  { icon: "🦇", word: "Bat" },
  { icon: "🐙", word: "Octopus" },
  { icon: "🦝", word: "Raccoon" },
  { icon: "🐻", word: "Bear" },
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export interface Identity {
  color: string;
  icon: string;
  codename: string;
}

export function identityFor(name: string): Identity {
  const h = hash(name || "agent");
  const color = COLORS[h % COLORS.length];
  const animal = ANIMALS[Math.floor(h / COLORS.length) % ANIMALS.length];
  return { color, icon: animal.icon, codename: `Agent ${animal.word}` };
}
