import Image from "next/image";
import Link from "next/link";
import { IconArrow } from "@/components/icons";
import type { Collection } from "@/lib/shopify/types";

/** Figma tile widths alternate 407/684 in a 2×2 layout (node 22:672). */
const TILE_SPANS = ["lg:col-span-2", "lg:col-span-3", "lg:col-span-3", "lg:col-span-2"];

interface CollectionTilesProps {
  collections: Collection[];
}

/**
 * Figma "Browse by Dress Style": 40px-radius secondary section with white
 * photo tiles. Fed by the store's collections (first 4 with images); hidden
 * when fewer than 2 qualify.
 */
export function CollectionTiles({ collections }: CollectionTilesProps) {
  const tiles = collections.filter((collection) => collection.image).slice(0, 4);
  if (tiles.length < 2) return null;

  return (
    <section className="mx-auto max-w-page px-4">
      <div className="rounded-[40px] bg-secondary px-6 pb-6 pt-10 lg:px-16 lg:pb-19 lg:pt-17">
        <h2 className="text-center font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
          Browse by Category
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-5 lg:gap-5">
          {tiles.map((collection, index) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className={`group relative block h-48 overflow-hidden rounded-card bg-background lg:h-72 ${TILE_SPANS[index]}`}
            >
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText ?? collection.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : null}
              {/* Scrim keeps the label legible on any photo, light or dark. */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/70" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-5 lg:p-7">
                <span className="text-2xl font-bold text-white lg:text-4xl">{collection.title}</span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-black opacity-0 transition-all duration-300 group-hover:opacity-100 lg:-translate-x-1 lg:group-hover:translate-x-0">
                  <IconArrow width={18} height={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
