"use client";

import { formatPrice } from "@/lib/format";

interface PriceSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currencyCode?: string;
}

const RANGE_INPUT =
  "pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary";

/** Figma dual-handle price slider: 20px black handles, black active track. */
export function PriceSlider({ min, max, value, onChange, currencyCode }: PriceSliderProps) {
  const [lo, hi] = value;
  const span = Math.max(1, max - min);
  const pct = (n: number) => ((n - min) / span) * 100;

  return (
    <div>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-secondary" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
          className={RANGE_INPUT}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
          className={RANGE_INPUT}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm font-medium">
        <span>{formatPrice(lo, currencyCode)}</span>
        <span>{formatPrice(hi, currencyCode)}</span>
      </div>
    </div>
  );
}
