"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

export function StepperDemo({ size = "md" }: { size?: "md" | "sm" }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <QuantityStepper
      quantity={quantity}
      size={size}
      onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
      onIncrement={() => setQuantity((q) => q + 1)}
    />
  );
}
