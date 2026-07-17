import Image from "next/image";
import Link from "next/link";
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
    <section className="mx-auto max-w-310 px-4">
      <div className="rounded-[40px] bg-secondary px-6 pb-6 pt-10 lg:px-16 lg:pb-19 lg:pt-17">
        <h2 className="text-center font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
          Browse by Category
        </h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5 lg:gap-5">
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
                  className="object-cover object-right transition-transform duration-300 group-hover:scale-105"
                />
              ) : null}
              <span className="absolute left-6 top-4 text-2xl font-bold lg:left-9 lg:top-6 lg:text-4xl">
                {collection.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
