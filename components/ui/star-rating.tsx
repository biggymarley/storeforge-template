import { IconStar, IconStarHalf } from "@/components/icons";

interface StarRatingProps {
  /** 0–5; halves rendered with the Figma half-star glyph. */
  rating: number;
  /** Show the "4.5/5" label next to the stars (Figma default). */
  showLabel?: boolean;
  size?: number;
  className?: string;
}

export function StarRating({ rating, showLabel = true, size = 18, className = "" }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-rating" role="img" aria-label={`Rated ${clamped} out of 5`}>
        {Array.from({ length: full }, (_, i) => (
          <IconStar key={i} width={size} height={size} />
        ))}
        {half ? <IconStarHalf width={size * 0.48} height={size * 0.92} /> : null}
      </div>
      {showLabel ? (
        <span className="text-sm">
          {clamped}/<span className="text-muted">5</span>
        </span>
      ) : null}
    </div>
  );
}
