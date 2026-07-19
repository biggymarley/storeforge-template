/**
 * Template-owned config type definitions.
 *
 * The `config/*.ts` files are STORE-OWNED (written by StoreForge); these types
 * are TEMPLATE-OWNED and may evolve across template versions. Compatibility
 * rule: every field added after v1.0.0 must be optional here, with a default
 * applied in `lib/config.ts` (`resolve*Config`) so old stores' config files
 * never break a newer template's build.
 */

export interface StoreColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
}

export interface HeroStat {
  /** e.g. "2,000+" */
  value: string;
  /** e.g. "High-Quality Products" */
  label: string;
}

export interface HeroConfig {
  /** Store-owned asset, e.g. "/branding/hero.jpg". Empty → plain surface hero. */
  image?: string;
  /** Falls back to the store tagline. */
  headline?: string;
  subtext?: string;
  /** Stats row under the hero copy. Empty → row hidden. */
  stats?: HeroStat[];
  /**
   * Shopify product handle to feature as the hero visual. Ignored when
   * `image` is set. Unset → template auto-picks a best-selling/new product.
   */
  productHandle?: string;
}

export interface StoreConfig {
  name: string;
  tagline?: string;
  logo?: { src: string; alt?: string };
  /** Store-owned asset, e.g. "/branding/favicon.png". Empty → template's static app/favicon.ico. */
  favicon?: string;
  colors?: Partial<StoreColors>;
  /** Font names from the curated allowlist in lib/fonts.ts; unknown → default. */
  fonts?: {
    heading?: string;
    body?: string;
    /** Store-owned uploaded font file, e.g. "/branding/fonts/heading.woff2". Takes priority over `heading`/`body` when set. */
    customHeading?: { src: string; format?: string };
    customBody?: { src: string; format?: string };
  };
  /** ISO 4217 code — display fallback only; Shopify's returned currencyCode wins. */
  currency?: string;
  announcement?: { enabled?: boolean; text?: string; href?: string };
  socials?: { instagram?: string; tiktok?: string; x?: string; facebook?: string };
  /** Homepage hero content (all optional — sane template defaults apply). */
  hero?: HeroConfig;
}

export interface LegalAddress {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface LegalConfig {
  companyName: string;
  /** Registered entity name if it differs from the trading name. */
  legalName?: string;
  address?: LegalAddress;
  emails?: { support?: string; legal?: string };
  phone?: string;
  /** Parameters interpolated into the generated /policies/* template text. */
  policies?: {
    returnWindowDays?: number;
    processingTimeDays?: number;
    shipFromCountry?: string;
  };
}

export interface SeoConfig {
  defaultTitle: string;
  /** `%s` is replaced with the page title, e.g. "%s | Acme". */
  titleTemplate?: string;
  description?: string;
  ogImage?: string;
  twitterHandle?: string;
}

export interface Testimonial {
  name: string;
  quote: string;
  /** 0–5, halves allowed. */
  rating: number;
  date?: string;
  verified?: boolean;
}

export interface ProductReview {
  name: string;
  quote: string;
  rating: number;
  date?: string;
  verified?: boolean;
}

export interface BrandLogo {
  name: string;
  /** Store-owned asset, e.g. "/branding/brands/acme.svg". */
  logoSrc: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface GalleryImage {
  /** Store-owned asset, e.g. "/branding/gallery/customer-1.jpg". */
  image: string;
  alt?: string;
  /** Optional destination — a product page, a collection, or the original Instagram/TikTok post. */
  href?: string;
}

export interface ContentConfig {
  /** Homepage "Our Happy Customers" carousel. Empty → section hidden. */
  testimonials?: Testimonial[];
  /** Header brand-logo strip. Empty → strip hidden. */
  brands?: BrandLogo[];
  /** PDP reviews keyed by Shopify product handle. Missing → reviews UI hidden. */
  productReviews?: Record<string, ProductReview[]>;
  /** PDP FAQs keyed by Shopify product handle. Missing → FAQ tab shows an empty state. */
  productFaqs?: Record<string, ProductFaq[]>;
  /** Homepage general FAQ section (shipping/returns/etc, not product-specific). Empty → section hidden. */
  faqs?: ProductFaq[];
  /** Homepage UGC/"shop the look" photo grid. Fewer than 4 → section hidden. */
  gallery?: GalleryImage[];
}
