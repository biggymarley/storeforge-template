"use client";

import Image from "next/image";
import Link from "next/link";
import { IconTrash } from "@/components/icons";
import { useCart } from "@/components/cart/cart-provider";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/shopify/types";

interface CartLineRowProps {
  line: CartLine;
  /** Mini-cart uses smaller thumbs/type than the /cart page (Figma 31:403). */
  compact?: boolean;
  /** Close the mini-cart when navigating to the product. */
  onNavigate?: () => void;
}

export function CartLineRow({ line, compact = false, onNavigate }: CartLineRowProps) {
  const { updateLine, removeLine } = useCart();
  const { merchandise } = line;
  const options = merchandise.selectedOptions.filter((option) => option.value !== "Default Title");
  const image = merchandise.product.featuredImage;

  return (
    <div className="flex gap-3 sm:gap-3.5">
      <Link
        href={`/products/${merchandise.product.handle}`}
        onClick={onNavigate}
        className={`relative shrink-0 overflow-hidden rounded-lg bg-secondary ${
          compact ? "size-20" : "size-20 sm:size-[124px]"
        }`}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? merchandise.product.title}
            fill
            sizes="124px"
            className="object-cover"
          />
        ) : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="min-w-0 pr-8">
          <Link
            href={`/products/${merchandise.product.handle}`}
            onClick={onNavigate}
            className={`block truncate font-bold hover:underline ${compact ? "text-sm" : "text-base sm:text-xl"}`}
          >
            {merchandise.product.title}
          </Link>
          {options.map((option) => (
            <p key={option.name} className={`mt-0.5 ${compact ? "text-xs" : "text-sm"}`}>
              {option.name}: <span className="text-muted">{option.value}</span>
            </p>
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
          <span className={`font-bold ${compact ? "text-base" : "text-base sm:text-2xl"}`}>
            {formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
          </span>
          <QuantityStepper
            size="sm"
            quantity={line.quantity}
            onDecrement={() => updateLine(line.id, line.quantity - 1)}
            onIncrement={() => updateLine(line.id, line.quantity + 1)}
          />
        </div>
      </div>
      <button
        type="button"
        aria-label={`Remove ${merchandise.product.title} from cart`}
        onClick={() => removeLine(line.id)}
        className="-ml-8 self-start text-accent transition-opacity hover:opacity-70"
      >
        <IconTrash width={compact ? 20 : 24} height={compact ? 20 : 24} />
      </button>
    </div>
  );
}
