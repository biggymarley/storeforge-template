"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "@/components/icons";
import { SORT_OPTIONS, type SortValue } from "@/lib/plp";

/**
 * Figma "Sort by: Most Popular ⌄". The open menu isn't designed — improvised
 * as a 20px-radius card (overlay context, so a soft shadow is allowed).
 */
export function SortSelect({
  current,
  options = SORT_OPTIONS
}: {
  current: SortValue;
  /** Surfaces with fewer API sort keys (search) pass a reduced menu. */
  options?: { value: SortValue; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const select = (value: SortValue) => {
    setOpen(false);
    const params = new URLSearchParams(searchParams);
    // A sort change resets cursor paging.
    params.delete("after");
    params.delete("before");
    if (value === "best-selling") params.delete("sort");
    else params.set("sort", value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const currentLabel =
    options.find((option) => option.value === current)?.label ?? options[0]?.label ?? "Most Popular";

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="hidden items-center gap-1 text-sm sm:flex"
      >
        <span className="text-muted">Sort by:</span>
        <span className="flex items-center gap-1 text-base font-medium">
          {currentLabel}
          <IconChevronDown width={16} height={16} className={open ? "rotate-180" : ""} />
        </span>
      </button>
      {/* Mobile: icon-less compact trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium sm:hidden"
      >
        Sort
        <IconChevronDown width={16} height={16} className={open ? "rotate-180" : ""} />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Sort products"
          className="absolute right-0 top-full z-40 mt-2 w-56 rounded-card border border-border bg-background p-2 shadow-lg"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === current}
                onClick={() => select(option.value)}
                className={`w-full rounded-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-secondary ${
                  option.value === current ? "font-medium" : "text-muted"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
