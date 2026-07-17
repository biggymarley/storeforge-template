import type { ButtonHTMLAttributes } from "react";

interface ColorSwatchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color: string;
  colorName: string;
  selected?: boolean;
}

/** Figma: 37px color circle; selected shows a white check. */
export function ColorSwatch({ color, colorName, selected = false, className = "", ...props }: ColorSwatchProps) {
  return (
    <button
      type="button"
      title={colorName}
      aria-label={colorName}
      aria-pressed={selected}
      className={`relative size-9 rounded-full border border-border transition-transform hover:scale-105 ${className}`}
      style={{ backgroundColor: color }}
      {...props}
    >
      {selected ? (
        <svg
          viewBox="0 0 16 16"
          className="absolute inset-0 m-auto size-4 text-white mix-blend-difference"
          fill="none"
          aria-hidden="true"
        >
          <path d="M13.5 4.5 6.5 11.5 2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}
