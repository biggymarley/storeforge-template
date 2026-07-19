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
    <section className="mx-auto w-full max-w-310 px-4">
      <h2 className="text-center font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
        Frequently Asked Questions
      </h2>
      <ul className="mx-auto mt-8 flex max-w-3xl flex-col lg:mt-14">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <li key={faq.question} className="border-b border-border first:border-t">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
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
    </section>
  );
}
