import type { ReactNode } from "react";

/** Discount badge: 12px Medium accent text on 10% accent background. */
export function DiscountBadge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent ${className}`}
    >
      {children}
    </span>
  );
}
