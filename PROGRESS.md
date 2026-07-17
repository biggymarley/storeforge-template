# PROGRESS.md — Handoff state for storeforge-template

> Last updated 2026-07-17 (session 2 — Phase D build). **Full handoff set** — read in this order:
> 1. This file (state + what remains)
> 2. `docs/handoff/PAGE-BLUEPRINTS.md` — measured Figma specs (node IDs) — still the spec for the remaining pages
> 3. `docs/handoff/ARCHITECTURE-DECISIONS.md` — why the foundation is built this way (updated with cart architecture as built)
> 4. `docs/handoff/SESSION-LOG.md` — session history, owner working style, open items
> 5. `DESIGN-NOTES.md` (Figma intake + owner decisions) and `TEMPLATE-BUILD-SPEC.md` (the contract — structural source of truth)

## Where we are in the build order (spec §9)

| Phase | Status |
|---|---|
| **A — Figma intake** | ✅ Done, owner-confirmed |
| **B — Foundation** | ✅ Done, verified |
| **C — Design system** | ✅ Done (`/dev/components` gallery) |
| **D — Pages** | 🟡 ~80% done. ✅ global layout · cart plumbing/actions · home · `/products` · `/collections/[handle]` (filters/sort/cursor pagination) · PDP (variants + add-to-cart) · mini-cart (optimistic) · `/cart` (promo codes) · toasts · loading skeletons. ❌ remaining: `/search` (+predictive), `/pages/[handle]`, `/policies/*`, custom 404/error pages |
| **E — Hardening** | ❌ Not started (SEO/JSON-LD/sitemap/robots, a11y, Lighthouse, README, palette-flip test, tag v1.0.0) |

**Everything is UNCOMMITTED** (Phase C + all of Phase D). Owner said "ill commit later" — **ask before committing**. Suggested split: "Phase C: design system components from Figma" / "Phase D: layout, cart, home, PLP, PDP, cart page".

## Figma source

- File: `https://www.figma.com/design/62A4MJq6lWhbal3v9Yi0oB/` (SHOP.CO). Frames: Home `20:2`/`35:740`, PDP `1:2`/`35:1062`, Category `26:855`/`38:234`, Cart `31:32`/`39:1045`, mobile Filters `38:679`.
- Figma MCP requires a browser OAuth per session (`authenticate` tool → give owner the URL). Asset URLs expire in seconds — curl immediately.
- Built pages were screenshot-compared against their frames (desktop + mobile) except `/cart` mobile (fix applied, owner was verifying at session end — see Open items).

## Environment / Shopify state

- Dev store `uwstkm-c0.myshopify.com`, `.env.local` has domain + `shpat_…` private token (never commit). API `2026-07`.
- **Products exist now** (~14 e-bikes/accessories with variants, compare-at prices, many images) and are published to the Headless channel. Add-to-cart → checkout URL verified working end-to-end.
- **Collections still missing** (only auto "frontpage"). This currently hides: header nav collection links, footer Shop column, home "Browse by Category" tiles, PLP category lists, and collection-page facet filters (Color/Size come from `collection.products.filters` — **untested against real data until collections exist**). Owner must create 2–3 collections (with images for the home tiles), publish each to Headless; optional `new-arrivals`/`top-selling` handles drive the home sections.
- Store currency is **GIP (Gibraltar Pound)** — flagged to owner (Shopify Settings → General) in case it's unintentional. Checkout URLs resolve to `kijdh1-w0.myshopify.com` (Shopify alias of the dev store; harmless).

## What was built this session (beyond what PROGRESS previously listed)

