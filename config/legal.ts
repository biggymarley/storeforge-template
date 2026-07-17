import type { LegalConfig } from "@/lib/types/config";

export const legalConfig: LegalConfig = {
  companyName: "Placeholder Store",
  legalName: "Placeholder Store LLC",
  address: {
    line1: "123 Placeholder Ave",
    line2: "",
    city: "Springfield",
    region: "ST",
    postalCode: "00000",
    country: "United States"
  },
  emails: { support: "support@example.com", legal: "legal@example.com" },
  phone: "",
  policies: {
    returnWindowDays: 30,
    processingTimeDays: 2,
    shipFromCountry: "United States"
  }
};
