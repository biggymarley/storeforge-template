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
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-base ${className}`}>
      <Link href="/" className="text-muted transition-colors hover:text-foreground">
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            <IconChevronDown width={16} height={16} className="-rotate-90 text-muted" />
            {item.href && !isLast ? (
              <Link href={item.href} className="text-muted transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
