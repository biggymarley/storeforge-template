import Link from "next/link";
import { Fragment } from "react";
import { IconChevronDown } from "@/components/icons";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
  className?: string;
}

/** Figma breadcrumbs: 16px, muted trail, chevron separators, current item black. */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    // Single-line trail: fixed items stay put (shrink-0) while only the current
    // page (last item) truncates, so a long product title can't wrap or push the
    // header out of shape.
    <nav aria-label="Breadcrumb" className={`flex min-w-0 items-center gap-1 text-base ${className}`}>
      <Link href="/" className="shrink-0 whitespace-nowrap text-muted transition-colors hover:text-foreground">
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            <IconChevronDown width={16} height={16} className="shrink-0 -rotate-90 text-muted" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="shrink-0 whitespace-nowrap text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                title={isLast ? item.label : undefined}
                className={isLast ? "min-w-0 truncate" : "shrink-0 whitespace-nowrap"}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
