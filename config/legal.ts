import type { LegalConfig } from "@/lib/types/config";

export const legalConfig: LegalConfig = {
  companyName: "My Store 3",
  address: {
    line1: "15962 Abbey Road",
    line2: "Torbay Road, Abbey Sands",
    city: "Torquay",
    region: "",
    postalCode: "TQ2 5HB",
    country: "United Kingdom"
  },
  emails: { support: "nilsvogtmiko@gmail.com" },
  phone: "",
  policies: {
    returnWindowDays: 30,
    processingTimeDays: 2,
    shipFromCountry: "United Kingdom"
  }
};
