import { IconVerified } from "@/components/icons";
import { StarRating } from "@/components/ui/star-rating";

interface ReviewCardProps {
  name: string;
  quote: string;
  rating: number;
  date?: string;
  verified?: boolean;
  className?: string;
}

/** Figma review/testimonial card: 20px-radius bordered card, stars, name + green check, quote, date. */
export function ReviewCard({ name, quote, rating, date, verified = false, className = "" }: ReviewCardProps) {
  return (
    <figure className={`flex flex-col gap-3 rounded-card border border-border px-8 py-7 ${className}`}>
      <StarRating rating={rating} showLabel={false} />
      <figcaption className="flex items-center gap-1">
        <span className="text-xl font-bold">{name}</span>
        {verified ? <IconVerified width={24} height={24} className="text-success" /> : null}
      </figcaption>
      <blockquote className="text-base leading-[22px] text-muted">&ldquo;{quote}&rdquo;</blockquote>
      {date ? <p className="mt-2 text-base font-medium text-muted">Posted on {date}</p> : null}
    </figure>
  );
}
