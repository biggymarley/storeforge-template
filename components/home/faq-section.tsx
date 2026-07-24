"use client";

import { useState } from "react";
import { IconChevronDown } from "@/components/icons";
import type { ProductFaq } from "@/lib/types/config";

interface FaqSectionProps {
  faqs: ProductFaq[];
}

/** Homepage general FAQ (shipping/returns/payment) — same accordion pattern as the PDP FAQ tab. Hidden when empty. */
export function FaqSection({ faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-page px-4">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-sm text-muted lg:text-base">
            Everything you need to know before you order. Still have a question? Reach out any time.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <li
                key={faq.question}
                className={`overflow-hidden rounded-card border transition-colors ${
                  isOpen ? "border-foreground/20" : "border-border hover:border-foreground/20"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-base font-medium"
                >
                  {faq.question}
                  <IconChevronDown
                    width={16}
                    height={16}
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen ? <p className="px-5 pb-5 text-sm leading-5 text-muted">{faq.answer}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
