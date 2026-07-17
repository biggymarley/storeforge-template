"use client";

import { useState } from "react";
import Link from "next/link";
import { IconClose, IconMenu } from "@/components/icons";
import type { NavLink } from "@/components/layout/nav-links";

/** Mobile nav drawer — no open state in Figma; styled after the Filters drawer (DESIGN-NOTES §6). */
export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <IconMenu width={24} height={24} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-primary/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto rounded-r-card bg-background p-6">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">Menu</span>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="text-muted">
                <IconClose width={20} height={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between text-base text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
