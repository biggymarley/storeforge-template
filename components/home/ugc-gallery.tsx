import Image from "next/image";
import { IconInstagram } from "@/components/icons";
import { resolveStoreConfig } from "@/lib/config";
import type { GalleryImage } from "@/lib/types/config";

interface UgcGalleryProps {
  images: GalleryImage[];
}

// Below this, a couple of tiles would look sparse rather than like a grid.
const MIN_IMAGES = 4;

/**
 * Homepage "shop the look" / UGC photo grid — store adds real customer or
 * lifestyle photos via content.gallery (public/branding/gallery/*). Each
 * tile can optionally link to a product, collection, or the original social
 * post. Hidden until the store has enough photos to fill a real grid.
 */
export function UgcGallery({ images }: UgcGalleryProps) {
  const { socials } = resolveStoreConfig();
  if (images.length < MIN_IMAGES) return null;

  const tiles = images.slice(0, 6);

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
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:mt-10 lg:grid-cols-6 lg:gap-4">
        {tiles.map((tile, index) => {
          const photo = (
            <Image
              src={tile.image}
              alt={tile.alt ?? ""}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          );
          return tile.href ? (
            <a
              key={`${tile.image}-${index}`}
              href={tile.href}
              className="group relative block aspect-square overflow-hidden rounded-card bg-secondary"
            >
              {photo}
            </a>
          ) : (
            <div
              key={`${tile.image}-${index}`}
              className="group relative block aspect-square overflow-hidden rounded-card bg-secondary"
            >
              {photo}
            </div>
          );
        })}
      </div>
    </section>
  );
}
