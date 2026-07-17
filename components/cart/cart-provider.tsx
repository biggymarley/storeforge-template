"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode
} from "react";
import { useToast } from "@/components/ui/toast";
import { removeCartLine, updateCartLine } from "@/lib/shopify/cart-actions";
import type { Cart, CartLine } from "@/lib/shopify/types";

type OptimisticAction =
  | { type: "update"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string };

function recalculate(cart: Cart, lines: CartLine[]): Cart {
  const subtotal = lines.reduce((sum, line) => sum + Number(line.cost.totalAmount.amount), 0);
  const currencyCode =
    lines[0]?.cost.totalAmount.currencyCode ?? cart.cost.subtotalAmount.currencyCode;
  return {
    ...cart,
    lines: { ...cart.lines, edges: lines.map((node) => ({ node })) },
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    cost: {
      ...cart.cost,
      subtotalAmount: { amount: String(subtotal), currencyCode },
      totalAmount: { amount: String(subtotal), currencyCode }
    }
  };
}

function optimisticReducer(cart: Cart | null, action: OptimisticAction): Cart | null {
  if (!cart) return cart;
  const lines = cart.lines.edges.map((edge) => edge.node);

  if (action.type === "remove") {
    return recalculate(cart, lines.filter((line) => line.id !== action.lineId));
  }
  return recalculate(
    cart,
    lines.map((line) =>
      line.id === action.lineId
        ? {
            ...line,
            quantity: action.quantity,
            cost: {
              ...line.cost,
              totalAmount: {
                ...line.cost.totalAmount,
                amount: String(Number(line.cost.amountPerQuantity.amount) * action.quantity)
              }
            }
          }
        : line
    )
  );
}

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  updateLine: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  pending: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

/**
 * Cart plan (ARCHITECTURE-DECISIONS): the layout resolves getCart() and
 * passes it down; useOptimistic layers instant quantity/remove feedback over
 * it while the server action + revalidation catch up. One provider instance
 * means the badge, mini-cart and /cart page share the same optimistic state.
 * No client state library (spec §5).
 */
export function CartProvider({
  cart: serverCart,
  children
}: {
  cart: Cart | null;
  children: ReactNode;
}) {
  const { toast } = useToast();
  const [optimisticCart, applyOptimistic] = useOptimistic(serverCart, optimisticReducer);
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const updateLine = (lineId: string, quantity: number) => {
    startTransition(async () => {
      applyOptimistic(
        quantity < 1 ? { type: "remove", lineId } : { type: "update", lineId, quantity }
      );
      const result = await updateCartLine(lineId, quantity);
      if (!result.ok) toast(result.error ?? "Could not update your cart.", "error");
    });
  };

  const removeLine = (lineId: string) => {
    startTransition(async () => {
      applyOptimistic({ type: "remove", lineId });
      const result = await removeCartLine(lineId);
      if (!result.ok) toast(result.error ?? "Could not update your cart.", "error");
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        updateLine,
        removeLine,
        pending
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
