"use client";

import { IconMinus, IconPlus } from "@/components/icons";

interface QuantityStepperProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  /** Figma: 24px icons on PDP, 20px compact in cart lines. */
  size?: "md" | "sm";
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
  size = "md",
  disabled = false,
  className = ""
}: QuantityStepperProps) {
  const icon = size === "md" ? 24 : 20;
  const pad = size === "md" ? "px-5 py-4" : "px-5 py-3";

  return (
    <div className={`flex items-center justify-between gap-5 rounded-full bg-secondary ${pad} ${className}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onDecrement}
        disabled={disabled || quantity <= 1}
        className="text-foreground transition-opacity hover:opacity-60 disabled:opacity-30"
      >
        <IconMinus width={icon} height={icon} />
      </button>
      <span className={`min-w-4 text-center font-medium ${size === "md" ? "text-base" : "text-sm"}`}>{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={onIncrement}
        disabled={disabled}
        className="text-foreground transition-opacity hover:opacity-60 disabled:opacity-30"
      >
        <IconPlus width={icon} height={icon} />
      </button>
    </div>
  );
}
