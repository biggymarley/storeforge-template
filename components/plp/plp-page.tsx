import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { NavLink } from "@/components/layout/nav-links";
import { FilterPanel } from "@/components/plp/filter-panel";
import { FiltersDrawer } from "@/components/plp/filters-drawer";
import { SortSelect } from "@/components/plp/sort-select";
import { ProductCard } from "@/components/product/product-card";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { IconSliders } from "@/components/icons";
import { isPlpParam, paginationHrefs, type SearchParamsRecord, type SortValue } from "@/lib/plp";
import type { FilterFacet, PageInfo, ProductCard as ProductCardType } from "@/lib/shopify/types";

export interface PlpPageProps {
  title: string;
  description?: string;
  breadcrumb: { label: string; href?: string }[];
  products: ProductCardType[];
  pageInfo: PageInfo;
  pathname: string;
  searchParams: SearchParamsRecord;
  sort: SortValue;
  /** Reduced sort menu for surfaces with fewer API sort keys (search). */
  sortOptions?: { value: SortValue; label: string }[];
  categories: NavLink[];
  facets: FilterFacet[];
  priceCeiling: number;
  /** Shown as "Showing X products"; pass a total when the API provides one (search). */
  totalCount?: number;
}

/**
 * Shared PLP shell (Figma 26:855 desktop / 38:234 mobile): breadcrumb,
 * filter sidebar (drawer below lg), title row with count + sort, 3-col grid
 * (2-col mobile), cursor pagination. Used by /products and /collections/*.
 */
export function PlpPage({
  title,
  description,
  breadcrumb,
  products,
  pageInfo,
  pathname,
  searchParams,
  sort,
  sortOptions,
  categories,
  facets,
  priceCeiling,
  totalCount
}: PlpPageProps) {
  const currencyCode = products[0]?.priceRange.minVariantPrice.currencyCode;
  const filterProps = { categories, facets, priceCeiling, currencyCode };
  const { previousHref, nextHref } = paginationHrefs(pathname, searchParams, {
    startCursor: pageInfo.startCursor,
    endCursor: pageInfo.endCursor
  });
  // "Clear filters" drops PLP state but keeps foreign params (search's `q`).
  const clearParams = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v && !isPlpParam(key)) clearParams.set(key, v);
  }
  const clearHref = clearParams.size > 0 ? `${pathname}?${clearParams.toString()}` : pathname;
  const countLabel =
    totalCount !== undefined
      ? `Showing ${products.length} of ${totalCount} Products`
      : `Showing ${products.length} Products`;

  return (
    <div className="mx-auto max-w-page px-4 pt-5 lg:pt-6">
      <Breadcrumbs items={breadcrumb} className="text-sm lg:text-base" />
      <div className="mt-4 flex items-start gap-5 lg:mt-6">
        <aside className="hidden w-[295px] shrink-0 rounded-card border border-border px-6 py-5 lg:block">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold">Filters</h2>
            <IconSliders width={24} height={24} />
          </div>
          <Suspense>
            <FilterPanel {...filterProps} />
          </Suspense>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl font-bold lg:text-[2rem]">{title}</h1>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:inline">{countLabel}</span>
              <Suspense>
                <SortSelect current={sort} options={sortOptions} />
              </Suspense>
              <Suspense>
                <FiltersDrawer {...filterProps} />
              </Suspense>
            </div>
          </div>
          {description ? <p className="mt-2 max-w-2xl text-sm text-muted lg:text-base">{description}</p> : null}

          {products.length > 0 ? (
            <>
              <div className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-6 lg:mt-7 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-9">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 3} />
                ))}
              </div>
              {pageInfo.hasPreviousPage || pageInfo.hasNextPage ? (
                <Pagination
                  hasPreviousPage={pageInfo.hasPreviousPage}
                  hasNextPage={pageInfo.hasNextPage}
                  previousHref={previousHref}
                  nextHref={nextHref}
                  className="mt-8 border-t border-border pt-5"
                />
              ) : null}
            </>
          ) : (
            <div className="mt-10 flex flex-col items-start gap-4 rounded-card border border-border p-8 lg:mt-14 lg:p-12">
              <h2 className="font-heading text-2xl uppercase lg:text-3xl">No products found</h2>
              <p className="text-sm text-muted lg:text-base">
                Try adjusting your filters, or browse everything we have.
              </p>
              <ButtonLink href={clearHref} variant="secondary" size="md">
                Clear filters
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
