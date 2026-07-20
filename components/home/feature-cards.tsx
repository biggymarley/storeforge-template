import type { ResolvedContentConfig, ResolvedLegalConfig } from "@/lib/config";
import { TRUST_BAR_ICONS } from "@/lib/trust-bar-icons";
import type { FeatureCard } from "@/lib/types/config";

interface FeatureCardsProps {
  legal: ResolvedLegalConfig;
  /** Merchant override from content.featureCards. Empty → legal-derived defaults below. */
  cards?: ResolvedContentConfig["featureCards"];
  className?: string;
}

/** Store-info-derived defaults so the band is meaningful with zero content config. */
function defaultCards(legal: ResolvedLegalConfig): FeatureCard[] {
  const { policies, phone, emails, paymentProcessor } = legal;

  const cards: FeatureCard[] = [
    {
      icon: "truck",
      title: policies.freeShipping ? "Fast, Free Shipping" : "Fast Shipping",
      text: `Orders ship in ${policies.processingTimeDays} business day${policies.processingTimeDays === 1 ? "" : "s"}${
        policies.shipFromCountry ? ` from ${policies.shipFromCountry}` : ""
      } for an effortless shopping experience.`
    },
    {
      icon: "return",
      title: "Free Returns",
      text: `No-hassle returns within ${policies.returnWindowDays} days. Satisfaction guaranteed!`
    }
  ];

  if (phone || emails.support) {
    cards.push({
      icon: phone ? "phone" : "mail",
      title: "Support",
      text: phone
        ? `Quick and efficient customer support at your fingertips — give us a call at ${phone}.`
        : `Quick and efficient customer support at your fingertips — reach us at ${emails.support}.`
    });
  }

  cards.push({
    icon: "shield",
    title: "Secure Checkout",
    text: paymentProcessor
      ? `Payments are processed securely by ${paymentProcessor}. Your information is always protected.`
      : "We have the highest securities in place to protect your information."
  });

  return cards;
}

/**
 * Icon + title + blurb cards on secondary surfaces, home + PDP. Merchant
 * override via content.featureCards (max 6); otherwise derived from
 * legal config so every store gets accurate copy for free.
 */
export function FeatureCards({ legal, cards = [], className }: FeatureCardsProps) {
  const shown = cards.length > 0 ? cards.slice(0, 6) : defaultCards(legal);

  return (
    <section aria-label="Why shop with us" className={`mx-auto w-full max-w-page px-4 ${className ?? ""}`}>
      <ul className="flex flex-wrap justify-center gap-4 lg:gap-5">
        {shown.map((card) => {
          const Icon = TRUST_BAR_ICONS[card.icon] ?? TRUST_BAR_ICONS.shield;
          return (
            <li
              key={card.title}
              className="flex w-full max-w-70 grow basis-56 flex-col items-center gap-2 rounded-card bg-secondary px-5 py-8 text-center"
            >
              <Icon width={32} height={32} className="shrink-0 text-foreground" />
              <h3 className="text-base font-bold leading-tight">{card.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{card.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
