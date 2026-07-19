import { resolveContentConfig, resolveLegalConfig } from "@/lib/config";
import type { ProductFaq } from "@/lib/types/config";

/**
 * Generic placeholder FAQs shown until a store configures real ones for a
 * handle in config/content.ts. Shipping/returns answers pull real numbers
 * from the store's legal config instead of making up figures.
 */
function defaultFaqs(): ProductFaq[] {
  const { policies } = resolveLegalConfig();
  const days = policies.processingTimeDays === 1 ? "1 business day" : `${policies.processingTimeDays} business days`;

  return [
    {
      question: "How long does shipping take?",
      answer: `Orders ship within ${days}${policies.shipFromCountry ? ` from ${policies.shipFromCountry}` : ""}. You'll get a tracking link by email as soon as it's on the way.`
    },
    {
      question: "What is your return policy?",
      answer: `We offer free returns within ${policies.returnWindowDays} days of delivery, as long as the item is unused and in its original packaging.`
    },
    {
      question: "How do I track my order?",
      answer: "You'll receive a shipping confirmation email with a tracking link as soon as your order leaves our warehouse."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, plus common digital wallets at checkout."
    }
  ];
}

/** FAQs are store-owned config, same as reviews (lib/reviews.ts) — no Shopify equivalent. */
export function getProductFaqs(handle: string): ProductFaq[] {
  return resolveContentConfig().productFaqs[handle] ?? defaultFaqs();
}
