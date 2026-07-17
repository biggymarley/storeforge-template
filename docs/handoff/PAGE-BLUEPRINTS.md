# PAGE-BLUEPRINTS.md — Measured Figma specs for Phase D

> **Build status lives in PROGRESS.md.** As of 2026-07-17: home, PLP, PDP, cart + mini-cart are BUILT from these specs (with per-frame screenshot comparison); the Search/pages/policies/errors section below is what remains.

Every value below was measured from the Figma file via MCP (`get_design_context` / `get_metadata`) during Phase A–C. Node IDs are included so the next builder can re-pull any section (`fileKey: 62A4MJq6lWhbal3v9Yi0oB`). Use semantic tokens, never these hexes, in components (see DESIGN-NOTES §2.1 mapping).

Container everywhere: 1240px max (`max-w-310 px-4 mx-auto`); mobile frames are 390 with 16px gutters. Desktop type ↓ mobile: hero 64→36, section titles 48→32, page titles 40→32 (PDP title →24).

---

## Global chrome

### Announcement bar — node `20:4`
Black (`bg-primary`), h 38, centered 14px white text: "Sign up and get 20% off to your first order. **Sign Up Now**" (link part underlined). Dismiss ✕ 20px at far right (x1320) — desktop only. Config-gated: `announcement.enabled`. ✅ Built: `components/layout/announcement-bar.tsx`.

### Header — node `26:861` (row y62, h48, hairline at y134)
gap 40: logo (Integral CF Bold 32, uppercase text) · nav links Satoshi 16 gap 24, "Shop" has chevron-down 16 gap 4 · search pill flex-1 (`bg #F0F0F0`, r62, px16 py12, icon 24, placeholder 40% black) · icons cart+account 24, gap 14.
Mobile (`39:1046-1057`): hamburger 24 left, logo, right icons search/cart/account 24 gap 12.
✅ Built: `header.tsx` — nav links come as props (collections from API in Phase D). Cart badge improvised (none in Figma).

### Footer — nodes `22:673`/`20:270-330`
- Newsletter band (`20:270`): black r20 card 1240×180, px64 py36. Heading Integral 40/45 (w 551) + right column w349: white pill email input (mail icon 24) above white pill "Subscribe to Newsletter" button, gap 14. **Band overlaps the gray footer by half its height** (band top y3781, gray starts y3871).
- Gray area (`#F0F0F0` → `bg-secondary`): brand col — logo Integral ~33, tagline 14/22 muted w248, then 4 social circles 28px gap 12. ⚠️ Fidelity note: in Figma the circles are **white with 1px border, except one filled black** (hover/active state); current `footer.tsx` renders all filled black — acceptable, but flip to white+border if pixel-matching.
- 4 link columns (design: Company/Help/FAQ/Resources — we ship Shop/Help/Legal + optional collections): titles 16 Medium uppercase tracking 3px, links 16 Regular 60% black, ~19px line rhythm.
- Hairline (y4238) then: copyright 14 muted left ("{company} © {year}, All Rights Reserved"), 5 payment badges right, each 46.6×30 with soft double shadow (baked into the SVGs in `public/payments/`).
✅ Built: `footer.tsx` + `newsletter-band.tsx` (translate-y-1/2 overlap trick).

---

## Home — `20:2` (desktop), `35:740` (mobile)

Section order: announcement → header → hero → brand strip → New Arrivals → hairline → Top Selling → Browse by Dress Style → testimonials → newsletter → footer.

1. **Hero** (rect `22:352` y134 h663, bg `#F2F0F1` → use `bg-secondary`): left col from x100 — H1 Integral 64/64 w577 "FIND CLOTHES THAT MATCHES YOUR STYLE" (placeholder copy → make config/tagline-driven or template copy w/ store name; NOT hardcoded brand); body 16 muted; "Shop Now" primary button 210×52 (px54 py16) → `/products`. Stats row (`22:349`, y607, w596 h74): three groups "200+ / International Brands", "2,000+ / High-Quality Products", "30,000+ / Happy Customers" — numbers Satoshi Bold 40, labels 14 muted, thin vertical dividers gap ~32. Right: model photo (fill of the rect, right ~47% width) + two decorative 4-point star vectors (104px `22:358` at top-right, 56px `22:359` mid-left of image). Mobile: text stacked above full-width image; stats wrap 2+1.
   **Open decision (proposed):** hero image = optional store-owned `public/branding/hero.{png,jpg}` config field (`storeConfig.hero?: {image, headline?, sub?}` — add as OPTIONAL field + resolveConfig default); fallback renders the plain `bg-secondary` hero without photo. Star decorations: export nodes `22:358`/`22:359` as SVG (template-owned).
