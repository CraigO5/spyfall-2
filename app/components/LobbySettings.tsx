"use client";

const GAME_OPTIONS = [
  {
    id: "allSpy",
    label: "All Spies",
    description: "Enable the chance to have everyone as an Spy",
  },
  {
    id: "joker",
    label: "Joker",
    description:
      "Enable the chance to include Joker as an additional role. The Joker has the goal of being voted out, which results in a win for the Joker only.",
  },
  {
    id: "doubleAgent",
    label: "Double Agent",
    description:
      "Enable the chance to include Double Agent as an additional role. The Double Agent has the goal of keeping themself and the Spy from being voted out, which results in a win for both of them.",
  },
];

export default function LobbySettings({ onClose }: { onClose: () => void }) {
  console.log("Modal start");

  return (
    <div
      className="flex gap-2 items-center fixed z-10 justify-center bg-black/50 w-full h-full inset-0"
      onClick={onClose}
    >
      <div className="bg-white" onClick={(e) => e.stopPropagation()}>
        <label htmlFor="">Lobby Settings</label>
        <div className="flex flex-col">
          {GAME_OPTIONS.map((option) => {
            return <div key={option.id}>{option.label}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
