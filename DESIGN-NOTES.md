# DESIGN-NOTES.md — Figma intake (Phase A)

**Source file:** [E-commerce Website Template (Freebie) — Community Copy](https://www.figma.com/design/62A4MJq6lWhbal3v9Yi0oB/) — the "SHOP.CO" fashion storefront design.
**Contents:** one page ("Pages"), 9 top-level frames — 4 screens × (desktop 1440px + mobile 390px) + 1 mobile filter panel. No published components/variants — everything is loose frames, so the component inventory below is extracted by inspection. Figma variables exist only for payment-brand icon colors (not used as design tokens).

---

## 1. Screens ↔ Routes

| Figma frame | Node (desktop / mobile) | Route | Notes |
|---|---|---|---|
| Homepage | `20:2` / `35:740` | `/` | Hero, brand strip, New Arrivals, Top Selling, Browse by Dress Style, testimonials, newsletter, footer |
| Product Detail Page | `1:2` / `35:1062` | `/products/[handle]` | Gallery (3 thumbs + main), color/size selectors, qty + Add to Cart, tabs (Details / Reviews / FAQs), "You might also like" |
| Category Page | `26:855` / `38:234` | `/collections/[handle]` | Filter sidebar (desktop) / drawer (mobile), sort, results count, 3×3 grid (2-col mobile), pagination |
| Cart | `31:32` / `39:1045` | `/cart` | Line items card, order summary, promo code, checkout CTA |
| Filters (mobile) | `38:679` | — (component) | Bottom-sheet/drawer version of the filter sidebar |

**Routes with no dedicated frame** (see §6 Gaps): `/products` and `/search` will reuse the Category Page layout; `/pages/[handle]` and `/policies/*` will use a simple prose layout in the same type system.

---

## 2. Design tokens

### 2.1 Colors → semantic mapping (`config/store.ts` placeholder defaults)

The design is essentially monochrome: black + white + one gray family + a functional red. All "grays" in the file are **black at reduced opacity** — I'm collapsing them to a semantic set as required by the spec.

| Figma value | Where used | Semantic token | Config field |
|---|---|---|---|
| `#000000` | Buttons, headings, body text, footer newsletter band, selected chips | `primary` + `foreground` | `colors.primary`, `colors.foreground` |
| `#FFFFFF` | Page background, text on black | `background` | `colors.background` |
| `#F0F0F0` | Product image tiles, search & promo inputs, size/filter chips, qty stepper | `secondary` (surface) | `colors.secondary` |
| `#F2F0F1` | Hero background | → collapsed into `secondary` (visually indistinguishable; one surface token) | — |
| `rgba(0,0,0,0.6)` | Secondary text (descriptions, filter labels, prices labels) | `muted` | `colors.muted` (`#666666` solid equiv.) |
| `rgba(0,0,0,0.4)` | Input placeholders, footer copy | `muted` at reduced emphasis (opacity utility on `muted`) | — |
| `rgba(0,0,0,0.3)` | Compare-at (strikethrough) prices | derived: `foreground/30` | — |
| `rgba(0,0,0,0.1)` | Card borders, dividers, footer hairlines | derived: `border` = `foreground/10` | — |
| `#FF3333` | Discount badges (`-20%` on `rgba(255,51,51,0.1)` bg), discount amount in summary, trash icon | `accent` (sale/destructive) | `colors.accent` |
| `#FFC633` (approx.) | Rating stars | template-owned constant (not brand-specific) | — |
| `#01AB31` (approx.) | "Verified" check on reviews | template-owned constant | — |

Derived tokens (`border`, `foreground/30`, placeholder opacity) will be computed from the semantic set via CSS `color-mix()`/opacity — no extra config fields needed.

### 2.2 Typography

| Role | Figma spec | Notes |
|---|---|---|
| Display / hero | **Integral CF Bold** 64/64 desktop, 36/34 mobile, uppercase | Logo also Integral CF Bold 32 |
| H2 section titles ("NEW ARRIVALS") | Integral CF Bold 48, mobile 32 | Uppercase |
| H1 page/product titles ("YOUR CART", PDP title) | Integral CF Bold 40, mobile 32 (PDP mobile 24) | Uppercase |
| Card/product title | Satoshi Bold 20 | |
| Price | Satoshi Bold 24 (cards) / 32 (PDP) | Compare-at same size, strikethrough, 30% black |
| Widget titles ("Filters", "Price") | Satoshi Bold 20; "Order Summary" 24 | |
| Body / nav links | Satoshi Regular 16 | Secondary text at 60% black |
| Small (chips, meta, announcement) | Satoshi Regular/Medium 14 | |
| Badge | Satoshi Medium 12 | |
| Buttons | Satoshi Medium 14–16 | |

⚠️ **Contract conflict — fonts:** Integral CF (paid, CreativeMarket) and Satoshi (Fontshare) are **not on Google Fonts**, but §2.4 of the spec mandates a `next/font/google` allowlist. Contract wins. Proposed placeholder mapping: heading → **Archivo Black** (closest free geometric heavy sans), body → **Inter**. Proposed allowlist (10): Archivo Black, Anton, Oswald, Bebas Neue, Fraunces, Playfair Display (headings) · Inter, Plus Jakarta Sans, DM Sans, Work Sans (body). If you want pixel-true SHOP.CO fidelity instead, we'd need `next/font/local` + committed font files — flagging for your call; defaulting to the Google allowlist.

### 2.3 Spacing / layout

| Token | Value |
|---|---|
| Container | max-width **1240px** (100px gutters @1440); mobile gutter **16px** |
| Section vertical rhythm | 64–80px desktop; 40–50px mobile |
| Grid | Product grid: 4-col home / 3-col PLP, **20px gap** (cards 295×298); 2-col mobile (172px tiles, 14px gap) |
| Component padding | Buttons `16px × 54px`; chips `10px × 20px`; inputs `12px × 16px`; cards `20px × 24px` |
| Common steps | 4, 8, 12, 14, 16, 20, 24, 40 — all map to standard Tailwind steps |

### 2.4 Radii, borders, shadows

| Token | Value | Used on |
|---|---|---|
| `radius-full` (Figma: 62px) | pill / `9999px` | All buttons, chips, inputs, badges, qty steppers |
| `radius-lg` | **20px** | Product image tiles, cards (filters, order summary, reviews), newsletter band, dress-style tiles, gallery images |
| Border | 1px `foreground/10` | Cards, dividers |
| Shadows | **None** in the design | Flat aesthetic; mini-cart/drawers get a shadow when improvised (overlay context) |

### 2.5 Breakpoints

Only two frame widths exist: **1440** and **390**. Plan: mobile-first, `md`/`lg` Tailwind defaults; grid columns 2 → 3/4 at `lg`, filter sidebar becomes drawer below `lg`, nav collapses to hamburger below `md`.

---

## 3. Component inventory (build list for Phase C)

**Layout / global**
- Announcement bar — black, 14px white text, inline link, dismiss ✕ (config-gated per contract)
- Header — logo (text), "Shop" dropdown + 3 links, pill search input, cart + account icons; mobile: hamburger + logo + search/cart/account icons
- Footer — brand col (logo, blurb, 4 round social icons), 4 link columns, hairline, copyright, payment badges (Visa/MC/PayPal/Apple/Google)
- Newsletter CTA band — black, radius 20, Integral heading 40, pill email input + white pill button
- Breadcrumbs — 14–16px, chevron separators, current = black

**Primitives**
- Button: primary (black pill), secondary (white pill, `foreground/10` border — "View All"), with icon (checkout arrow), sizes 46–60px tall
- Chip/toggle: size & filter chips (`#F0F0F0` idle / black selected)
- Color swatch — 37px circle, white check when selected
- Badge — discount pill (12px, `#FF3333` on 10% red)
- Star rating — full/half stars + "4.5/5" label
- Input — pill, `#F0F0F0`, leading icon (search, promo, email variants)
- Quantity stepper — pill, − / count / +
- Tabs — 3-up, hairline bottom, active = black 2px underline + bold
- Pagination — prev/next outline buttons + numbered pages (8px radius, active = 10% black bg)
- Dropdown trigger — "Sort by: Most Popular ⌄" (open state not designed)

**Commerce**
- Product card — tile (radius 20, `#F0F0F0` bg) + title 20 Bold + rating + price row (price / compare-at / badge)
- PDP gallery — 3 vertical thumbs (active = 1px black border) + large main image; mobile: main + 3 thumbs row
- Variant selectors — "Select Colors" swatches; "Choose Size" chips (single-select)
- Cart line item — 124px thumb, title, Size/Color meta, price, red trash, qty stepper
- Order summary card — label/value rows, red discount, hairline, total, promo input + Apply, "Go to Checkout →"
- Review card — radius 20 border card: stars, name + verified check, quote, "Posted on" date, ⋯ menu
- Testimonial carousel — same card, horizontal scroll, edge-fade, arrow controls
- Dress-style tiles — white radius-20 photo tiles in `#F0F0F0` radius-40 section
- Brand logo strip — black band, 5 logos (see conflict below)
- Filter panel — category list, dual-handle price slider, color grid, size chips, dress-style list, Apply button (sidebar ≥lg, drawer <lg per `38:679`)

---

## 4. Data-source conflicts (contract/Shopify wins — flagging, not deviating silently)

> **✅ Decisions confirmed (owner review, 2026-07-17):**
> 1. **Reviews/testimonials → store-owned config** — new `config/content.ts` (`ContentConfig` type: testimonials + optional per-product review entries). Lives under the protected `config/` path; **note for StoreForge: it must generate this 4th config file** alongside store/legal/seo.
> 2. **Brand logo strip → config-driven** — `content.brands: {name, logoSrc}[]`, assets in `public/branding/`, section hidden when list is empty.
> 3. **Fonts → Google allowlist as proposed** (heading: Archivo Black, body: Inter placeholders). Owner may revisit; swap is a config-only change by design.
> 4. All §6 gaps: improvise consistently with the design system, without breaking the build-spec contract.

1. **Fonts not Google-hosted** — see §2.2. Default: Archivo Black + Inter placeholders unless you want self-hosted originals.
2. **Reviews & ratings** — the design leans heavily on ratings (cards, PDP tab, 451 reviews, testimonials), but the Shopify Storefront API has **no native reviews**. Default plan: build the UI, source from product metafields if present, otherwise hide rating rows and the Reviews tab gracefully. Homepage testimonials become config/template-driven or hidden.
3. **Brand logo strip** (Versace/Zara/Gucci/Prada/CK) — licensed marks; can't ship hardcoded. Default: render from an optional config list of `{name, logoSrc}` (store-owned assets in `public/branding/`), section hidden when empty.
4. **"SHOP.CO" brand, "-20%" order discount, promo code** — brand name/logo → `config/store.ts`; order-level discount rows render only when Shopify's cart returns discount allocations; promo input wires to `cartDiscountCodesUpdate`.
5. **Hero copy, stats (200+ brands…), category names** — all Figma copy is placeholder content → config placeholders or Shopify data (collections), never literals in components.

---

## 5. Fidelity notes

- Only **selected/active** states are designed (chips, tabs, gallery thumb, pagination). Hover/focus states will be trivially derived (opacity/underline), per spec §3.4.
- Mobile frames mirror desktop 1:1 in structure; nav collapses to hamburger, filters become the `38:679` drawer, grids drop to 2-col, type steps down (64→36, 48→32, 40→32/24).

---

## 6. Gaps — will improvise consistently with the design system

- **`/products` (all products) & `/search`** — no frames; reuse Category Page layout (search adds query header + predictive dropdown styled like the filter card)
- **Mini-cart slide-over** (required by §4) — compose from cart line item + order summary styles, radius-20 panel
- **Empty states** — empty cart, no search/filter results
- **404 / error / loading** — big Integral CF headline + pill CTA, on-brand; skeletons echo `#F0F0F0` tiles
- **Mobile nav menu open state** — hamburger drawer, list styled like filter categories
- **`/pages/[handle]` & `/policies/*`** — prose layout: Integral CF h1, Satoshi-style body, 1240 container
- **PDP "Product Details" & "FAQs" tab content** — only Reviews is designed; Details = description rich text, FAQs = hidden unless metafields provide content
- **Dropdown open states** (Sort, "Shop" nav) — styled menus on radius-20 card
- **Newsletter success/error feedback** — inline message in band
- **Toasts** (mutation `userErrors`, §5) — black pill toast, bottom-center

---

*Next: on your confirmation, Phase B (scaffold + contract files + theming + Shopify client). Nothing UI-related is built yet.*