- `lib/shopify/cart.ts` (`getCart()`, `CART_COOKIE`) + `lib/shopify/cart-actions.ts` (`addToCart`, `updateCartLine`, `removeCartLine`, `applyDiscountCode`; dead-cart retry; `{ok, error}` results) + `revalidateTag("cart")`.
- `lib/shopify/api.ts` — typed data layer (all pages go through it): collections, products, product, recommendations, search+predictive, page, `getMaxProductPrice`, `getHomeSectionProducts`.
- `lib/plp.ts` — PLP URL contract + Storefront mappings. **URL scheme:** `?sort=…&price_min=&price_max=&instock=1&f.<OptionName>=v1,v2&after=/before=`. `f.*` is generic per variant option (supersedes the blueprint's proposed `colors=`/`sizes=`). `/products` uses `products(query:)` (**`variants.price:`**, `available_for_sale:` — plain `price:` is silently ignored by Shopify!); collections use `ProductFilter[]` + facets (with `swatch.color`) from `collection.products.filters`.
- `app/(store)/` route group: layout (announcement + header + footer + `CartProvider` + `MiniCart` + `ToastProvider`; nav/collections + cart fetched in layout), home, `products/`, `products/[handle]/`, `collections/[handle]/`, `cart/` + loading.tsx files.
- Components: `home/` (hero, product-section, collection-tiles, testimonial-carousel), `plp/` (filter-panel, filters-drawer, price-slider, sort-select, plp-page shell, plp-skeleton), `product/` (product-view, product-tabs), `cart/` (cart-provider, cart-trigger, mini-cart, cart-line-row, order-summary, cart-page-content), `ui/toast.tsx`, `ui/error-state.tsx`.
- Config: **new optional `storeConfig.hero`** (`image`, `headline`, `subtext`, `stats[]`) with `resolveStoreConfig` defaults; placeholder content added. `next.config.ts` now allows `cdn.shopify.com` images. `.prose-store` CSS block for Shopify rich text.
- Chip got a `size` prop (PDP chips lg); ProductSection's `viewAllHref` now optional (reused for PDP recommendations).

## Decisions made this session (owner informed, not objected)

1. Hero = config-driven (`storeConfig.hero`), no image → text-only hero on secondary surface.
2. Home sections: `new-arrivals`/`top-selling` collection handles override sort fallbacks (CREATED_AT desc / BEST_SELLING). Tiles = first 4 collections with images (hidden <2). Section title "Browse by Category" (generic template copy).
3. PLP facets generic via `f.<OptionName>` URL params; "In stock only" chip added (spec §4 availability); count label is "Showing N Products" (Storefront API has no total count outside search).
4. PDP: dead review controls (Write a Review / sort pill) omitted rather than non-functional; FAQs tab hidden (no data source); single-tab bar still renders as section header; long descriptions `line-clamp-5` with full rich text in the Details tab.
5. Mini-cart opens from the header cart icon (icon is no longer a `/cart` link; `/cart` reachable via mini-cart "View Cart"). `CartProvider` receives the **resolved** cart from the layout (not a promise) so badge/mini-cart/page share ONE optimistic state.

## Verification & tooling notes (READ — saves you an hour)

- `npm run typecheck && npm run lint` green. **Do NOT run `npm run build` while the dev server is running** — they share `.next` and it 500s the dev server (restart it if you did).
- Dev server convention: port 3199 (`npm run dev -- --port 3199`; kill with `lsof -ti:3199 | xargs kill`).
- Screenshots: plain `chrome --headless --screenshot --window-size=390,…` silently clamps width to ~500 → false layouts. Use the puppeteer-core scripts in the session scratchpad pattern: `shot.mjs <url> <out.png> <width> [height]` (puppeteer-core + Brave at `/Applications/Brave Browser.app/...`). An add-to-cart/cart-flow test script pattern also exists (`cart-flow-test.mjs`).
- `IconArrow` points RIGHT natively (ARCHITECTURE-DECISIONS was wrong, now corrected; carousel + pagination fixed).
- Streamed pages: `notFound()` after loading.tsx streams returns HTTP 200 + noindex meta + 404 UI — real 404 status comes with the custom not-found page (Phase D remainder / E).
- Recurring layout pitfall found 3×: intrinsically wide children (thumb rails, long text-logo) force grid/flex tracks past the viewport — fix is `min-w-0` on the grid/flex item (see product-view gallery, cart-page grid, header logo truncate).

## Remaining work checklist

1. **Owner test pending**: `/cart` on a ~390px viewport — does the Order Summary still overflow sideways? (Fix applied: grid `lg:grid-cols-[1.4fr_1fr]`, tightened line-row; not yet re-verified.)
2. `/search`: PLP shell + Storefront `search` (has `totalCount`) + debounced predictive dropdown under the header SearchBar (`PREDICTIVE_SEARCH_QUERY`, helper `predictiveSearch()` already in api.ts). Blueprint §Search.
3. `/pages/[handle]` (prose layout, `.prose-store` exists) + `/policies/{privacy,terms,shipping,refund}` from `resolveLegalConfig` params (template text, company values interpolated).
4. Custom `not-found.tsx`, `error.tsx` (big Integral-style headline + pill CTA — blueprint §errors), root-level too.
5. Re-verify collection pages + facet filters once owner creates collections; then compare `/collections/[handle]` against Figma `26:855` again with real category data.
6. Phase E: `generateMetadata` sweep (basic titles exist on built pages; home/OG polish), JSON-LD Product/Organization, `sitemap.ts`, `robots.ts` (disallow `/dev`), a11y pass, Lighthouse ≥90 documented in README, palette-flip smoke test, brand-leak grep (`grep -rn -iE "placeholder store" app components lib` must be empty), README (document: font allowlist, config fields incl. new `hero`, home-section collection-handle convention, `f.*` filter params), remove or gate `/dev/*`, bump/tag v1.0.0 + CHANGELOG.

## Key design tokens (unchanged — full tables in DESIGN-NOTES §2)

Colors: primary/foreground `#000`, background `#fff`, secondary `#f0f0f0`, accent `#ff3333`, muted `#666`; border = foreground@10%. Type: heading uppercase (hero 64→36, section 48→32, titles 40→32/24); body 16/14. Pills everywhere, surfaces `rounded-card` (20px), section card r40. Container `max-w-310 px-4`, grid gap 20 (`gap-5`), 4-col home / 3-col PLP / 2-col mobile.
