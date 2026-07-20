import Image from "next/image";
import { resolveContentConfig } from "@/lib/config";

/** Figma brand-logo band: black strip under the hero. Hidden when config has no brands. */
export function BrandStrip() {
  const { brands } = resolveContentConfig();
  if (brands.length === 0) return null;

  return (
    <section aria-label="Featured brands" className="bg-primary">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-center gap-x-8 gap-y-5 px-4 py-10 lg:justify-between lg:py-11">
        {brands.map((brand) => (
          <Image
            key={brand.name}
            src={brand.logoSrc}
            alt={brand.name}
            width={156}
            height={36}
            className="h-6 w-auto brightness-0 invert lg:h-8"
          />
        ))}
      </div>
    </section>
  );
}
