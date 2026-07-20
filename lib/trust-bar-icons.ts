import {
  IconMail,
  IconPhone,
  IconPin,
  IconReturn,
  IconShield,
  IconStar,
  IconTag,
  IconTruck,
  IconVerified
} from "@/components/icons";
import type { TrustBarIcon } from "@/lib/types/config";

/**
 * TrustBarIcon key → icon component. Shared by the homepage trust bar and the
 * announcement bar — one lookup so the config union and the icon set can't drift apart.
 */
export const TRUST_BAR_ICONS: Record<TrustBarIcon, typeof IconTruck> = {
  truck: IconTruck,
  return: IconReturn,
  shield: IconShield,
  verified: IconVerified,
  star: IconStar,
  tag: IconTag,
  mail: IconMail,
  phone: IconPhone,
  pin: IconPin
};
