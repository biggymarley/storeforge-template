# storeforge-template — Build Specification for Claude Code
## Shopify Storefront Template, implemented from a provided Figma design

> **Purpose:** You (Claude Code) are building the **storefront template repo** that StoreForge (a separate local tool, built from its own spec) will clone, configure, and deploy for each new store. Your two masters are: (1) the **Figma file** — it is the visual source of truth, and (2) the **StoreForge contract** (§2) — it is the structural source of truth. When they conflict, the contract wins; flag the conflict instead of silently deviating.

---

## 1. What this repo is

A standalone, production-grade **Next.js 15 + Tailwind v4 Shopify storefront** that:

- Renders any Shopify store via the **Storefront API** (GraphQL)
- Contains **zero hardcoded branding** — every store-specific value flows from `config/*.ts`, CSS variables, and env vars
- Is deployable as-is to Vercel with only env vars + config files changed
- Is versioned with **git tags** (`v1.0.0`, `v1.1.0`, …) — each tag is a release StoreForge can roll out to all live stores

It must build clean (`next build` zero errors, zero type errors) at every tag.

---

## 2. THE CONTRACT (non-negotiable — StoreForge depends on this)

### 2.1 Store-specific values live ONLY in these paths
```
config/store.ts        # brand: name, tagline, colors, fonts, socials, currency, announcement bar
config/legal.ts        # company name, address, emails, policy page content params
config/seo.ts          # default title/description/OG, twitter handle
public/branding/       # logo.svg|png, favicon.ico, og-image.png
store.meta.json        # written & owned by StoreForge — create a placeholder, never read it in app code
.env / .env.*          # Shopify credentials (never committed)
```

**Everything else is template-owned.** No component, page, layout, or util may contain a literal brand name, color hex, social URL, or company detail. If you catch yourself typing a store-specific literal outside `config/`, stop and route it through config.

### 2.2 `template.json` at repo root
```json
{
  "name": "storeforge-template",
  "version": "1.0.0",
  "protectedPaths": ["config/", "public/branding/", "store.meta.json", ".env", ".env.*"]
}
```
Bump `version` in lockstep with git tags.

### 2.3 Config shapes (machine-writable — StoreForge string-generates these files)
Keep each file to **exactly one exported const object with a type**. No functions, no computed values, no imports other than its own type. Example shape (extend fields as the Figma design demands, but keep the single-object rule):

```ts
// config/store.ts
import type { StoreConfig } from "@/lib/types/config";

export const storeConfig: StoreConfig = {
  name: "Placeholder Store",
  tagline: "Quality goods, delivered.",
  logo: { src: "/branding/logo.svg", alt: "Placeholder Store" },
  colors: {
    primary: "#111111",
    secondary: "#f5f5f0",
    accent: "#c96f4a",
    background: "#ffffff",
    foreground: "#111111",
    muted: "#6b7280"
  },
  fonts: { heading: "Fraunces", body: "Inter" },   // must map to next/font loaders in lib/fonts.ts
  currency: "USD",
  announcement: { enabled: true, text: "Free shipping over $50" },
  socials: { instagram: "", tiktok: "", x: "", facebook: "" }
};
```

Define `StoreConfig`, `LegalConfig`, `SeoConfig` types in `lib/types/config.ts`. **These type definitions are template-owned** (safe to evolve across versions); the config files themselves are store-owned. Adding a field in a new template version must be backward-compatible: every new field optional with a sane default applied via a `resolveConfig()` helper — old stores' config files must never break a new template's build.

### 2.4 Theming mechanism
- Root layout converts `storeConfig.colors` → CSS variables (`--color-primary`, etc.) on `<html>`
- Tailwind v4 theme maps tokens to those variables (`@theme` referencing `var(--color-primary)`)
- Fonts: `lib/fonts.ts` maps a **curated allowlist** of font names (8–12 Google fonts via `next/font/google`) to loaders; `storeConfig.fonts` picks by name; unknown name → default. Document the allowlist in README so StoreForge's wizard offers the same list.
- Result: a store's entire look changes by editing `config/store.ts` only. Verify this before every tag by flipping the placeholder config to a deliberately ugly second palette and eyeballing every page.

### 2.5 Environment variables (set by StoreForge on Vercel)
```
SHOPIFY_STORE_DOMAIN=xxx.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=...
SHOPIFY_ADMIN_TOKEN=          # optional; do not require it
NEXT_PUBLIC_SITE_URL=         # for canonical/OG urls
```
Validate at boot in `lib/env.ts` (Zod); missing Shopify vars → build-time friendly error, and in dev render a setup screen instead of crashing.

---

## 3. Working from the Figma file

The Figma file I provide is the design source of truth for layout, spacing, type scale, and components. Workflow:

