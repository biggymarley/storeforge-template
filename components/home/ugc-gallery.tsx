import Image from "next/image";
import { IconInstagram } from "@/components/icons";
import { resolveStoreConfig } from "@/lib/config";
import type { GalleryImage } from "@/lib/types/config";

interface UgcGalleryProps {
  images: GalleryImage[];
}

// Bento layout needs exactly "hero + 4" to stay clean — fewer looks unfinished.
const TILE_COUNT = 5;

const TILE_SPAN = [
  "col-span-2 aspect-[16/10] lg:aspect-auto lg:col-span-2 lg:row-span-2",
  "aspect-square lg:aspect-auto",
  "aspect-square lg:aspect-auto",
  "aspect-square lg:aspect-auto",
  "aspect-square lg:aspect-auto"
];

/**
 * Homepage "shop the look" / UGC photo grid — store adds real customer or
 * lifestyle photos via content.gallery (public/branding/gallery/*). Bento
 * layout: one hero tile + four supporting tiles, lg:h-[440px] container so
 * the row-span-2 hero and the small tiles line up exactly. Each tile can
 * optionally link to a product, collection, or the original social post.
 * Hidden until the store has enough photos to fill the layout.
 */
export function UgcGallery({ images }: UgcGalleryProps) {
  const { socials } = resolveStoreConfig();
  if (images.length < TILE_COUNT) return null;

  const tiles = images.slice(0, TILE_COUNT);

  return (
    <section className="mx-auto w-full max-w-310 px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">Shop The Look</h2>
        {socials.instagram ? (
          <a
            href={socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1 flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60"
          >
            <IconInstagram width={18} height={18} />
            Follow us
          </a>
        ) : null}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-10 lg:h-[440px] lg:grid-cols-4 lg:grid-rows-2 lg:gap-4">
        {tiles.map((tile, index) => {
          const content = (
            <>
              <Image
                src={tile.image}
                alt={tile.alt ?? ""}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </>
          );
          const className = `group relative block overflow-hidden rounded-lg bg-secondary ${TILE_SPAN[index]}`;
          return tile.href ? (
            <a key={`${tile.image}-${index}`} href={tile.href} className={className}>
              {content}
            </a>
          ) : (
            <div key={`${tile.image}-${index}`} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
