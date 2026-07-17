"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { IconSearch } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import type { ProductCard } from "@/lib/shopify/types";

/**
 * Header search: pill input submitting to /search?q=…, with a debounced
 * predictive dropdown (blueprint §Search: r20 card, product rows w/ 40px
 * thumbs). Suggestions come from /api/predictive-search; a fetch failure just
 * means no dropdown.
 */
export function SearchBar({ className = "", autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listboxId = useId();

  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<ProductCard[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLFormElement>(null);
  // Only user typing (not URL sync) may reopen the dropdown.
  const interactedRef = useRef(false);

  const query = value.trim();

  useEffect(() => {
    if (!interactedRef.current) return;
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/predictive-search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal
        });
        if (!response.ok) return;
        const data = (await response.json()) as { products: ProductCard[] };
        setResults(data.products);
        setActiveIndex(-1);
        setOpen(data.products.length > 0);
      } catch {
        // Aborted or offline — keep whatever is showing.
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const submit = () => {
    setOpen(false);
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  const go = (product: ProductCard) => {
    setOpen(false);
    router.push(`/products/${product.handle}`);
  };

  return (
    <form
      ref={rootRef}
      role="search"
      className={`relative ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (open && activeIndex >= 0 && results[activeIndex]) go(results[activeIndex]);
        else submit();
      }}
    >
      <label className="flex items-center gap-3 rounded-full bg-secondary px-4 py-3 focus-within:ring-2 focus-within:ring-foreground/30">
        <IconSearch width={24} height={24} className="shrink-0 text-foreground/40" />
        <input
          type="search"
          name="q"
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => {
            interactedRef.current = true;
            setValue(event.target.value);
          }}
          onFocus={() => {
            if (results.length > 0 && query.length >= 2) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (!open || results.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((i) => (i + 1) % results.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
            }
          }}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          aria-autocomplete="list"
          placeholder="Search for products..."
          className="w-full min-w-0 bg-transparent text-base outline-none placeholder:text-foreground/40"
        />
      </label>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-card border border-border bg-background shadow-lg">
          <ul id={listboxId} role="listbox" aria-label="Product suggestions">
            {results.map((product, index) => {
              const price = product.priceRange.minVariantPrice;
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    id={`${listboxId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onClick={() => go(product)}
                    onPointerEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      index === activeIndex ? "bg-secondary" : ""
                    }`}
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText ?? product.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{product.title}</span>
                    <span className="shrink-0 text-sm font-bold">
                      {formatPrice(price.amount, price.currencyCode)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
          >
            View all results for “{query}”
          </Link>
        </div>
      ) : null}
    </form>
  );
}
