"use client";

import { useState } from "react";
import Link from "next/link";
import { IconClose } from "@/components/icons";

interface AnnouncementBarProps {
  text: string;
  href?: string;
}

/** Figma: colored bar (colors.announcementBackground, default primary), 14px text with underlined link, dismiss ✕. Config-gated by the caller. */
export function AnnouncementBar({ text, href }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative bg-announcement-background px-10 py-2.5 text-center text-sm text-background">
      {href ? (
        <Link href={href} className="underline underline-offset-2 hover:opacity-80">
          {text}
        </Link>
      ) : (
        <span>{text}</span>
      )}
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-background transition-opacity hover:opacity-70 lg:block"
      >
        <IconClose width={20} height={20} />
      </button>
    </div>
  );
}
