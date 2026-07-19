"use client";

import { useEffect, useState } from "react";
import { IconClose } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";

/** Mobile-only bottom CTA once the user has scrolled past the hero; dismissible, homepage-only. */
export function StickyShopCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
      <ButtonLink href="/products" size="md" className="flex-1">
        Shop Now
      </ButtonLink>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-opacity hover:opacity-70"
      >
        <IconClose width={16} height={16} />
      </button>
    </div>
  );
}
