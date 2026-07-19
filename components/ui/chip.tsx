import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** Figma: filter chips are 14px; PDP size chips are larger (16px, px-6 py-3). */
  size?: "md" | "lg";
  /** "pill": filled #F0F0F0 pill (filters, sizes). "outline": bordered box (PDP variant selectors). */
  variant?: "pill" | "outline";
}

/** Figma size/filter chip: #F0F0F0 pill, 14px, 60% text; selected = black pill, white text. */
export function Chip({ selected = false, size = "md", variant = "pill", className = "", children, ...props }: ChipProps) {
  const sizeClass = size === "lg" ? "px-6 py-3 text-base" : "px-5 py-2.5 text-sm";
  const variantClass =
    variant === "outline"
      ? `rounded-card border ${selected ? "border-primary" : "border-border"} bg-background text-foreground`
      : `rounded-full ${selected ? "bg-primary font-medium text-background" : "bg-secondary text-muted hover:text-foreground"}`;

  return (
    <button type="button" aria-pressed={selected} className={`transition-colors ${sizeClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
