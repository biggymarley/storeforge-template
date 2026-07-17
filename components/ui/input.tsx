import type { InputHTMLAttributes, ReactNode } from "react";

interface PillInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  /** Figma variants: gray (#F0F0F0 on white) or white (on black bands). */
  tone?: "gray" | "white";
}

export function PillInput({ icon, tone = "gray", className = "", ...props }: PillInputProps) {
  return (
    <label
      className={`flex items-center gap-3 rounded-full px-4 py-3 ${
        tone === "gray" ? "bg-secondary" : "bg-background"
      } ${className}`}
    >
      {icon ? <span className="shrink-0 text-foreground/40">{icon}</span> : null}
      <input
        className="w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-foreground/40"
        {...props}
      />
    </label>
  );
}
