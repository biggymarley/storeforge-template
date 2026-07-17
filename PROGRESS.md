# PROGRESS.md — Handoff state for storeforge-template

> Last updated 2026-07-17 (session 4 — Phase E COMPLETE, v1.0.0). **Full handoff set** — read in this order:
> 1. This file (state + what remains)
> 2. `docs/handoff/PAGE-BLUEPRINTS.md` — measured Figma specs (node IDs) — reference for any future visual work
> 3. `docs/handoff/ARCHITECTURE-DECISIONS.md` — why the foundation is built this way (updated with cart architecture as built)
> 4. `docs/handoff/SESSION-LOG.md` — session history, owner working style, open items
> 5. `DESIGN-NOTES.md` (Figma intake + owner decisions), `TEMPLATE-BUILD-SPEC.md` (the contract), `README.md` (setup/config/Lighthouse), `CHANGELOG.md` (release history)

## Where we are in the build order (spec §9)

| Phase | Status |
|---|---|
| **A — Figma intake** | ✅ Done, owner-confirmed |
| **B — Foundation** | ✅ Done, verified |
| **C — Design system** | ✅ Done (`/dev/components` gallery) |
| **D — Pages** | ✅ Done — global layout · cart plumbing/actions · home · `/products` · `/collections/[handle]` (filters/sort/cursor pagination) · PDP (variants + add-to-cart) · mini-cart (optimistic) · `/cart` (promo codes) · toasts · loading skeletons · `/search` (+predictive dropdown) · `/pages/[handle]` · `/policies/*` · custom 404/error pages |
| **E — Hardening** | ✅ **DONE** (session 4): sitemap/robots, JSON-LD, `/dev/*` production-gated, a11y pass (skip link, focus rings, Escape-key parity), Lighthouse ≥90 documented, README + CHANGELOG updated, `.env.example` fixed and committed, palette-flip smoke test, brand-leak grep clean |

**Phase C + D were committed and pushed by the owner between sessions 3 and 4** (`git log` on `main`: `858ec0c template`). Phase E (this session) is the remaining diff — **ask before committing**, per the owner's standing rule.

## Figma source

- File: `https://www.figma.com/design/62A4MJq6lWhbal3v9Yi0oB/` (SHOP.CO). Frames: Home `20:2`/`35:740`, PDP `1:2`/`35:1062`, Category `26:855`/`38:234`, Cart `31:32`/`39:1045`, mobile Filters `38:679`.
- Figma MCP requires a browser OAuth per session (`authenticate` tool → give owner the URL). Asset URLs expire in seconds — curl immediately.
- Built pages were screenshot-compared against their frames (desktop + mobile) except `/cart` mobile (fix applied, owner was verifying at session end — see Open items).

## Environment / Shopify state

- Dev store `uwstkm-c0.myshopify.com`, `.env.local` has domain + `shpat_…` private token (never commit). API `2026-07`.
- **Products exist now** (~14 e-bikes/accessories with variants, compare-at prices, many images) and are published to the Headless channel. Add-to-cart → checkout URL verified working end-to-end.
- **Collections still missing** (only auto "frontpage"). This currently hides: header nav collection links, footer Shop column, home "Browse by Category" tiles, PLP category lists, and collection-page facet filters (Color/Size come from `collection.products.filters` — **untested against real data until collections exist**). Owner must create 2–3 collections (with images for the home tiles), publish each to Headless; optional `new-arrivals`/`top-selling` handles drive the home sections.
- Store currency is **GIP (Gibraltar Pound)** — flagged to owner (Shopify Settings → General) in case it's unintentional. Checkout URLs resolve to `kijdh1-w0.myshopify.com` (Shopify alias of the dev store; harmless).

## What was built in session 4 (Phase E — hardening, v1.0.0)

- **SEO**: `app/sitemap.ts` (static routes + Shopify products/collections/pages via a new handles-only `SITEMAP_QUERY`/`getSitemapEntries()`, degrades to static-only if Shopify is unreachable), `app/robots.ts` (disallows `/dev`, `/api/`; points at the sitemap). `lib/json-ld.ts`: `organizationJsonLd()` rendered once in the root layout (every page), `productJsonLd()` rendered on the PDP — both verified against live dev-store data (curled the rendered `<script type="application/ld+json">` on `/` and a real product).
- **`/dev/*` production-gated**: new `app/dev/layout.tsx` calls `notFound()` when `NODE_ENV === "production"` — verified via a full `next build && next start` pass (`/dev/scratch` and `/dev/components` both 404 in the production server; still reachable in dev, as intended for QA).
- **Accessibility pass**: skip-to-content link + `#main-content` landmark on the `(store)` layout and the root `not-found.tsx`; `focus-within` rings added to the three pill text inputs that had `outline-none` with no visible focus replacement (header search, newsletter, cart promo code); `Escape` now closes the mobile nav drawer and mobile filters drawer (mini-cart already had this).
- **`.env.example` bug fixed**: `.gitignore`'s blanket `.env*` rule was silently excluding `.env.example` from every commit — the file StoreForge/new builders are told to copy in the README setup steps didn't actually exist in git history. Added `!.env.example` and scrubbed the real dev-store domain (`uwstkm-c0.myshopify.com`) out of it in favor of a generic placeholder before committing.
- **Verified**: `/search?sort=price-asc|desc` ordering is correct both directions (asc GIP 39→699…, desc GIP 4,168→1,799…) — the one item left open from session 3.
- **Lighthouse** (production build, `next build && next start`, Brave as the Chrome binary via `CHROME_PATH`): home 93/96/100/100, PDP 90/97/96/92 (performance/accessibility/best-practices/SEO). Both ≥90 everywhere; scores + the two minor sub-100 findings (compare-at price contrast, discount badge contrast — both Figma-spec colors, not build bugs) documented in README.
- **Palette-flip smoke test**: swapped `config/store.ts` to a deliberately ugly second palette + font pair, confirmed via curl that `--site-primary`/`--site-font-heading` propagate through `app/layout.tsx` → `app/globals.css` `@theme` correctly, then reverted (`git diff config/store.ts` clean).
- **Docs**: README gained a Pages & routes table (URL filter contract, home-section collection-handle convention), a Phase E section, and a Lighthouse-scores table; CHANGELOG rolled `[Unreleased]` into `[1.0.0]` with Phase D + E entries added. `template.json`/`package.json` were already at `1.0.0` — no bump needed, this session's diff IS the 1.0.0 release.
- typecheck/lint/build all green throughout; brand-leak grep (`grep -rn -iE "placeholder store" app components lib`) empty.

