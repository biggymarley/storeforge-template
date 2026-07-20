import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { resolveSeoConfig, resolveStoreConfig } from "@/lib/config";
import { getFonts, customFontFace } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/env";
import { organizationJsonLd } from "@/lib/json-ld";
import "./globals.css";

const store = resolveStoreConfig();
const seo = resolveSeoConfig();
const fonts = getFonts(store.fonts);

/** Custom uploaded fonts take priority over the allowlist pick for that slot. */
const headingFamily = store.customFonts.heading ? `"storeforge-heading", ${fonts.heading.style.fontFamily}` : fonts.heading.style.fontFamily;
const bodyFamily = store.customFonts.body ? `"storeforge-body", ${fonts.body.style.fontFamily}` : fonts.body.style.fontFamily;
const customFontFaceCss = [
  customFontFace("storeforge-heading", store.customFonts.heading),
  customFontFace("storeforge-body", store.customFonts.body)
]
  .filter(Boolean)
  .join("\n");

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: seo.defaultTitle, template: seo.titleTemplate },
  description: seo.description,
  icons: { icon: store.favicon, shortcut: store.favicon, apple: store.favicon },
  openGraph: {
    siteName: store.name,
    title: seo.defaultTitle,
    description: seo.description,
    images: [{ url: seo.ogImage }]
  },
  twitter: seo.twitterHandle
    ? { card: "summary_large_image", site: seo.twitterHandle }
    : { card: "summary_large_image" },
  verification: seo.googleSiteVerification ? { google: seo.googleSiteVerification } : undefined
};

/** storeConfig.colors + fonts → CSS variables consumed by @theme in globals.css. */
const themeVariables = {
  "--site-primary": store.colors.primary,
  "--site-secondary": store.colors.secondary,
  "--site-accent": store.colors.accent,
  "--site-background": store.colors.background,
  "--site-foreground": store.colors.foreground,
  "--site-muted": store.colors.muted,
  "--site-hero-background": store.colors.heroBackground,
  "--site-font-heading": headingFamily,
  "--site-font-body": bodyFamily
} as CSSProperties;

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" style={themeVariables}>
      <head>{customFontFaceCss ? <style dangerouslySetInnerHTML={{ __html: customFontFaceCss }} /> : null}</head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        {children}
      </body>
    </html>
  );
}
