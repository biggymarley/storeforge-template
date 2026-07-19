import { IconReturn, IconTruck } from "@/components/icons";
import type { ResolvedLegalConfig } from "@/lib/config";

interface TrustStripProps {
  policies: ResolvedLegalConfig["policies"];
  className?: string;
}

/** PDP conversion strip: shipping + returns pulled from the store's legal config. */
export function TrustStrip({ policies, className = "" }: TrustStripProps) {
  const { processingTimeDays, returnWindowDays, shipFromCountry } = policies;

  return (
    <ul className={`flex flex-col gap-3 text-sm text-muted ${className}`}>
      <li className="flex items-center gap-2.5">
        <IconTruck width={20} height={20} className="shrink-0" />
        <span>
          Ships in {processingTimeDays} business day{processingTimeDays === 1 ? "" : "s"}
          {shipFromCountry ? ` from ${shipFromCountry}` : ""}
        </span>
      </li>
      <li className="flex items-center gap-2.5">
        <IconReturn width={20} height={20} className="shrink-0" />
        <span>Free returns within {returnWindowDays} days</span>
      </li>
    </ul>
  );
}
