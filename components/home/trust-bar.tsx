import { IconReturn, IconShield, IconTruck } from "@/components/icons";
import type { ResolvedLegalConfig } from "@/lib/config";

interface TrustBarProps {
  policies: ResolvedLegalConfig["policies"];
}

/**
 * Homepage conversion strip: same shipping/returns facts as the PDP's
 * TrustStrip (components/product/trust-strip.tsx), laid out horizontally,
 * plus a static secure-checkout item. No new config — reads legal.policies.
 */
export function TrustBar({ policies }: TrustBarProps) {
  const { processingTimeDays, returnWindowDays, shipFromCountry } = policies;

  const items = [
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
    <section aria-label="Why shop with us" className="mx-auto w-full max-w-310 px-4">
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
