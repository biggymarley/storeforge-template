# ARCHITECTURE-DECISIONS.md — Why things are the way they are

Companion to `PROGRESS.md` (state) and `PAGE-BLUEPRINTS.md` (specs). This file is the *reasoning* — read it before changing any foundation code.

## Theming

- **`--site-*` runtime vars, not Tailwind values**: `app/layout.tsx` writes `storeConfig.colors` + resolved font families to `--site-primary` etc. on `<html>` (inline style). `app/globals.css` `@theme inline` maps Tailwind tokens to those vars. The `--site-` prefix avoids colliding with Tailwind's own `--color-*` / `--font-*` namespaces. This is THE contract mechanism (spec §2.4): a store restyles by editing `config/store.ts` only. Never hardcode a hex/font in a component — if you need a new color role, add a semantic token to both files + a config field (optional! with resolveConfig default).
- **Derived tokens are computed, not configured**: `--color-border = color-mix(foreground 10%)`; text emphasis via opacity utilities (`text-foreground/60`). Keeps `StoreConfig.colors` at exactly 6 fields for StoreForge's wizard.
- **Fonts**: every allowlist font is declared at module scope in `lib/fonts.ts` (next/font requirement) with `preload: false` (10 fonts, only 2 used). Selection happens by *name* at render via `getFonts()`; the chosen families land in `--site-font-heading/body` using `font.style.fontFamily` (includes the fallback stack). Unknown names silently fall back — old configs must never break builds.
- **Text logo, not image**: header/footer render `store.name` in `font-heading` (matches Figma's SHOP.CO text logo and always themes correctly). `public/branding/logo.svg` still exists for favicon/OG/StoreForge use. If a store needs an image logo later → optional `storeConfig.logo.useImage` field, default false.

## Config & contract

- **4th config file `config/content.ts`** (owner-approved deviation, documented in README + DESIGN-NOTES §4): testimonials/brands/productReviews. All `ContentConfig` fields optional → `{}` is a valid file. StoreForge must be told to generate it.
- **resolve*Config pattern**: input types have optional fields; `Resolved*` interfaces are fully required. ALL consumer code goes through resolvers — components never import `config/*` directly (exception: the resolvers themselves). This is the backward-compat story for template updates over live stores.
- **`store.meta.json`**: exists as placeholder only. Nothing in `app/`/`lib` may ever read it (StoreForge's file).
- **Brand-leak check** (spec §10): `grep -rn -iE "placeholder store" app components lib` must return nothing. Run before every tag.

## Shopify integration

- **API `2026-07`** — latest stable at build time (verified against shopify.dev July 2026), single constant in `lib/shopify/constants.ts`. Webhook config in the owner's dashboard also showed 2026-07.
- **Token duality**: owner uses a **Headless-channel private token** (`shpat_…`). Those authenticate via `Shopify-Storefront-Private-Token`; classic/custom-app + public tokens use `X-Shopify-Storefront-Access-Token`. `shopifyFetch` sniffs the `shpat_` prefix — keep this, it makes the template work with any token StoreForge provisions. (Public tokens rate-limit by caller IP — bad for our all-server-side rendering; docs research is in the session log.)
- **Hand-written GraphQL types** (`lib/shopify/types.ts`), no codegen — spec allows it; keep them complete, zero `any`. Result-shape interfaces (`ProductsQueryResult` etc.) pair 1:1 with query constants.
- **Caching**: reads `next: { revalidate: 60 }` (default in client), cart ops `cache: "no-store"`. Optional `tags` plumbed through for future `revalidateTag`.
- **Error normalization**: everything → `ShopifyError` (transport/HTTP/GraphQL variants). Pages catch it → styled error state; mutations surface `userErrors` as toasts (toast system not yet built — Phase D).
- **Env gating**: `isShopifyConfigured()` for dev setup-screen branching; `getEnv()` throws the friendly multi-line error (this is what makes `next build` fail helpfully when StoreForge misconfigures a deploy).

## Cart (Phase D — BUILT; as-built notes)

- Cookie `cartId` (httpOnly, secure-in-prod, sameSite=lax, 30d) holding the Shopify cart GID. Set only inside server actions (`cart-actions.ts`); `getCart()` is read-only.
- `lib/shopify/cart-actions.ts` — `"use server"`: `addToCart(variantId, qty)`, `updateCartLine(lineId, qty)`, `removeCartLine(lineId)`, `applyDiscountCode(code)`. Each returns `{ok, error?}` for the toast layer; `addToCart` creates the cart on demand and retries once if the cookie points at an expired cart; all end with `revalidateTag("cart")` (acts as the router-refresh signal — the cart fetch itself is no-store/untagged).
- `applyDiscountCode` extra check: Shopify accepts unknown codes without a userError (just `applicable: false`) — we surface that as an error.
- **`CartProvider` receives the RESOLVED cart from the (store) layout** (layout awaits `getCart()`), NOT a promise+`use()` like Next Commerce. Reason: one provider instance = one shared `useOptimistic` state, so header badge, mini-cart and /cart page stay consistent during optimistic updates. Trade-off: layout render blocks on one no-store roundtrip — acceptable, pages are dynamic anyway (cookies).
- `useOptimistic` reducer handles update/remove and recomputes line totals + subtotal + totalQuantity locally; server revalidation rebases it.
- Mini-cart slide-over opens from the header cart icon (`CartTrigger`); `/cart` reachable via its "View Cart". Checkout = plain `<a>` to `cart.checkoutUrl`. Never build custom checkout.
- Toasts: `components/ui/toast.tsx` context provider in the (store) layout; black pill bottom-center, accent variant for errors, 4s auto-dismiss.

## Design-system conventions

- Class merging is plain template strings — no `clsx`/`cva` dependency; keep zero-dep discipline unless complexity forces it (then ask owner).
- Icons: `components/icons.tsx` is **generated from Figma exports** (session script cleaned artifacts, forced currentColor, kept geometry byte-exact). Don't hand-edit paths; re-export from Figma if a glyph is wrong. `IconArrow` points RIGHT natively (verified in-browser 2026-07-17; an earlier note here claimed it pointed down) — rotate for other directions (`rotate-180` = left). The only non-Figma glyph is `IconTiktok` (design had GitHub; config contract needs TikTok).
- Client components ONLY where interaction demands (spec §6): announcement dismiss, mobile menu, search bar, newsletter form, qty stepper, (future: tabs, carousel, filters drawer, slider, mini-cart). Everything else stays server.
- Spacing: Tailwind v4 numeric spacing is `0.25rem × n` — arbitrary numerics like `px-13.5` (=54px, the Figma button padding) and `max-w-310` (=1240px container) are intentional, not typos.
- `rounded-card` = 20px (defined in `@theme`); pills = `rounded-full`. No shadows anywhere except payment badge SVGs (baked in) and improvised overlays.

## Dev/QA surfaces

- `/dev/scratch` — raw products query (Phase B gate). `/dev/components` — component gallery. Both template-internal, unlinked; consider `robots` disallow or removal decision at Phase E (removal is fine; scratch's job is done once pages render real data).
- Verification loop: `npm run typecheck && npm run lint && npm run build`, then eyeball dev server. A background dev server from this session may still hold port 3199 (`lsof -ti:3199 | xargs kill` if needed).

## Release procedure (spec §8 — none done yet)

checks green → **palette-flip test** (temporarily swap `config/store.ts` colors/fonts to an ugly second palette, eyeball every page, revert) → bump `template.json` + `package.json` versions → commit → `git tag v1.0.0` → CHANGELOG. Owner pushes/hosts; there is no remote configured yet.
