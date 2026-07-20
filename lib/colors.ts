/**
 * Picks black or white text for a given background so contrast is always
 * readable, using WCAG relative luminance. Runs at config-resolve time
 * (app/layout.tsx) — CSS `contrast-color()` isn't broadly supported yet.
 */
export function readableTextColor(backgroundHex: string): "#000000" | "#ffffff" {
  const hex = backgroundHex.trim().replace(/^#/, "");
  const expanded =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return "#ffffff";

  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(expanded.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // White text contrast = (1.05)/(L+0.05); black = (L+0.05)/0.05. Equal at L≈0.179.
  return luminance > 0.179 ? "#000000" : "#ffffff";
}