2. **Brand strip**: black band h122, logos ~32h. ✅ Built config-driven (`brand-strip.tsx`), hidden when `content.brands` empty.
3. **New Arrivals** (`22:377` title y991): title Integral 48 uppercase centered; grid 4× cards 295×298 gap 20 (y1104); card = tile r20 `#F0F0F0`, title 20 Bold (y1418), rating row (stars 18.5 + "4.5/5" 14), price 24 Bold w/ compare-at + badge; "View All" secondary 218×52 centered (y1548) → `/products?sort=newest`. Hairline `22:495` (y1664).
   **Data (proposed):** collection handle `new-arrivals` if it exists, else `products(sortKey: CREATED_AT, reverse: true, first: 4)`. Document the convention in README so store owners can control the sections by creating those collections.
4. **Top Selling** (`22:496` y1728): identical layout; handle `top-selling` else `sortKey: BEST_SELLING`. View All → `/products?sort=best-selling`.
5. **Browse by Dress Style** (`22:672`, y2417, 1239×866): section card `#F0F0F0` **r40**, title Integral 48 centered (y ~2481); 2 rows of white r20 photo tiles gap 20: row1 [407w, 684w], row2 [684w, 407w], h289 each; label Satoshi Bold 36 top-left px ~36 py ~25; photos right-aligned inside tiles. Labels in design: Casual/Formal/Party/Gym.
   **Data (proposed):** first 4 collections that have images (excluding new-arrivals/top-selling), linking to `/collections/[handle]`; hide section if <2. Alternative: config list. Decide + document.
6. **Testimonials** (`24:713` y3363): title "OUR HAPPY CUSTOMERS" Integral 48 left; prev/next arrows 24 right (reuse `IconArrow` rotated ±90). Horizontal card rail (`24:714…`): cards 400×240 (r20 border card px32 py28 — matches `ReviewCard`), gap 20, off-screen cards peek + **edge fade/blur** on both sides in design. Client carousel (scroll-snap is fine). Data: `contentConfig.testimonials`; hide when empty. ✅ Card built.

## PLP — `/products` & `/collections/[handle]` — `26:855` (desktop), `38:234` + Filters `38:679` (mobile)

- Breadcrumb y158. Two columns from y204: sidebar 295 + main (grid 3×295 gap 20).
- **Sidebar** (`29:1218`, r20 border px24 py20, gap 24 with hairline dividers): "Filters" 20 Bold + sliders icon 24 · category list (16 regular 60% black, rows gap 20, chevron-right 16) — in design T-shirts/Shorts/Shirts/Hoodie/Jeans → use collections list or product types · "Price" 20 Bold + chevron — dual-handle slider (build a small client range slider, handles 20px black circles, track black, labels 14 Medium under handles) · "Colors" 20 Bold — 37px swatch grid gap ~15 (from variant option values w/ `swatch.color` — Storefront `optionValues.swatch` already in our PRODUCT_FRAGMENT) · "Size" 20 Bold — chips wrap gap 8 (px20 py10, 14px) · "Dress Style" list like categories · "Apply Filter" primary full-width h48.
- **Main header row**: title Satoshi Bold 32 (collection title / "All Products") left; right: "Showing 1–10 of 100 Products" 14 muted + "Sort by: **Most Popular**" (14 muted + 16 Medium black + chevron). Sort dropdown open state NOT designed — improvise r20 card menu.
- Grid rows gap ~36 vertical. Pagination (`29:7637`, y1611 h40): prev/next outline buttons r8 border-border px3.5 py2 gap 2 (arrow 20 + 14 Medium) + numbered 40×40 r8 strip (active = 10% black bg) — **we ship prev/next only** (cursor pagination, spec §4); `Pagination` component ✅ built.
- **Mobile**: 2-col grid tiles 172×174, gap 14; filters open via 32×32 sliders button next to title → bottom drawer `38:679` (rounded-t-20, same inner sections, ✕ close).
- **Filter state (proposed):** URL search params — `?price_min=&price_max=&sizes=&colors=&sort=&after=&before=` → map to Storefront `ProductFilter[]` (`available`, `price`, `variantOption`) on collection queries; `/products` uses `products(query:)` syntax for price/availability and sorts. `/search` reuses the PLP shell.

## PDP — `/products/[handle]` — `1:2` (desktop), `35:1062` (mobile)

