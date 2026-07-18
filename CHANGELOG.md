# Changelog

## [1.2.0] — 2026-07-18

- New optional `storeConfig.fonts.customHeading` / `customBody` fields (store-owned font files, e.g. `/branding/fonts/heading.woff2`) take priority over the curated allowlist when set. Loaded via a plain `@font-face` rule injected in root layout (not `next/font/local`, since the file may not exist at build time for stores that don't use it) — falls back to the existing allowlist-based fonts when unset.

## [1.1.0] — 2026-07-18

- New optional `storeConfig.favicon` field (store-owned asset, e.g. `/branding/favicon.png`) wired into root layout `metadata.icons` (icon/shortcut/apple). Falls back to the static `app/favicon.ico` when unset — old stores built before this field existed are unaffected.

## [1.0.0] — 2026-07-17

### Phase E — Hardening
- SEO: `app/sitemap.ts` (static routes + products/collections/pages, handles-only query), `app/robots.ts` (disallows `/dev`, `/api/`), JSON-LD `Organization` (root layout) + `Product` (PDP) via `lib/json-ld.ts`.
- `/dev/*` (component gallery, scratch page) now 404s in production builds (`app/dev/layout.tsx`) — was previously unlinked but still reachable.
- Accessibility: skip-to-content link + `#main-content` landmark on the store layout and root 404; `focus-within` rings on the three pill text inputs (search, newsletter, promo code) that had `outline-none` with no visible replacement; `Escape` now closes the mobile nav drawer and mobile filters drawer (parity with the mini-cart, which already had it).
- Fixed `.gitignore`'s `.env*` rule silently excluding `.env.example` from every commit (StoreForge/new builders need this file); scrubbed the real dev-store domain out of it in favor of a generic placeholder.
- Verified `/search` price-sort ordering (asc/desc) end-to-end — the one item left open from Phase D.
- Lighthouse (production build): home 93/96/100/100, PDP 90/97/96/92 (performance/accessibility/best-practices/SEO) — scores recorded in README.
- Palette-flip theming smoke test run and reverted; brand-leak grep (`placeholder store` outside `config/`) clean.

### Phase D — Pages (search, pages/policies, errors)
- `/search`: PLP shell + Storefront `search` with `totalCount` and `productFilters`; predictive dropdown (`/api/predictive-search`, 300ms debounce, full combobox a11y) via a new client `search-bar.tsx`; reduced sort menu (`SEARCH_SORT_OPTIONS`) since the search API only supports Relevance/Price.
- `/pages/[handle]`: prose layout (`components/layout/prose-page.tsx`) rendering Shopify page content.
- `/policies/{privacy,terms,shipping,refund}`: template-owned structured text (`lib/policies.ts`) interpolating `config/legal.ts`; static params, real 404 on unknown handles.
- 404/error: shared `components/ui/error-hero.tsx`; root `not-found.tsx`/`error.tsx` carry their own chrome (no `CartProvider`) so unmatched URLs return a genuine HTTP 404, not a streamed 200.
- Fixed a URL-contract bug: filter Apply/Clear were dropping non-PLP params (`/search`'s `q`) — added `isPlpParam()` in `lib/plp.ts`.

### Phase D — Pages (layout, cart, home, PLP, PDP)
- Cart: `lib/shopify/cart.ts` / `cart-actions.ts` (add/update/remove/discount, cookie-held cart ID, `revalidateTag("cart")`), `CartProvider` sharing one resolved cart + `useOptimistic` across header badge / mini-cart / `/cart` page.
- `lib/shopify/api.ts` typed data layer (collections, products, product, recommendations, search, page, home-section sourcing) and `lib/plp.ts` (URL-to-Storefront-filter mapping, generic `f.<OptionName>` facets).
- `(store)` route group: layout (announcement + header + footer + cart + toasts), home, `/products`, `/products/[handle]`, `/collections/[handle]`, `/cart`, loading states.
- New optional `storeConfig.hero` field (image/headline/subtext/stats) with a text-only fallback when unset.

### Phase A — Figma intake
- `DESIGN-NOTES.md`: screens↔routes map, token tables, component inventory, gaps, and owner-confirmed decisions (reviews/brands → `config/content.ts`; Google-font placeholders Archivo Black + Inter).

### Phase B — Foundation
- Scaffold: Next.js 15.5 (App Router, Turbopack), TypeScript strict, Tailwind v4, ESLint 9.
- Contract: `lib/types/config.ts` (Store/Legal/Seo/Content), four `config/*.ts` placeholders, `resolve*Config()` defaults, `template.json`, `store.meta.json` placeholder, `public/branding/` placeholders.
- Theming: config colors/fonts → `--site-*` vars on `<html>` → Tailwind `@theme` tokens; curated 10-font Google allowlist in `lib/fonts.ts`.
- Env: Zod validation in `lib/env.ts`; dev setup screen instead of crash; friendly build-time error for data pages.
- Shopify: pinned API `2026-01`, typed `shopifyFetch`, fragments, queries (products, product-by-handle, collections, collection-by-handle, search, predictive search, pages, recommendations, cart), cart mutations (create, lines add/update/remove, discount codes).
- `/dev/scratch` proving page rendering raw `products(first: 5)`.
- Storefront API repinned to `2026-07`; client auto-detects Headless-channel private tokens (`shpat_` → `Shopify-Storefront-Private-Token` header).

### Phase C — Design system
- Icons exported from the Figma file into `components/icons.tsx` (currentColor) + payment badges in `public/payments/`; TikTok glyph improvised (not in design).
- Primitives: Button/ButtonLink, Chip, DiscountBadge, StarRating (Figma star glyphs), Price (auto -% badge), PillInput, QuantityStepper, ColorSwatch, Pagination (cursor-based prev/next), skeletons.
- Product: ProductCard (config-driven ratings via `lib/reviews.ts`), ReviewCard.
- Layout: AnnouncementBar (dismissible), Header (nav links + search + cart badge + mobile drawer), Footer (config socials/legal, payment badges, newsletter band overlap), NewsletterBand (visual capture), Breadcrumbs, BrandStrip (config-driven).
- `/dev/components` gallery for visual QA against Figma.
