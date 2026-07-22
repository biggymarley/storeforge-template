import Image from "next/image";

interface TrustBadgesBannerProps {
  image: string;
  alt: string;
  className?: string;
  sizes?: string;
}

/** Store-configurable trust-badge graphic (guarantees + secure-checkout marks) — resolveStoreConfig().trustBadges. */
export function TrustBadgesBanner({
  image,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 800px, 100vw"
}: TrustBadgesBannerProps) {
  return (
    <Image src={image} alt={alt} width={1280} height={714} className={`h-auto w-full ${className}`} sizes={sizes} />
  );
}
