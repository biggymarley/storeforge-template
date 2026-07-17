import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { resolveSeoConfig, resolveStoreConfig } from "@/lib/config";
import { getFonts } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const store = resolveStoreConfig();
const seo = resolveSeoConfig();
const fonts = getFonts(store.fonts);

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: seo.defaultTitle, template: seo.titleTemplate },
  description: seo.description,
  openGraph: {
    siteName: store.name,
    title: seo.defaultTitle,
    description: seo.description,
    images: [{ url: seo.ogImage }]
  },
  twitter: seo.twitterHandle
    ? { card: "summary_large_image", site: seo.twitterHandle }
    : { card: "summary_large_image" }
};

/** storeConfig.colors + fonts → CSS variables consumed by @theme in globals.css. */
const themeVariables = {
  "--site-primary": store.colors.primary,
  "--site-secondary": store.colors.secondary,
  "--site-accent": store.colors.accent,
  "--site-background": store.colors.background,
  "--site-foreground": store.colors.foreground,
  "--site-muted": store.colors.muted,
  "--site-font-heading": fonts.heading.style.fontFamily,
  "--site-font-body": fonts.body.style.fontFamily
} as CSSProperties;

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" style={themeVariables}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
