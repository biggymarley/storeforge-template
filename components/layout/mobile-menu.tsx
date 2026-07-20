"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IconChevronDown, IconClose, IconMenu } from "@/components/icons";
import type { NavLink } from "@/components/layout/nav-links";

/**
 * Mobile nav drawer — right-side slide-over, mirrors the mini-cart's visual
 * language (rounded-l-card, shadow-xl, bg-foreground/40 backdrop) so the
 * app's two right-anchored panels feel like one system.
 */
export function MobileMenu({ links }: { links: NavLink[] }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = () => {
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  const close = () => setVisible(false);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  useEffect(() => {
    if (mounted && visible) closeRef.current?.focus();
  }, [mounted, visible]);

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mounted]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={mounted}
        onClick={open}
        className="flex size-10 items-center justify-center transition-opacity hover:opacity-60"
      >
        <IconMenu width={24} height={24} />
      </button>
      {mounted
        ? createPortal(
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ease-out ${
                  visible ? "opacity-100" : "opacity-0"
                }`}
              />
              <div
                onTransitionEnd={(event) => {
                  if (event.target !== event.currentTarget || visible) return;
                  setMounted(false);
                  triggerRef.current?.focus();
                }}
                className={`absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col rounded-l-card bg-background shadow-xl transition-transform duration-300 ease-out ${
                  visible ? "translate-x-0" : "translate-x-full"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border px-6 py-5">
                  <span className="text-xl font-bold">Menu</span>
                  <button
                    ref={closeRef}
                    type="button"
                    aria-label="Close menu"
                    onClick={close}
                    className="flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <IconClose width={20} height={20} />
                  </button>
                </div>
                <nav aria-label="Mobile" className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="flex items-center justify-between rounded-2xl px-3 py-4 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      {link.label}
                      <IconChevronDown width={16} height={16} className="-rotate-90" />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