- Breadcrumb y158 (Home > collection > product-type when known).
- **Left gallery** (x100–710): 3 thumbs 152×167 r20 stacked gap ~14 (active = 1px black border), main image 444×530 r20 at x266. Mobile: main image full-width then 3 thumbs row (~112 each).
- **Right column** (x750, w590): title Integral CF Bold 40 (uppercase); rating row (stars + 14 label); price row y317: 32 Bold + compare-at 32 strike 30% + discount badge (larger: ~px-3.5 py-1.5, 16px text in design h34); description 16/22 muted; hairline; "Select Colors" 14 muted → swatches 37px gap 16 (variant option "Color"); hairline; "Choose Size" 14 muted → chips **larger than PLP: px-6 py-3, 16px text, h46** (option "Size"); hairline y670; row: `QuantityStepper` 170×52 + "Add to Cart" primary flex-1 (400×52) gap 20.
- Variant resolution: selectedOptions map → find variant; disable unavailable combos; default select first available variant's options; price/compare-at/image follow selected variant.
- **Tabs** (y826, full-width hairline): "Product Details" / "Rating & Reviews" / "FAQs" — 16px muted, active black Medium w/ 2px black underline segment (~414 wide, centered under label). Content: Details = `descriptionHtml` (rich text, prose styling); Reviews = config reviews (below); FAQs = hidden unless data exists (DESIGN-NOTES gap decision).
- **Reviews section**: "All Reviews" 24 Bold + "(451)" 14 muted inline; controls right: sliders icon in 48×48 `bg-secondary` circle, "Latest" pill dropdown (px20, h48, chevron), "Write a Review" primary h48 (can be non-functional/hidden v1 — config reviews are read-only). Cards grid 2×610 gap 20, rows ~242 tall; "Load More Reviews" secondary 230×52 centered. Source: `getProductReviews(handle)`; **hide the whole tab when empty**.
- **"You might also like"** (y1878): Integral 48 centered; 4-card grid from `productRecommendations(productId)` (fallback: same-collection products).
- JSON-LD Product schema in Phase E.

## Cart — `/cart` — `31:32` (desktop), `39:1045` (mobile)

- Breadcrumb, then title "YOUR CART" Integral 40 uppercase (y204).
- **Lines card** (`31:403`, 715 wide, r20 border px24 py20): rows gap 24 with hairline dividers. Row: thumb 124×124 **r~9 (rounded-lg, NOT r20)** bg `#F0EEED`≈secondary · middle col h118 space-between: title 20 Bold, "Size: X" / "Color: Y" 14 (label black, value muted, gap 4), price 24 Bold bottom · right col h124 items-end space-between: trash 24 (accent red) top, compact stepper (px20 py12, icons 20, text 14) bottom.
- **Order Summary** (`31:645`, 505 wide, r20 border px24 py20, gap 24): title 24 Bold; rows 20px (label regular muted / value Bold black, gap 20): Subtotal, Discount (−value in accent; render only when `discountAllocations` non-empty), Delivery Fee (only if Shopify returns it — else omit row); hairline; Total: label 20 regular black, value 24 Bold. Promo row: `PillInput` tag-icon flex-1 + "Apply" primary w119 → `cartDiscountCodesUpdate`. "Go to Checkout →" primary h60 full-width (arrow 24) → `cart.checkoutUrl`.
- Mobile: stacked (lines card, then summary). Empty state: not designed — improvise (big Integral heading, muted copy, "Shop Now" button).
- **Mini-cart slide-over** (spec §4, not in Figma): right-side panel, r20 left corners, same line-item rows + subtotal + checkout/view-cart buttons; `useOptimistic` for add/update/remove.

## Search / pages / policies / errors (no Figma frames — DESIGN-NOTES §6)

- `/search`: PLP shell; header = "Search results for “{q}”" + count; predictive dropdown under header SearchBar (debounced ~300ms, r20 card, product rows w/ 40px thumbs) via `PREDICTIVE_SEARCH_QUERY`.
- `/pages/[handle]`: prose layout — Integral 40 h1, body 16/22 (style `descriptionHtml`-like with a small prose CSS block), 720px measure.
- `/policies/{privacy,terms,shipping,refund}`: template text files (template-owned) interpolating `legalConfig` values (company, address, emails, returnWindowDays, processingTimeDays, shipFromCountry). Same prose layout.
- 404/error: centered Integral CF headline ("NOTHING TO SEE HERE" style), muted copy, primary "Back to Home"/"Shop Now" pill. loading.tsx per route with `ProductCardSkeleton` grids echoing each layout.
- Toasts (mutation userErrors): black pill, bottom-center, auto-dismiss.
