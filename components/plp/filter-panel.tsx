"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IconChevronDown } from "@/components/icons";
import type { NavLink } from "@/components/layout/nav-links";
import { PriceSlider } from "@/components/plp/price-slider";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { isPlpParam, parsePlpParams, plpParamsToSearchString } from "@/lib/plp";
import type { FilterFacet } from "@/lib/shopify/types";

export interface FilterPanelProps {
  /** Category rows (collection links) — navigation, not query filters. */
  categories: NavLink[];
  /** Option facets from Shopify (collection/search pages); empty on /products. */
  facets: FilterFacet[];
  priceCeiling: number;
  currencyCode?: string;
  /** Called after Apply pushes the new URL (drawer uses it to close). */
  onApplied?: () => void;
}

function isOptionFacet(facet: FilterFacet): boolean {
  return facet.type === "LIST" && facet.id.includes("option.");
}

/**
 * Figma filter sections (nodes 29:1218 / 38:679): category list, price
 * slider, swatch/chip option facets, Apply. Draft state is local; Apply
 * serializes it into the URL (lib/plp.ts scheme) so results stay
 * server-rendered and shareable.
 */
export function FilterPanel({ categories, facets, priceCeiling, currencyCode, onApplied }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const applied = useMemo(() => parsePlpParams(Object.fromEntries(searchParams)), [searchParams]);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    applied.priceMin ?? 0,
    applied.priceMax ?? priceCeiling
  ]);
  const [selected, setSelected] = useState<Record<string, string[]>>(applied.options);
  const [inStock, setInStock] = useState(applied.inStock);

  // Re-sync drafts when the URL changes (back/forward, applied elsewhere).
  useEffect(() => {
    setPriceRange([applied.priceMin ?? 0, applied.priceMax ?? priceCeiling]);
    setSelected(applied.options);
    setInStock(applied.inStock);
  }, [applied, priceCeiling]);

  const toggleValue = (optionName: string, value: string) => {
    setSelected((prev) => {
      const current = prev[optionName] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [optionName]: next };
    });
  };

  const apply = () => {
    const [lo, hi] = priceRange;
    const next = new URLSearchParams(
      plpParamsToSearchString({
        sort: applied.sort,
        priceMin: lo > 0 ? lo : undefined,
        priceMax: hi < priceCeiling ? hi : undefined,
        inStock,
        options: selected
      }).slice(1)
    );
    // Non-PLP params (the search page's `q`) survive a filter change.
    for (const [key, value] of searchParams) {
      if (!isPlpParam(key)) next.set(key, value);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    onApplied?.();
  };

  const optionFacets = facets.filter(isOptionFacet);

  return (
    <div className="flex flex-col divide-y divide-border">
      {categories.length > 0 ? (
        <ul className="flex flex-col gap-5 pb-6">
          {categories.map((category) => (
            <li key={category.href}>
              <Link
                href={category.href}
                className="flex items-center justify-between text-base text-muted transition-colors hover:text-foreground"
              >
                {category.label}
                <IconChevronDown width={16} height={16} className="-rotate-90" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <section className="py-6 first:pt-0">
        <h3 className="text-xl font-bold">Price</h3>
        <div className="mt-5">
          <PriceSlider
            min={0}
            max={priceCeiling}
            value={priceRange}
            onChange={setPriceRange}
            currencyCode={currencyCode}
          />
        </div>
      </section>

      {optionFacets.map((facet) => {
        const isColor = facet.values.some((value) => value.swatch?.color);
        return (
          <section key={facet.id} className="py-6">
            <h3 className="text-xl font-bold">{facet.label}</h3>
            {isColor ? (
              <div className="mt-4 flex flex-wrap gap-3.5">
                {facet.values.map((value) => (
                  <ColorSwatch
                    key={value.id}
                    color={value.swatch?.color ?? "#ccc"}
                    colorName={value.label}
                    selected={(selected[facet.label] ?? []).includes(value.label)}
                    onClick={() => toggleValue(facet.label, value.label)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {facet.values.map((value) => (
                  <Chip
                    key={value.id}
                    selected={(selected[facet.label] ?? []).includes(value.label)}
                    onClick={() => toggleValue(facet.label, value.label)}
                  >
                    {value.label}
                  </Chip>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <section className="py-6">
        <Chip selected={inStock} onClick={() => setInStock((v) => !v)}>
          In stock only
        </Chip>
      </section>

      <div className="pt-6">
        <Button size="md" className="h-12 w-full" onClick={apply}>
          Apply Filter
        </Button>
      </div>
    </div>
  );
}
