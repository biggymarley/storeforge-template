import Image from "next/image";

const PAYMENT_BADGES = [
  { src: "/payments/visa.svg", alt: "Visa" },
  { src: "/payments/mastercard.svg", alt: "Mastercard" },
  { src: "/payments/paypal.svg", alt: "PayPal" },
  { src: "/payments/applepay.svg", alt: "Apple Pay" },
  { src: "/payments/gpay.svg", alt: "Google Pay" }
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
