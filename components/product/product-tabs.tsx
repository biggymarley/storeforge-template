"use client";

import { useState } from "react";
import { ReviewCard } from "@/components/product/review-card";
import { Button } from "@/components/ui/button";
import type { ProductReview } from "@/lib/types/config";

interface ProductTabsProps {
  descriptionHtml: string;
  reviews: ProductReview[];
}

const REVIEWS_PAGE = 6;

/**
 * PDP tabs (Figma 1:2 y826): full-width hairline, active tab gets a 2px black
 * underline. FAQs has no data source in v1 and Reviews hides when the config
 * has none for this product (DESIGN-NOTES §6 gap decisions).
 */
export function ProductTabs({ descriptionHtml, reviews }: ProductTabsProps) {
  const tabs = [
    { id: "details", label: "Product Details" },
    ...(reviews.length > 0 ? [{ id: "reviews", label: "Rating & Reviews" }] : [])
  ];
  const [active, setActive] = useState(tabs[0].id);
  const [visibleReviews, setVisibleReviews] = useState(REVIEWS_PAGE);

  return (
    <section className="mt-12 lg:mt-20">
      <div role="tablist" aria-label="Product information" className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`-mb-px flex-1 border-b-2 pb-4 text-center text-base transition-colors lg:pb-6 ${
              active === tab.id
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "details" ? (
        descriptionHtml ? (
          <div
            className="prose-store mx-auto mt-8 max-w-[720px] lg:mt-10"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        ) : (
          <p className="mt-8 text-center text-sm text-muted">No additional details for this product.</p>
        )
      ) : null}

      {active === "reviews" ? (
        <div className="mt-6 lg:mt-8">
          <h2 className="text-xl font-bold lg:text-2xl">
            All Reviews <span className="text-sm font-normal text-muted">({reviews.length})</span>
          </h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {reviews.slice(0, visibleReviews).map((review) => (
              <ReviewCard
                key={`${review.name}-${review.quote.slice(0, 16)}`}
                name={review.name}
                quote={review.quote}
                rating={review.rating}
                date={review.date}
                verified={review.verified}
              />
            ))}
          </div>
          {visibleReviews < reviews.length ? (
            <div className="mt-7 flex justify-center">
              <Button
                variant="secondary"
                size="md"
                className="min-w-56"
                onClick={() => setVisibleReviews((count) => count + REVIEWS_PAGE)}
              >
                Load More Reviews
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
