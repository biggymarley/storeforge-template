"use client";

import { useState } from "react";
import Link from "next/link";
import { IconClose } from "@/components/icons";
import { TRUST_BAR_ICONS } from "@/lib/trust-bar-icons";
import type { AnnouncementItem } from "@/lib/types/config";

interface AnnouncementBarProps {
  items: AnnouncementItem[];
}

/**
 * Colored bar (colors.announcementBackground, default primary) with up to 3
 * icon+text items side by side, border dividers between them, dismiss ✕.
 * Config-gated by the caller.
 */
export function AnnouncementBar({ items }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative bg-announcement-background px-10 py-2.5 text-center text-sm text-announcement-foreground">
      <div className="flex flex-wrap items-center justify-center divide-x divide-announcement-foreground/30">
        {items.slice(0, 3).map((item) => {
          const Icon = item.icon ? TRUST_BAR_ICONS[item.icon] : null;
          const content = (
            <>
              {Icon ? <Icon width={16} height={16} className="shrink-0" /> : null}
              <span>{item.text}</span>
            </>
          );
          return item.href ? (
            <Link
              key={item.text}
              href={item.href}
              className="inline-flex items-center gap-1.5 px-3 underline underline-offset-2 hover:opacity-80"
            >
              {content}
            </Link>
          ) : (
            <span key={item.text} className="inline-flex items-center gap-1.5 px-3">
              {content}
            </span>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-announcement-foreground transition-opacity hover:opacity-70 lg:block"
      >
        <IconClose width={20} height={20} />
      </button>
    </div>
  );
}
