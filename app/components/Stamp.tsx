import type { ReactNode } from "react";

// Rubber-stamp label: Courier, uppercase, chunky colored border, rotated.
export default function Stamp({
  children,
  color = "destructive",
  rotate = -7,
  className = "text-[11px]",
}: {
  children: ReactNode;
  color?: "destructive" | "foreground" | "primary" | "pale";
  rotate?: number;
  className?: string;
}) {
  const colorClass = {
    destructive: "text-destructive border-destructive",
    foreground: "text-foreground border-foreground",
    primary: "text-primary border-primary",
    pale: "text-[#E8A88F] border-[#E8A88F]",
  }[color];

  return (
    <span
      className={`inline-block font-type font-bold uppercase tracking-wider border-[2.5px] rounded-[5px] px-2 py-[3px] opacity-85 leading-none ${colorClass} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
