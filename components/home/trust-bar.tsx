import { IconReturn, IconShield, IconTruck } from "@/components/icons";
import type { ResolvedContentConfig, ResolvedLegalConfig } from "@/lib/config";
import { TRUST_BAR_ICONS } from "@/lib/trust-bar-icons";

interface TrustBarProps {
  policies: ResolvedLegalConfig["policies"];
  /** Merchant override from content.trustBar. Empty → policy-derived defaults below. */
  trustBar?: ResolvedContentConfig["trustBar"];
}

/**
 * Homepage conversion strip. With content.trustBar set, renders those custom
 * badges (max 3); otherwise the same shipping/returns facts as the PDP's
 * TrustStrip (components/product/trust-strip.tsx), laid out horizontally,
 * plus a static secure-checkout item, from legal.policies.
 */
export function TrustBar({ policies, trustBar = [] }: TrustBarProps) {
  const { processingTimeDays, returnWindowDays, shipFromCountry } = policies;

  const items =
    trustBar.length > 0
      ? trustBar.slice(0, 3).map((badge) => ({ icon: TRUST_BAR_ICONS[badge.icon] ?? IconShield, label: badge.text }))
      : [
          {
            icon: IconTruck,
            label: `Ships in ${processingTimeDays} business day${processingTimeDays === 1 ? "" : "s"}${
              shipFromCountry ? ` from ${shipFromCountry}` : ""
            }`
          },
          { icon: IconReturn, label: `Free returns within ${returnWindowDays} days` },
          { icon: IconShield, label: "Secure checkout, every order" }
        ];

  return (
    <section aria-label="Why shop with us" className="mx-auto w-full max-w-page px-4">
      <ul className="flex flex-col items-center gap-6 border-y border-border py-6 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-10 sm:gap-y-4 lg:py-8">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-center gap-3 text-center">
            <item.icon width={24} height={24} className="shrink-0 text-foreground" />
            <span className="text-sm font-medium">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
