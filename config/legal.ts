import type { LegalConfig } from "@/lib/types/config";

export const legalConfig: LegalConfig = {
  companyName: "storesmith.shop",
  address: {
    line1: "8444 W McCormick Ave",
    line2: "",
    city: "Wichita",
    region: "KS",
    postalCode: "67209",
    country: "United States"
  },
  emails: { support: "support@storesmith.shop" },
  phone: "+1 (316) 773-9982",
  policies: {
    returnWindowDays: 30,
    processingTimeDays: 3,
    shipFromCountry: "United States",
    freeShipping: true,
    deliveryEstimate: "4-7 business days",
    orderCutoffTime: "5:00 PM (EST)",
    damageReportHours: 48
  }
};
