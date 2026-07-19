import { DiscountBadge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";

interface PriceProps {
  price: Money;
  compareAt?: Money | null;
  /** Figma: 24px on cards, 32px on PDP. */
  size?: "md" | "lg";
  /** "badge": stacked price + %-off badge, compare-at below (cards, hero). "save": inline compare-at, price, "Save X" (PDP). */
  variant?: "badge" | "save";
  className?: string;
}

/** Price row: bold price, struck-through compare-at, computed discount. */
export function Price({ price, compareAt, size = "md", variant = "badge", className = "" }: PriceProps) {
  const amount = Number.parseFloat(price.amount);
  const compareAmount = compareAt ? Number.parseFloat(compareAt.amount) : 0;
  const discounted = compareAmount > amount;
  const sizeClass = size === "lg" ? "text-[2rem]" : "text-2xl";

  if (variant === "save") {
    return (
      <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        {discounted && compareAt ? (
          <s className="text-lg font-medium text-muted">{formatPrice(compareAt.amount, compareAt.currencyCode)}</s>
        ) : null}
        <span className={`font-bold ${sizeClass}`}>{formatPrice(price.amount, price.currencyCode)}</span>
        {discounted && compareAt ? (
          <span className="font-medium text-accent">
            Save {formatPrice(compareAmount - amount, price.currencyCode)}
          </span>
        ) : null}
      </div>
    );
  }

  const percentOff = discounted ? Math.round(((compareAmount - amount) / compareAmount) * 100) : 0;

  return (
    <div className={className}>
      <div className="flex items-center gap-2.5">
        <span className={`font-bold ${sizeClass}`}>{formatPrice(price.amount, price.currencyCode)}</span>
        {discounted ? <DiscountBadge>{percentOff}%</DiscountBadge> : null}
      </div>
      {discounted && compareAt ? (
        <s className="mt-1 block text-sm font-medium text-muted">
          {formatPrice(compareAt.amount, compareAt.currencyCode)}
        </s>
      ) : null}
    </div>
  );
}
