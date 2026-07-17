import Link from "next/link";
import { Suspense } from "react";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { IconAccount, IconCart, IconSearch } from "@/components/icons";
import { MobileMenu } from "@/components/layout/mobile-menu";
import type { NavLink } from "@/components/layout/nav-links";
import { SearchBar } from "@/components/layout/search-bar";
import { resolveStoreConfig } from "@/lib/config";

interface HeaderProps {
  /** Nav = collections from the API (spec §4); pages pass them in. */
  links?: NavLink[];
  /** Gallery/preview contexts without a CartProvider render a plain icon. */
  withCart?: boolean;
}

export function Header({ links = [], withCart = true }: HeaderProps) {
  const store = resolveStoreConfig();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-[72px] max-w-310 items-center gap-6 px-4 lg:h-[110px] lg:gap-10">
        <MobileMenu links={links} />
        {/* Long store names must never overflow narrow screens — shrink + ellipsize. */}
        <Link href="/" className="min-w-0 truncate font-heading text-[26px] uppercase leading-tight lg:text-[2rem]">
          {store.name}
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-base transition-opacity hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<div className="hidden h-12 flex-1 rounded-full bg-secondary lg:block" />}>
          <SearchBar className="hidden flex-1 lg:block" />
        </Suspense>
        <div className="ml-auto flex shrink-0 items-center gap-3.5 lg:ml-0">
          <Link href="/search" aria-label="Search" className="transition-opacity hover:opacity-60 lg:hidden">
            <IconSearch width={24} height={24} />
          </Link>
          {withCart ? (
            <CartTrigger />
          ) : (
            <Link href="/cart" aria-label="Cart" className="transition-opacity hover:opacity-60">
              <IconCart width={24} height={24} />
            </Link>
          )}
          <span aria-hidden="true" className="cursor-default opacity-100">
            <IconAccount width={24} height={24} />
          </span>
        </div>
      </div>
    </header>
  );
}
