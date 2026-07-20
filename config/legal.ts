import type { LegalConfig } from "@/lib/types/config";

export const legalConfig: LegalConfig = {
  companyName: "storesmith.shop",
  address: {
    line1: "",
    line2: "",
    city: "Wichita",
    region: "Kansas",
    postalCode: "",
    country: "United States"
  },
  emails: { support: "support@storesmith.shop" },
  phone: "",
  policies: {
    returnWindowDays: 30,
    processingTimeDays: 2,
    shipFromCountry: "United States"
  }
};
