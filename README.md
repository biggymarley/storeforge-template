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

   **Getting a Storefront token (recommended — Headless channel):** in the store admin, install the free **Headless** channel from the Shopify App Store → **Create storefront** → copy the **private access token** (`shpat_…`). The client auto-detects the token type: `shpat_…` is sent as `Shopify-Storefront-Private-Token` (server-side), anything else as `X-Shopify-Storefront-Access-Token`. Alternative: a Dev Dashboard app with the `unauthenticated_*` Storefront scopes granted also works. Use a **development store** for dev.

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

- Storefront API (GraphQL), version pinned in `lib/shopify/constants.ts` (`2026-07`)
- `shopifyFetch<T>()` in `lib/shopify/client.ts` — typed, normalized errors (`ShopifyError`)
- Queries in `lib/shopify/queries/`, cart mutations in `lib/shopify/mutations/`
- Caching: product/collection reads `revalidate: 60`; cart always `no-store`
- Money: `formatPrice()` in `lib/format.ts` — Shopify's `currencyCode` wins; `storeConfig.currency` is display fallback only

## Pages & routes

| Route | Notes |
|---|---|
| `/` | Hero (config-driven, text-only without `storeConfig.hero.image`), brand strip, New Arrivals / Top Selling / collection tiles, testimonials |
| `/products`, `/collections/[handle]` | Shared PLP shell — filters sidebar (desktop) / drawer (mobile), sort, cursor pagination |
| `/products/[handle]` | Gallery, variant selection, add to cart, tabs (Details/Reviews — Reviews hidden with no config data), recommendations |
| `/cart` | Line items, promo code, checkout → `cart.checkoutUrl`; mini-cart slide-over on every page (header cart icon) |
| `/search` | Same PLP shell + predictive dropdown (debounced, `/api/predictive-search`) |
| `/pages/[handle]` | Shopify pages (About etc.), prose layout |
| `/policies/{privacy,terms,shipping,refund}` | Template-owned text (`lib/policies.ts`) interpolating `config/legal.ts` |
| `/404`, error boundaries | On-brand `ErrorHero`; the root `not-found.tsx`/`error.tsx` carry their own chrome (no `CartProvider`) so unmatched URLs return a real HTTP 404 |

**PLP URL contract** (`lib/plp.ts`, shared by all three grid routes): `?sort=&price_min=&price_max=&instock=1&f.<OptionName>=v1,v2&after=/before=`. `f.*` is generic per variant option (Color, Size, Material, …) rather than hardcoded — it renders whatever facets `collection.products.filters` returns. Non-PLP params (e.g. `/search`'s `q`) always survive filter/sort changes (`isPlpParam()`).

**Home section convention:** a collection with handle `new-arrivals` or `top-selling` overrides the default product sort for that homepage section (`CREATED_AT desc` / `BEST_SELLING` respectively) — create those collections to control the sections directly instead of relying on the sort fallback.

## SEO & hardening (Phase E)

- `app/sitemap.ts` — static routes + products/collections/pages from Shopify (handles-only query, degrades to static routes if Shopify is unreachable)
- `app/robots.ts` — disallows `/dev` and `/api/`, points at the sitemap
- JSON-LD: `Organization` (root layout, every page) and `Product` (PDP) via `lib/json-ld.ts`
- `/dev/*` (component gallery, scratch page) 404s in production builds (`app/dev/layout.tsx`) — dev-only QA surfaces, never shipped
- Accessibility: skip-to-content link, landmark elements (`header`/`nav`/`main`/`footer`), focus-visible rings on the pill text inputs, `Escape` closes all slide-over/drawer overlays (mini-cart, mobile nav, filters drawer)
- Lighthouse (home / PDP, production build): documented per release below

## Versioning & releases

Git tags (`vX.Y.Z`) in lockstep with `template.json.version`. Per release:

1. `npm run typecheck` && `npm run lint` && `npm run build` — all green
2. Theming smoke test: flip `config/store.ts` to a second palette, eyeball every page, flip back
3. Lighthouse (production build, `npm run build && npm run start`) on `/` and a PDP — target ≥90 across performance/accessibility/best-practices/SEO; record scores below
4. Bump `template.json` version (and `package.json`)
5. Commit, `git tag vX.Y.Z`, push with tags
6. Add a `CHANGELOG.md` entry

Compatibility rules: never rename/remove a config field without a default-based fallback; never move files into/out of `protectedPaths` (see `template.json`) without flagging it first.

### Lighthouse scores (v1.0.0, production build, dev-store data)

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 93 | 96 | 100 | 100 |
| `/products/[handle]` | 90 | 97 | 96 | 92 |

The PDP's sub-100 findings are content/design-driven, not build issues: the Figma-specified 30%-opacity compare-at price and the small discount badge fall a little short of WCAG contrast minimums, and one product's own Shopify description embeds a YouTube video (a DevTools "Issues" panel entry, not a Lighthouse fix). Re-run before every release — real product data varies score-to-score.

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
