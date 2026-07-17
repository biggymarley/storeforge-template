import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import type { NavLink } from "@/components/layout/nav-links";
import { ButtonLink } from "@/components/ui/button";
import { ErrorHero } from "@/components/ui/error-hero";
import { resolveStoreConfig } from "@/lib/config";
import { getCollections } from "@/lib/shopify/api";

export const metadata: Metadata = { title: "Page Not Found" };

/**
 * Root 404 for URLs that match no route — renders outside the (store) layout,
 * so it brings its own chrome (no CartProvider → plain cart icon). This file
 * is also what turns unmatched URLs into real HTTP 404 responses.
 */
export default async function RootNotFound() {
  const store = resolveStoreConfig();
  // Best-effort nav — a 404 page must never crash on a flaky/unconfigured API.
  const collections = await getCollections().catch(() => []);
  const collectionLinks: NavLink[] = collections.map((collection) => ({
    label: collection.title,
    href: `/collections/${collection.handle}`
  }));

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-full focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-background"
      >
        Skip to content
      </a>
      {store.announcement.enabled && store.announcement.text ? (
        <AnnouncementBar text={store.announcement.text} href={store.announcement.href || undefined} />
      ) : null}
      <Header links={[{ label: "Shop", href: "/products" }, ...collectionLinks.slice(0, 3)]} withCart={false} />
      <main id="main-content">
        <ErrorHero
          headline="Nothing to see here"
          copy="The page you're looking for doesn't exist or has been moved. Let's get you back to the good stuff."
        >
          <ButtonLink href="/" variant="secondary" size="lg">
            Back to Home
          </ButtonLink>
          <ButtonLink href="/products" size="lg">
            Shop Now
          </ButtonLink>
        </ErrorHero>
      </main>
      <Footer shopLinks={collectionLinks} />
    </>
  );
}
