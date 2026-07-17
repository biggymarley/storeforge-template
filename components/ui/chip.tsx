import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** Figma: filter chips are 14px; PDP size chips are larger (16px, px-6 py-3). */
  size?: "md" | "lg";
}

/** Figma size/filter chip: #F0F0F0 pill, 14px, 60% text; selected = black pill, white text. */
export function Chip({ selected = false, size = "md", className = "", children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`rounded-full transition-colors ${
        size === "lg" ? "px-6 py-3 text-base" : "px-5 py-2.5 text-sm"
      } ${
        selected
          ? "bg-primary font-medium text-background"
          : "bg-secondary text-muted hover:text-foreground"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
