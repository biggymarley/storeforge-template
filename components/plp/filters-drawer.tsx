"use client";

import { useEffect, useState } from "react";
import { IconClose, IconSliders } from "@/components/icons";
import { FilterPanel, type FilterPanelProps } from "@/components/plp/filter-panel";

/**
 * Mobile filters (Figma 38:679): sliders trigger next to the PLP title opens
 * a bottom sheet with the same filter sections as the desktop sidebar.
 */
export function FiltersDrawer(props: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open filters"
        onClick={() => setOpen(true)}
        className="flex size-8 items-center justify-center rounded-full bg-secondary text-foreground transition-opacity hover:opacity-70 lg:hidden"
      >
        <IconSliders width={16} height={16} className="[&_path]:fill-current [&_path]:[fill-opacity:1]" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-card bg-background px-6 pb-8 pt-5">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setOpen(false)}
                className="text-muted transition-colors hover:text-foreground"
              >
                <IconClose width={20} height={20} />
              </button>
            </div>
            <FilterPanel {...props} onApplied={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
