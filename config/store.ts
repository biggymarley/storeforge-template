import type { StoreConfig } from "@/lib/types/config";

export const storeConfig: StoreConfig = {
  name: "Placeholder Store",
  tagline: "Quality goods, delivered.",
  logo: { src: "/branding/logo.svg", alt: "Placeholder Store" },
  colors: {
    primary: "#000000",
    secondary: "#f0f0f0",
    accent: "#ff3333",
    background: "#ffffff",
    foreground: "#000000",
    muted: "#666666"
  },
  fonts: { heading: "Archivo Black", body: "Inter" },
  currency: "USD",
  announcement: {
    enabled: true,
    text: "Sign up and get 20% off to your first order.",
    href: ""
  },
  socials: { instagram: "", tiktok: "", x: "", facebook: "" },
  hero: {
    image: "",
    headline: "Find products that match your style",
    subtext:
      "Browse through our diverse range of meticulously crafted products, designed to bring out your individuality and cater to your sense of style.",
    stats: []
  }
};
