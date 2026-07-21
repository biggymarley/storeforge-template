"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconVerified } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import type { ProductFaq, ProductReview } from "@/lib/types/config";

interface ProductTabsProps {
  descriptionHtml: string;
  reviews: ProductReview[];
  faqs: ProductFaq[];
}

const REVIEWS_PAGE = 6;

const TABS = [
  { id: "details", label: "Product Details" },
  { id: "reviews", label: "Rating & Reviews" },
  { id: "faqs", label: "FAQs" }
] as const;

/** PDP tabs (Figma 1:2 y826): full-width hairline, active tab gets a 2px black underline. */
export function ProductTabs({ descriptionHtml, reviews, faqs }: ProductTabsProps) {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("details");
  const [visibleReviews, setVisibleReviews] = useState(REVIEWS_PAGE);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [detailsOverflows, setDetailsOverflows] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = detailsRef.current;
    if (el) setDetailsOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [descriptionHtml]);

  return (
    <section className="mt-12 lg:mt-20">
      <div role="tablist" aria-label="Product information" className="flex border-b border-border">
        {TABS.map((tab) => (
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
          <div className="relative mt-8 lg:mt-10">
            <div
              ref={detailsRef}
              className={`prose-store overflow-hidden ${detailsExpanded ? "" : "max-h-64 lg:max-h-80"}`}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
            {!detailsExpanded && detailsOverflows ? (
              <div className="absolute inset-x-0 bottom-0 flex h-28 items-end justify-center bg-gradient-to-t from-background to-transparent pb-1">
                <Button variant="primary" size="md" onClick={() => setDetailsExpanded(true)}>
                  Show More
                </Button>
              </div>
            ) : null}
            {detailsExpanded && detailsOverflows ? (
              <div className="mt-6 flex justify-center">
                <Button variant="secondary" size="md" onClick={() => setDetailsExpanded(false)}>
                  Show Less
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted">No additional details for this product.</p>
        )
      ) : null}

      {active === "reviews" ? (
        <div className="mt-6 lg:mt-8">
          <h2 className="text-xl font-bold lg:text-2xl">
            All Reviews <span className="text-sm font-normal text-muted">({reviews.length})</span>
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No reviews yet. Be the first to review this product.</p>
          ) : (
            <>
              <ul className="mt-5 flex flex-col divide-y divide-border border-t border-border">
                {reviews.slice(0, visibleReviews).map((review) => (
                  <li key={`${review.name}-${review.quote.slice(0, 16)}`} className="flex flex-col gap-2 py-5">
                    <StarRating rating={review.rating} showLabel={false} />
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{review.name}</span>
                      {review.verified ? <IconVerified width={20} height={20} className="text-success" /> : null}
                    </div>
                    <p className="text-sm leading-5 text-muted">&ldquo;{review.quote}&rdquo;</p>
                    {review.date ? <p className="text-xs font-medium text-muted">Posted on {review.date}</p> : null}
                  </li>
                ))}
              </ul>
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
            </>
          )}
        </div>
      ) : null}

      {active === "faqs" ? (
        <div className="mt-8 lg:mt-10">
          {faqs.length === 0 ? (
            <p className="text-sm text-muted">No FAQs for this product yet.</p>
          ) : (
            <ul className="flex flex-col">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <li key={faq.question} className="border-b border-border first:border-t">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium"
                    >
                      {faq.question}
                      <IconChevronDown
                        width={16}
                        height={16}
                        className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen ? <p className="pb-5 text-sm leading-5 text-muted">{faq.answer}</p> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}
