# storeforge-template

Production-grade Shopify storefront template (Next.js 15 · Tailwind v4 · TypeScript strict), designed to be cloned, configured and deployed by **StoreForge**. Zero hardcoded branding: every store-specific value flows from `config/*.ts`, CSS variables and env vars.

Design source of truth: SHOP.CO Figma file — see `DESIGN-NOTES.md`. Structural source of truth: `TEMPLATE-BUILD-SPEC.md` (§2, the contract).

## Setup

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in:

   | Variable | Required | Notes |
   |---|---|---|
   | `SHOPIFY_STORE_DOMAIN` | ✅ | `your-store.myshopify.com` — no protocol/trailing slash |
   | `SHOPIFY_STOREFRONT_TOKEN` | ✅ | Storefront API access token (see below) |
   | `SHOPIFY_ADMIN_TOKEN` | — | Optional; the template never requires it |
   | `NEXT_PUBLIC_SITE_URL` | — | Canonical/OG base URL; defaults to `http://localhost:3000` |

   **Getting a Storefront token:** Shopify admin → Settings → Apps and sales channels → Develop apps → Create an app → Configure Storefront API scopes (`unauthenticated_read_product_listings`, `unauthenticated_read_content`, `unauthenticated_write_checkouts`, `unauthenticated_read_checkouts`) → Install → API credentials → Storefront API access token. Use a **development store** for dev.

3. `npm run dev` — with missing/invalid credentials, dev renders a setup screen instead of crashing; production builds of data-dependent pages fail with a friendly error listing the missing vars.
4. Verify the connection at `/dev/scratch` (renders raw `products(first: 5)` JSON).

## Store configuration (the contract)

Store-specific values live **only** in:

```
config/store.ts     # brand: name, tagline, colors, fonts, socials, currency, announcement
config/legal.ts     # company identity + policy page parameters
config/seo.ts       # default title/description/OG/twitter
config/content.ts   # testimonials, brand-logo strip, per-product reviews
public/branding/    # logo.svg, favicon.ico, og-image.png (+ optional brands/*)
store.meta.json     # owned by StoreForge — never read by app code
.env / .env.*       # Shopify credentials (never committed)
```

Each config file exports exactly one typed const object — no functions, no imports beyond its own type — so StoreForge can string-generate them. Types live in `lib/types/config.ts` (template-owned); optional fields get defaults via `resolve*Config()` in `lib/config.ts`, so configs written for older template versions never break newer builds.

> **StoreForge integration note:** `config/content.ts` (`ContentConfig`) was added at v1.0.0 by owner decision — reviews/testimonials and the brand-logo strip are store-owned content, since the Shopify Storefront API has no native reviews. StoreForge must generate this file alongside store/legal/seo (an empty object is valid — all fields optional).

## Theming

`app/layout.tsx` converts `storeConfig.colors` + `storeConfig.fonts` into `--site-*` CSS variables on `<html>`; Tailwind tokens in `app/globals.css` (`@theme`) reference those variables. Changing `config/store.ts` restyles the entire site with zero other edits.

Semantic color roles: `primary` (buttons/emphasis), `secondary` (surfaces/inputs/chips), `accent` (sale/destructive), `background`, `foreground`, `muted`. Derived automatically: borders = foreground @10%, plus opacity variants.

### Font allowlist

`storeConfig.fonts` picks by name from this curated `next/font/google` set (unknown names fall back to defaults). Keep StoreForge's wizard in sync:

- **Headings:** Archivo Black *(default)*, Anton, Bebas Neue, Oswald, Fraunces, Playfair Display
- **Body:** Inter *(default)*, DM Sans, Work Sans, Plus Jakarta Sans

## Shopify integration

- Storefront API (GraphQL), version pinned in `lib/shopify/constants.ts` (`2026-01`)
- `shopifyFetch<T>()` in `lib/shopify/client.ts` — typed, normalized errors (`ShopifyError`)
- Queries in `lib/shopify/queries/`, cart mutations in `lib/shopify/mutations/`
- Caching: product/collection reads `revalidate: 60`; cart always `no-store`
- Money: `formatPrice()` in `lib/format.ts` — Shopify's `currencyCode` wins; `storeConfig.currency` is display fallback only

## Versioning & releases

Git tags (`vX.Y.Z`) in lockstep with `template.json.version`. Per release:

1. `npm run typecheck` && `npm run lint` && `npm run build` — all green
2. Theming smoke test: flip `config/store.ts` to a second palette, eyeball every page, flip back
3. Bump `template.json` version (and `package.json`)
4. Commit, `git tag vX.Y.Z`, push with tags
5. Add a `CHANGELOG.md` entry

Compatibility rules: never rename/remove a config field without a default-based fallback; never move files into/out of `protectedPaths` (see `template.json`) without flagging it first.

## Project layout

```
app/              # routes (App Router, Server Components by default)
components/       # template-owned UI
config/           # STORE-OWNED — see contract above
lib/
  config.ts       # resolve*Config defaults
  env.ts          # Zod-validated env
  fonts.ts        # font allowlist
  format.ts       # formatPrice
  shopify/        # client, types, queries, mutations
  types/config.ts # config type definitions
public/branding/  # STORE-OWNED assets
```
