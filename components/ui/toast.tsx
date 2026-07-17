"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface ToastEntry {
  id: number;
  message: string;
  variant: "default" | "error";
}

interface ToastContextValue {
  toast: (message: string, variant?: "default" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}

/**
 * Improvised per DESIGN-NOTES §6: black pill toasts, bottom-center,
 * auto-dismiss. Errors (mutation userErrors, spec §5) use the accent color.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((message: string, variant: "default" | "error" = "default") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => {
      setToasts((current) => current.filter((entry) => entry.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((entry) => (
          <div
            key={entry.id}
            className={`rounded-full px-6 py-3 text-sm text-background shadow-lg ${
              entry.variant === "error" ? "bg-accent" : "bg-primary"
            }`}
          >
            {entry.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
