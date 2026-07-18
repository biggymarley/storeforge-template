/**
 * Curated Google-font allowlist (template-owned).
 *
 * `storeConfig.fonts` picks by display name; unknown names fall back to the
 * defaults (heading: Archivo Black, body: Inter). Keep this list in sync with
 * README.md → Fonts so StoreForge's wizard offers the same choices.
 */
import {
  Anton,
  Archivo_Black,
  Bebas_Neue,
  DM_Sans,
  Fraunces,
  Inter,
  Oswald,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Work_Sans
} from "next/font/google";
import type { NextFont } from "next/dist/compiled/@next/font";

const archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap", preload: false });
const oswald = Oswald({ subsets: ["latin"], display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", preload: false });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false });
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", preload: false });
const workSans = Work_Sans({ subsets: ["latin"], display: "swap", preload: false });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", preload: false });

export const FONT_ALLOWLIST: Record<string, NextFont> = {
  "Archivo Black": archivoBlack,
  Anton: anton,
  "Bebas Neue": bebasNeue,
  Oswald: oswald,
  Fraunces: fraunces,
  "Playfair Display": playfairDisplay,
  Inter: inter,
  "DM Sans": dmSans,
  "Work Sans": workSans,
  "Plus Jakarta Sans": plusJakartaSans
};

export const HEADING_FONT_NAMES = [
  "Archivo Black",
  "Anton",
  "Bebas Neue",
  "Oswald",
  "Fraunces",
  "Playfair Display"
] as const;

export const BODY_FONT_NAMES = ["Inter", "DM Sans", "Work Sans", "Plus Jakarta Sans"] as const;

const DEFAULT_HEADING = "Archivo Black";
const DEFAULT_BODY = "Inter";

export function getFonts(fonts: { heading: string; body: string }): {
  heading: NextFont;
  body: NextFont;
} {
  return {
    heading: FONT_ALLOWLIST[fonts.heading] ?? FONT_ALLOWLIST[DEFAULT_HEADING],
    body: FONT_ALLOWLIST[fonts.body] ?? FONT_ALLOWLIST[DEFAULT_BODY]
  };
}

/**
 * Store-owned custom font upload (StoreForge writes it to public/branding/fonts/).
 * Loaded via a plain @font-face rule rather than next/font/local, since the
 * file may or may not exist at build time depending on whether the store
 * owner uploaded one — next/font/local requires a literal, always-present path.
 */
export function customFontFace(family: "storeforge-heading" | "storeforge-body", asset?: { src: string; format?: string }): string {
  if (!asset) return "";
  const format = asset.format ?? "woff2";
  return `@font-face { font-family: "${family}"; src: url("${asset.src}") format("${format}"); font-display: swap; }`;
}
