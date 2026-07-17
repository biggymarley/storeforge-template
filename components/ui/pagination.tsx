import Link from "next/link";
import { IconArrow } from "@/components/icons";

interface PaginationProps {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousHref: string;
  nextHref: string;
  className?: string;
}

/**
 * Cursor-based pagination (spec §4): Shopify cursors don't map to numbered
 * pages, so this renders the Figma prev/next outline buttons without the
 * numbered strip.
 */
export function Pagination({ hasPreviousPage, hasNextPage, previousHref, nextHref, className = "" }: PaginationProps) {
  const btn =
    "flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav aria-label="Pagination" className={`flex w-full items-center justify-between ${className}`}>
      <Link href={previousHref} aria-disabled={!hasPreviousPage} className={`${btn} ${hasPreviousPage ? "" : disabled}`}>
        <IconArrow width={20} height={20} className="rotate-180" />
        Previous
      </Link>
      <Link href={nextHref} aria-disabled={!hasNextPage} className={`${btn} ${hasNextPage ? "" : disabled}`}>
        Next
        <IconArrow width={20} height={20} />
      </Link>
    </nav>
  );
}