## What was built in session 3 (Phase D remainder — all verified in-browser via puppeteer screenshots)

- **`/search`** (`app/(store)/search/page.tsx` + loading.tsx): PLP shell + Storefront `search` with `totalCount` ("Showing 12 of 38 Products") and `productFilters` (added to SEARCH_QUERY; price filter verified: 38→14). No-query state = centered prompt + autofocused SearchBar. Reduced sort menu `SEARCH_SORT_OPTIONS` (Relevance/Price↑/Price↓ — search API has no best-selling/newest keys) via new `sortForSearch()` + optional `sortOptions` prop on PlpPage/SortSelect.
- **Predictive search**: `app/api/predictive-search/route.ts` (GET, min 2 chars, degrades to `{products: []}` on ShopifyError) + rebuilt `search-bar.tsx`: 300ms debounce + AbortController, r20 dropdown w/ 40px thumbs + prices, full combobox a11y (ArrowUp/Down/Enter/Escape, aria-activedescendant), "View all results" footer row. Verified w/ screenshots incl. keyboard highlight.
- **URL-contract fix**: filter Apply/Clear used to drop non-PLP params (search's `q`). New `isPlpParam()` in lib/plp.ts; FilterPanel.apply + PlpPage clear-href now preserve foreign params.
- **`/pages/[handle]`**: prose layout via new `components/layout/prose-page.tsx` (breadcrumb + Integral h1 + 720px measure), `.prose-store` body, seo-aware generateMetadata, notFound() for unknown handles. NOTE: dev store's "contact" page has an EMPTY body in Shopify (renders title only — data, not a bug); "contact-us" has content and renders fine.
- **`/policies/[policy]`**: `lib/policies.ts` — template-owned policy text (privacy/terms/shipping/refund) as structured sections interpolating `resolveLegalConfig` (company, legalName, address, emails, phone, returnWindowDays, processingTimeDays, shipFromCountry). `generateStaticParams` + `dynamicParams=false` (unknown → real 404). Footer already linked these paths.
- **404/error**: shared `components/ui/error-hero.tsx` (centered Integral headline + pill CTAs, blueprint §errors). `app/(store)/not-found.tsx` (inside chrome), `app/not-found.tsx` (root — own chrome: announcement + Header withCart={false} + Footer, best-effort collections nav, this is what makes unmatched URLs return real HTTP 404 — verified), `app/(store)/error.tsx` + `app/error.tsx` (client boundaries, Try again + Back to Home; root one has no chrome since the layout itself failed).
- Status codes verified: `/policies/refund` 200 · `/policies/nope` 404 · `/definitely-not-a-page` 404 · `/pages/nope` 404 · `/search?q=bike` 200.
- typecheck + lint green. NOT verified yet: price-sort ordering on /search (interrupted), Figma side-by-side for new pages (no frames exist anyway — improvised per DESIGN-NOTES §6).

## What was built in session 2 (beyond what PROGRESS previously listed)

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

Build-wise, v1.0.0 is feature-complete (Phases A–E all done). What's left is owner-side, not build work:

1. **Create 2–3 real collections** in the Shopify admin (with images), publish each to the Headless channel; optional `new-arrivals`/`top-selling` handles will then drive the home sections instead of the sort fallback. Until then, collection-dependent surfaces (nav links, footer Shop column, home tiles, PLP category list, collection facet filters) stay hidden/empty — this is correct behavior for a store with no collections yet, not a bug.
2. Once collections exist, re-verify `/collections/[handle]` (filters/facets against real variant-option data) and re-screenshot against Figma `26:855` for a final fidelity check.
3. **Currency**: store is set to GIP (Gibraltar Pound) — flagged twice now, still unanswered. Confirm intentional or change in Shopify Settings → General.
4. Optional/owner call, not required for v1.0.0: darken the compare-at price opacity or the discount-badge red slightly to close the two Lighthouse contrast findings (see README's Lighthouse section) — currently exactly matches the Figma spec's 30%-opacity/red-on-red values, so this is a design trade-off, not an oversight.
5. `/cart` on a ~390px viewport was fixed in session 2 (grid `lg:grid-cols-[1.4fr_1fr]`) but the owner's manual re-verification result was never reported back — worth a final look.

## Key design tokens (unchanged — full tables in DESIGN-NOTES §2)

Colors: primary/foreground `#000`, background `#fff`, secondary `#f0f0f0`, accent `#ff3333`, muted `#666`; border = foreground@10%. Type: heading uppercase (hero 64→36, section 48→32, titles 40→32/24); body 16/14. Pills everywhere, surfaces `rounded-card` (20px), section card r40. Container `max-w-310 px-4`, grid gap 20 (`gap-5`), 4-col home / 3-col PLP / 2-col mobile.
