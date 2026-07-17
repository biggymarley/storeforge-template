# Changelog

## [Unreleased]

### Phase A — Figma intake
- `DESIGN-NOTES.md`: screens↔routes map, token tables, component inventory, gaps, and owner-confirmed decisions (reviews/brands → `config/content.ts`; Google-font placeholders Archivo Black + Inter).

### Phase B — Foundation
- Scaffold: Next.js 15.5 (App Router, Turbopack), TypeScript strict, Tailwind v4, ESLint 9.
- Contract: `lib/types/config.ts` (Store/Legal/Seo/Content), four `config/*.ts` placeholders, `resolve*Config()` defaults, `template.json`, `store.meta.json` placeholder, `public/branding/` placeholders.
- Theming: config colors/fonts → `--site-*` vars on `<html>` → Tailwind `@theme` tokens; curated 10-font Google allowlist in `lib/fonts.ts`.
- Env: Zod validation in `lib/env.ts`; dev setup screen instead of crash; friendly build-time error for data pages.
- Shopify: pinned API `2026-01`, typed `shopifyFetch`, fragments, queries (products, product-by-handle, collections, collection-by-handle, search, predictive search, pages, recommendations, cart), cart mutations (create, lines add/update/remove, discount codes).
- `/dev/scratch` proving page rendering raw `products(first: 5)`.