1. **You have the Figma MCP connected** — use it. Start by pulling the file's structure: pages/frames list, then per-frame design context (`get_design_context` / screenshots) for every screen before writing any UI code.
2. **First deliverable: `DESIGN-NOTES.md`** — inventory the Figma file: list every frame/screen found, map each to a route (§4), extract the design tokens (colors, type scale, spacing, radii, shadows, breakpoints) into a table, and list every reusable component you identify (buttons, cards, badges, inputs, nav, footer…). **Show me this file and wait for my confirmation before building UI.** If the Figma is missing a screen the route map needs (e.g. no 404 design, no empty-cart state), list it under "Gaps — will improvise consistently with the design system."
3. **Token mapping rule:** Figma's colors become the *placeholder defaults* in `config/store.ts` + the semantic CSS variable names — not hardcoded values in components. If the Figma uses 14 grays, collapse to the semantic set (background/foreground/muted/border) and note the mapping in DESIGN-NOTES.md.
4. **Fidelity bar:** desktop and mobile frames both implemented; match spacing/type scale closely (Tailwind nearest step is fine, don't invent arbitrary values when a token exists); animations/micro-interactions only if shown or trivially implied (hover states).
5. Re-check Figma per feature as you build (screenshot the frame → compare to your implementation) rather than working from memory of the first pass.

---

## 4. Routes & features (adjust names to Figma, keep the set)

| Route | Content |
|---|---|
| `/` | Home: hero, featured collections, featured products, announcement bar, newsletter block (visual only or Shopify email capture if trivial) |
| `/products` | All products grid: filters (collection, price, availability), sort, pagination (cursor-based) |
| `/products/[handle]` | PDP: gallery, variants (options → variant resolution), price incl. compare-at, add to cart, description (rich), recommendations (Storefront `productRecommendations`) |
| `/collections/[handle]` | Collection page: banner from collection image/description + product grid |
| `/cart` | Cart page + slide-over mini-cart: line items, quantity update, remove, subtotal, checkout button → `cart.checkoutUrl` |
| `/search` | Search via Storefront `search`/predictive search, debounced |
| `/pages/[handle]` | Shopify pages (about etc.) rendered from Storefront API |
| `/policies/*` | Privacy, terms, shipping, refund — generated from `config/legal.ts` params (template text with company values interpolated) |
| `/404`, error, loading states | Designed, on-brand |

Global: header w/ nav (collections from API) + cart badge, footer (socials/legal links from config), announcement bar (config-gated).

---

## 5. Shopify integration (`lib/shopify/`)

- **Storefront API, GraphQL, API version pinned** (latest stable at build time; single constant).
- Typed client: small `fetch` wrapper `shopifyFetch<T>({ query, variables, cache })` with error normalization. Codegen optional — hand-written types per query are fine if complete; no `any`.
- Queries in `lib/shopify/queries/` (products, product-by-handle, collections, search, pages, recommendations); cart mutations in `lib/shopify/mutations/` (cartCreate, cartLinesAdd/Update/Remove).
- **Cart state:** cart ID in a cookie; server actions for mutations; optimistic UI via `useOptimistic`. No client-side global state library.
- **Caching:** product/collection queries `next: { revalidate: 60 }`; cart always `no-store`. 
- **Money:** single `formatPrice(amount, currencyCode)` util using `Intl.NumberFormat`; respect `storeConfig.currency` as fallback display locale only — Shopify's returned `currencyCode` wins.
- Handle Shopify errors gracefully: userErrors on mutations surfaced as toasts; API failure on pages → styled error state, never a raw crash.

---

## 6. Quality bar

- TypeScript strict, zero `any`, zero eslint errors.
- **SEO:** metadata via `generateMetadata` from `config/seo.ts` + per-product/collection data; JSON-LD (`Product`, `Organization`); `sitemap.ts` + `robots.ts`; canonical URLs from `NEXT_PUBLIC_SITE_URL`.
- **Performance:** `next/image` everywhere with Shopify CDN loader-friendly sizing; Lighthouse ≥ 90 perf/SEO/best-practices/a11y on home + PDP (document scores in README per tag).
- **Accessibility:** semantic landmarks, focus states per Figma (or visible defaults), alt text from Shopify data, keyboard-operable cart/menus.
- Server Components by default; `"use client"` only where interaction demands.

---

## 7. Dev experience

- README: setup (env vars, where to get a Storefront token, dev store note), font allowlist, config field docs, versioning/tagging procedure.
- `npm run dev` against a Shopify **development store** I'll provide credentials for via `.env.local`.
- Placeholder config must look intentionally generic (so it's obvious when a real brand hasn't been injected).
- Seed nothing; all data comes from the connected dev store.

---

## 8. Versioning & release procedure (per release)

1. All checks green: `tsc --noEmit`, lint, `next build`
2. Theming smoke test (§2.4 palette flip)
3. Bump `template.json.version`
4. Commit, `git tag vX.Y.Z`, push with tags
5. Changelog entry in `CHANGELOG.md` (StoreForge shows users nothing, but I read it)

**Compatibility rule for every version after 1.0.0:** never rename/remove a config field without a default-based fallback; never move files INTO a protected path or take template files OUT of one without flagging it to me first — protected paths are how live stores survive updates.

---

## 9. Build order

**Phase A — Figma intake:** pull full design context via Figma MCP → produce `DESIGN-NOTES.md` (screens↔routes map, token table, component inventory, gaps) → **stop for my review**.

**Phase B — Foundation:** scaffold (Next 15, TS strict, Tailwind v4), contract files (`config/*` placeholders + types + `resolveConfig`, `template.json`, `lib/env.ts`), theming pipeline (CSS vars, fonts allowlist), Shopify client + one proven query rendering raw data on a scratch page.

**Phase C — Design system:** build the component inventory from DESIGN-NOTES (buttons, cards, inputs, nav, footer, badges…) against Figma frames, using only semantic tokens.

**Phase D — Pages:** home → PLP → PDP → collections → cart (+ mini-cart) → search → pages/policies → 404/error/loading. Compare each against its Figma frame before moving on.

**Phase E — Hardening:** SEO/JSON-LD/sitemap, a11y pass, Lighthouse, error states, README, palette-flip test → tag **v1.0.0**.

---

## 10. Definition of done (v1.0.0)

- Deployed to Vercel with only env vars set → fully functional store on my dev-store data, visually matching the Figma on desktop + mobile.
- Changing `config/store.ts` colors/fonts/name restyles the entire site with zero other edits.
- `grep` for the placeholder brand name returns hits **only** inside `config/` — nothing else in the codebase knows the store's identity.
- Repo tagged `v1.0.0`, `template.json` at `1.0.0`, README + CHANGELOG + DESIGN-NOTES committed.
