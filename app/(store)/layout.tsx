import type { ReactNode } from "react";
import { SetupScreen } from "@/components/setup-screen";
import { CartProvider } from "@/components/cart/cart-provider";
import { MiniCart } from "@/components/cart/mini-cart";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import type { NavLink } from "@/components/layout/nav-links";
import { ToastProvider } from "@/components/ui/toast";
import { isShopifyConfigured } from "@/lib/env";
import { resolveStoreConfig } from "@/lib/config";
import { getCollections } from "@/lib/shopify/api";
import { getCart } from "@/lib/shopify/cart";
import { ShopifyError } from "@/lib/shopify/client";

export default async function StoreLayout({ children }: Readonly<{ children: ReactNode }>) {
  // Friendly dev experience; a misconfigured prod build still fails loudly
  // inside getEnv() when the page fetches run (spec §2.5).
  if (!isShopifyConfigured() && process.env.NODE_ENV !== "production") {
    return <SetupScreen />;
  }

  const store = resolveStoreConfig();
  // Nav survives a flaky API (empty nav beats a crashed layout); config errors still throw.
  const [collections, cart] = await Promise.all([
    getCollections().catch((error) => {
      if (error instanceof ShopifyError) return [];
      throw error;
    }),
    getCart().catch(() => null)
  ]);

  const collectionLinks: NavLink[] = collections.map((collection) => ({
    label: collection.title,
    href: `/collections/${collection.handle}`
  }));
  const navLinks: NavLink[] = [{ label: "Shop", href: "/products" }, ...collectionLinks.slice(0, 3)];

  return (
    <ToastProvider>
      <CartProvider cart={cart}>
        {store.announcement.enabled && store.announcement.text ? (
          <AnnouncementBar text={store.announcement.text} href={store.announcement.href || undefined} />
        ) : null}
        <Header links={navLinks} />
        <main>{children}</main>
        <Footer shopLinks={collectionLinks} />
        <MiniCart />
      </CartProvider>
    </ToastProvider>
  );
}
