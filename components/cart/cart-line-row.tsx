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
  const price = formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode);

  // Mini-cart keeps the compact icon-remove layout (space-constrained slide-over).
  if (compact) {
    return (
      <div className="flex gap-3 sm:gap-3.5">
        <Link
          href={`/products/${merchandise.product.handle}`}
          onClick={onNavigate}
          className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary"
        >
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? merchandise.product.title}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : null}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="min-w-0 pr-8">
            <Link
              href={`/products/${merchandise.product.handle}`}
              onClick={onNavigate}
              className="block truncate text-sm font-bold hover:underline"
            >
              {merchandise.product.title}
            </Link>
            {options.map((option) => (
              <p key={option.name} className="mt-0.5 text-xs">
                {option.name}: <span className="text-muted">{option.value}</span>
              </p>
            ))}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <span className="text-base font-bold">{price}</span>
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
          <IconTrash width={20} height={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Link
        href={`/products/${merchandise.product.handle}`}
        onClick={onNavigate}
        className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-secondary sm:size-[124px]"
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
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/products/${merchandise.product.handle}`}
              onClick={onNavigate}
              className="block font-bold hover:underline text-base sm:text-xl"
            >
              {merchandise.product.title}
            </Link>
            {options.map((option) => (
              <p key={option.name} className="mt-1 text-sm">
                <span className="font-medium">{option.name}:</span>{" "}
                <span className="text-muted">{option.value}</span>
              </p>
            ))}
          </div>
          <span className="shrink-0 text-base font-bold sm:text-xl">{price}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper
            size="sm"
            quantity={line.quantity}
            onDecrement={() => updateLine(line.id, line.quantity - 1)}
            onIncrement={() => updateLine(line.id, line.quantity + 1)}
          />
          <button
            type="button"
            aria-label={`Remove ${merchandise.product.title} from cart`}
            onClick={() => removeLine(line.id)}
            className="text-sm text-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
