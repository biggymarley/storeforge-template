import type { ReactNode } from "react";

/** Figma discount badge: 12px Medium accent text on 10% accent pill. */
export function DiscountBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent ${className}`}
    >
      {children}
    </span>
  );
}
