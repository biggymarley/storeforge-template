import Image from "next/image";

interface TrustBadgesBannerProps {
  className?: string;
}

/** Static trust-badge graphic (guarantees + secure-checkout marks) — template-owned asset, not store config. */
export function TrustBadgesBanner({ className = "" }: TrustBadgesBannerProps) {
  return (
    <Image
      src="/trust-badges.jpg"
      alt="Lowest price guaranteed, free shipping, authorized dealer, easy returns, 100% satisfaction guaranteed. Guaranteed safe checkout: secure encryption, PayPal, Visa, Mastercard, American Express, Discover."
      width={1280}
      height={714}
      className={`h-auto w-full ${className}`}
      sizes="(min-width: 1024px) 800px, 100vw"
    />
  );
}
