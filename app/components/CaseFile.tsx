export default function CaseFile({
  className = "w-56 h-auto",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 250 190"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="A case file with a magnifying glass, stamped top secret"
    >
      {/* hard drop shadow */}
      <rect
        x="56"
        y="80"
        width="150"
        height="100"
        rx="18"
        className="fill-foreground"
        opacity="0.85"
      />

      {/* folder tab (behind body) */}
      <rect
        x="64"
        y="50"
        width="82"
        height="36"
        rx="12"
        className="fill-secondary stroke-foreground"
        strokeWidth="3.5"
      />

      {/* folder body */}
      <rect
        x="50"
        y="72"
        width="150"
        height="100"
        rx="18"
        className="fill-secondary stroke-foreground"
        strokeWidth="3.5"
      />

      {/* magnifying glass */}
      <circle
        cx="112"
        cy="118"
        r="26"
        className="fill-card stroke-primary"
        strokeWidth="9"
      />
      <line
        x1="131"
        y1="137"
        x2="151"
        y2="157"
        className="stroke-primary"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* TOP SECRET stamp */}
      <g transform="rotate(-8 185 60)">
        <rect
          x="146"
          y="46"
          width="80"
          height="28"
          rx="6"
          className="stroke-destructive"
          strokeWidth="2.5"
          strokeDasharray="5 4"
        />
        <text
          x="186"
          y="63.5"
          textAnchor="middle"
          className="fill-destructive"
          fontSize="10.5"
          fontWeight="700"
          letterSpacing="2"
        >
          TOP SECRET
        </text>
      </g>
    </svg>
  );
}
