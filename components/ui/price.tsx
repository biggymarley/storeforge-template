import { DiscountBadge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";

interface PriceProps {
  price: Money;
  compareAt?: Money | null;
  /** Figma: 24px on cards, 32px on PDP. */
  size?: "md" | "lg";
  className?: string;
}

/** Price row: bold price, struck-through compare-at at 30% foreground, computed -% badge. */
export function Price({ price, compareAt, size = "md", className = "" }: PriceProps) {
  const amount = Number.parseFloat(price.amount);
  const compareAmount = compareAt ? Number.parseFloat(compareAt.amount) : 0;
  const discounted = compareAmount > amount;
  const percentOff = discounted ? Math.round(((compareAmount - amount) / compareAmount) * 100) : 0;
  const sizeClass = size === "lg" ? "text-[2rem]" : "text-2xl";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className={`font-bold ${sizeClass}`}>{formatPrice(price.amount, price.currencyCode)}</span>
      {discounted && compareAt ? (
        <>
          <s className={`font-bold text-foreground/30 ${sizeClass}`}>
            {formatPrice(compareAt.amount, compareAt.currencyCode)}
          </s>
          <DiscountBadge>-{percentOff}%</DiscountBadge>
        </>
      ) : null}
    </div>
  );
}
