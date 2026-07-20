/**
 * Template-owned policy text for /policies/* (spec §4): generic e-commerce
 * policy copy with the store's `config/legal.ts` values interpolated. This is
 * boilerplate, not legal advice — stores with bespoke policies should edit
 * their Shopify pages and link those instead.
 */
import { resolveLegalConfig, type ResolvedLegalConfig } from "@/lib/config";

export type PolicyHandle = "privacy" | "terms" | "shipping" | "refund";

export interface PolicySection {
  heading?: string;
  paragraphs: string[];
  /** Rendered as a bullet list after the paragraphs. */
  list?: string[];
}

export interface Policy {
  handle: PolicyHandle;
  title: string;
  description: string;
  sections: PolicySection[];
}

function joinNonEmpty(parts: string[], separator: string): string {
  return parts.filter(Boolean).join(separator);
}

function formatAddress(legal: ResolvedLegalConfig): string {
  const { line1, line2, city, region, postalCode, country } = legal.address;
  return joinNonEmpty([line1, line2, joinNonEmpty([city, region], ", "), postalCode, country], ", ");
}

function contactSection(legal: ResolvedLegalConfig, email: string): PolicySection {
  const address = formatAddress(legal);
  return {
    heading: "Contact us",
    paragraphs: [
      joinNonEmpty(
        [
          `Questions about this policy can be directed to ${legal.companyName}`,
          email ? `by email at ${email}` : "",
          legal.phone ? `by phone at ${legal.phone}` : "",
          address ? `or by mail at ${address}` : ""
        ],
        " "
      ) + "."
    ]
  };
}

function privacyPolicy(legal: ResolvedLegalConfig): Policy {
  return {
    handle: "privacy",
    title: "Privacy Policy",
    description: `How ${legal.companyName} collects, uses, and protects your personal information.`,
    sections: [
      {
        heading: "1. Information We Collect",
        paragraphs: [
          `When you visit ${legal.companyName}, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. This includes your name, billing address, shipping address, payment information, email address, and phone number.`
        ]
      },
      {
        heading: "2. How We Use Your Information",
        paragraphs: [
          "We use your personal information to provide our services to you, which includes: offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers."
        ]
      },
      {
        heading: "3. Sharing Your Personal Information",
        paragraphs: [
          "We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you. For example, we use third-party payment processors and shipping partners to handle transactions and deliver your orders safely."
        ]
      },
      {
        heading: "4. Your Rights",
        paragraphs: [
          "If you are a resident of certain territories, you have the right to access the Personal Information we hold about you, to port it to a new service, and to ask that your Personal Information be corrected, updated, or erased. Contact us below to exercise these rights."
        ]
      },
      { ...contactSection(legal, legal.emails.legal), heading: "5. Contact Information" }
    ]
  };
}

function termsPolicy(legal: ResolvedLegalConfig): Policy {
  return {
    handle: "terms",
    title: "Terms of Service",
    description: `The terms that govern your use of the ${legal.companyName} store.`,
    sections: [
      {
        heading: "1. Overview",
        paragraphs: [
          `This website is operated by ${legal.companyName}. Throughout the site, the terms "we", "us" and "our" refer to ${legal.companyName}. By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions.`
        ]
      },
      {
        heading: "2. General Conditions",
        paragraphs: [
          "We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks."
        ]
      },
      {
        heading: "3. Modifications to the Service and Prices",
        paragraphs: [
          "Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time."
        ]
      },
      {
        heading: "4. Governing Law",
        paragraphs: [
          `These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of ${legal.governingLaw || "the jurisdiction in which we operate"}.`
        ]
      },
      { ...contactSection(legal, legal.emails.legal), heading: "5. Contact Information" }
    ]
  };
}

function shippingPolicy(legal: ResolvedLegalConfig): Policy {
  const { processingTimeDays, shipFromCountry, freeShipping, deliveryEstimate, orderCutoffTime, damageReportHours } =
    legal.policies;

  return {
    handle: "shipping",
    title: "Shipping Policy",
    description: `How ${legal.companyName} processes and ships your order.`,
    sections: [
      {
        heading: "Shipping destination & cost",
        paragraphs: [
          shipFromCountry
            ? `We currently ship orders only within ${shipFromCountry}. We do not ship to international destinations at this time.`
            : "Shipping destinations are shown at checkout.",
          freeShipping
            ? "Shipping fee: we offer 100% free shipping on all orders. No minimum purchase required."
            : "Shipping costs are calculated at checkout based on your delivery address and the shipping method you select."
        ]
      },
      {
        heading: "Delivery timeframes",
        paragraphs: [],
        list: [
          `Handling time: ${processingTimeDays} business ${processingTimeDays === 1 ? "day" : "days"} (Mon–Fri)`,
          ...(deliveryEstimate ? [`Transit/delivery time: ${deliveryEstimate} (Mon–Fri)`] : []),
          `Shipping cost: ${freeShipping ? "Free" : "Calculated at checkout"}`,
          ...(orderCutoffTime ? [`Order cutoff time: ${orderCutoffTime}`] : [])
        ]
      },
      {
        heading: "Damaged & lost orders",
        paragraphs: ["Your satisfaction is our priority. If your order arrives damaged, please follow these steps:"],
        list: [
          "Inspect immediately — check your package as soon as it arrives.",
          "Document the damage — take clear photos of the damaged item and the external packaging.",
          `Contact us — email our support team${legal.emails.support ? ` at ${legal.emails.support}` : ""} within ${damageReportHours} hours of delivery. Include your order number, a description of the damage, and the photos.`
        ]
      },
      {
        paragraphs: ["Once verified, we will arrange a free replacement or a full refund immediately."]
      },
      contactSection(legal, legal.emails.support)
    ]
  };
}

function refundPolicy(legal: ResolvedLegalConfig): Policy {
  const { returnWindowDays, refundProcessingEstimate } = legal.policies;
  return {
    handle: "refund",
    title: "Return & Refund Policy",
    description: `${legal.companyName}'s return window, conditions, and refund process.`,
    sections: [
      {
        heading: `${returnWindowDays}-Day Return Window`,
        paragraphs: [
          `We have a ${returnWindowDays}-day return policy. This means you have ${returnWindowDays} days after receiving your item to request a return.`
        ]
      },
      {
        heading: "Eligibility for Returns",
        paragraphs: [
          "To be eligible for a return, your item must be in the same condition that you received it: unworn or unused, with tags, and in its original packaging. You will also need the receipt or proof of purchase."
        ]
      },
      {
        heading: "How to Initiate a Return",
        paragraphs: [
          `To start a return, please contact us${legal.emails.support ? ` at ${legal.emails.support}` : ""}. If your return is accepted, we will send you instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.`
        ]
      },
      {
        heading: "Refunds",
        paragraphs: [
          `We will notify you once we have received and inspected your return. If approved, you will be automatically refunded on your original payment method within ${refundProcessingEstimate || "several business days"}.`,
          "Please remember it can take some time for your bank or credit card company to process and post the refund."
        ]
      },
      contactSection(legal, legal.emails.support)
    ]
  };
}

const POLICY_BUILDERS: Record<PolicyHandle, (legal: ResolvedLegalConfig) => Policy> = {
  privacy: privacyPolicy,
  terms: termsPolicy,
  shipping: shippingPolicy,
  refund: refundPolicy
};

export const POLICY_HANDLES = Object.keys(POLICY_BUILDERS) as PolicyHandle[];

export function getPolicy(handle: string): Policy | null {
  const builder = POLICY_BUILDERS[handle as PolicyHandle];
  return builder ? builder(resolveLegalConfig()) : null;
}
