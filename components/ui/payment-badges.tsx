import Image from "next/image";

// Flat-rounded card-brand marks (aaronfagan/svg-credit-card-payment-icons).
// Template-owned assets in /public/payments — 780×500 cards (~1.56 ratio).
const PAYMENT_BADGES = [
  { src: "/payments/visa.svg", alt: "Visa" },
  { src: "/payments/mastercard.svg", alt: "Mastercard" },
  { src: "/payments/maestro.svg", alt: "Maestro" },
  { src: "/payments/amex.svg", alt: "American Express" },
  { src: "/payments/discover.svg", alt: "Discover" },
  { src: "/payments/diners.svg", alt: "Diners Club" },
  { src: "/payments/unionpay.svg", alt: "UnionPay" },
  { src: "/payments/elo.svg", alt: "Elo" }
] as const;

interface PaymentBadgesProps {
  className?: string;
  badgeWidth?: number;
  badgeHeight?: number;
}

/** Shared payment-method row — footer + cart order summary (spec: template-owned assets, not store config). */
export function PaymentBadges({ className = "", badgeWidth = 40, badgeHeight = 26 }: PaymentBadgesProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {PAYMENT_BADGES.map((badge) => (
        <Image key={badge.alt} src={badge.src} alt={badge.alt} width={badgeWidth} height={badgeHeight} />
      ))}
    </div>
  );
}
