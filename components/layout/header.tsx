import Image from "next/image";
import Link from "next/link";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { IconCart } from "@/components/icons";
import { MobileMenu } from "@/components/layout/mobile-menu";
import type { NavLink } from "@/components/layout/nav-links";
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-310 items-center gap-6 px-4 lg:h-20 lg:gap-10">
        <Link href="/" className="flex min-w-0 shrink-0 items-center">
          <Image
            src={store.logo.src}
            alt={store.logo.alt}
            width={160}
            height={44}
            priority
            className="h-7 w-auto object-contain lg:h-9"
          />
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
        <div className="ml-auto flex shrink-0 items-center gap-3.5">
          {withCart ? (
            <CartTrigger />
          ) : (
            <Link href="/cart" aria-label="Cart" className="transition-opacity hover:opacity-60">
              <IconCart width={24} height={24} />
            </Link>
          )}
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
