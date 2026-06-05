import { identityFor } from "../lib/identity";

// Cozy Caper avatar: a colored circle (stable per name) with a chunky ink
// border, showing the player's icon. "You" uses the terracotta fill.
export default function Avatar({
  name,
  isYou = false,
  size = 40,
  index, // accepted for back-compat; color derives from the name
  icon,
}: {
  name: string;
  isYou?: boolean;
  size?: number;
  index?: number;
  icon?: string;
}) {
  void index;
  const id = identityFor(name);
  const glyph = icon || id.icon; // user-chosen icon wins, else name-derived

  return (
    <div
      className="rounded-full border-[2.5px] border-foreground flex items-center justify-center shrink-0 leading-none"
      style={{
        width: size,
        height: size,
        background: isYou ? "var(--color-primary)" : id.color,
        fontSize: size * 0.55,
      }}
    >
      {glyph}
    </div>
  );
}
