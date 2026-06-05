// Brand glyph: a ring + a rotated handle, drawn in code.
export default function Magnifier({ size = 24 }: { size?: number }) {
  const r = size * 0.62;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full box-border"
        style={{
          width: r,
          height: r,
          border: `${size * 0.1}px solid var(--color-primary)`,
          background: "var(--color-background)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: size * 0.13,
          height: size * 0.4,
          borderRadius: size * 0.08,
          background: "var(--color-primary)",
          transform: "rotate(-45deg)",
          transformOrigin: "top left",
          left: r * 0.82,
          top: r * 0.82,
        }}
      />
    </div>
  );
}
