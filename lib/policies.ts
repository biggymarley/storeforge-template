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
        paragraphs: [
          `This Privacy Policy describes how ${legal.legalName} ("${legal.companyName}", "we", "us") collects, uses, and shares your personal information when you visit or make a purchase from our store.`
        ]
      },
      {
        heading: "Information we collect",
        paragraphs: [
          "When you visit the store, we collect certain information about your device, your interaction with the store, and the information necessary to process your purchases. We may also collect additional information if you contact us for customer support.",
          "Order information includes your name, billing address, shipping address, payment confirmation, email address, and phone number. This information is collected and processed by our e-commerce platform and payment providers in order to fulfil your order."
        ]
      },
      {
        heading: "How we use your information",
        paragraphs: [
          "We use your information to provide our services — processing orders, arranging shipping, and sending order notifications — and to communicate with you, screen for potential fraud, and, in line with the preferences you share with us, provide you with information about our products.",
          "We do not sell your personal information. We share it only with the service providers required to operate the store (payment processing, order fulfilment, shipping), and where required by law."
        ]
      },
      {
        heading: "Cookies",
        paragraphs: [
          "The store uses cookies that are strictly necessary for it to function — keeping your cart between visits and remembering your preferences. These cookies do not track you across other websites."
        ]
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Depending on where you live, you may have the right to access, correct, or delete the personal information we hold about you, and to object to or restrict its processing. To exercise any of these rights, contact us using the details below and we will respond as required by applicable law.",
          "We retain order information for our records unless and until you ask us to delete it, subject to legal retention requirements."
        ]
      },
      contactSection(legal, legal.emails.legal)
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
        paragraphs: [
          `These Terms of Service govern your use of this store, operated by ${legal.legalName} ("${legal.companyName}", "we", "us"), and any purchase you make through it. By visiting the store or purchasing something from us, you agree to these terms.`
        ]
      },
      {
        heading: "Store terms",
        paragraphs: [
          "By agreeing to these terms, you confirm that you are at least the age of majority in your place of residence, and that you will not use our products or this store for any illegal or unauthorized purpose.",
          "We reserve the right to refuse service to anyone for any reason at any time, and to limit the quantities of any products that we offer. All descriptions of products and pricing are subject to change without notice."
        ]
      },
      {
        heading: "Accuracy of information",
        paragraphs: [
          "We work to keep product information, pricing, and availability accurate, but occasional errors may occur. We reserve the right to correct any errors and to cancel orders affected by them; if your order is cancelled after payment, you will receive a full refund.",
          "Prices are shown at checkout in the store's currency. Applicable taxes and shipping costs are presented before you complete your purchase."
        ]
      },
      {
        heading: "Orders and payment",
        paragraphs: [
          "When you place an order you will receive an order confirmation by email. This confirms we have received your order; a contract of sale is formed when the order is dispatched. Payment is processed securely by our payment providers — we never store your full card details."
        ]
      },
      {
        heading: "Limitation of liability",
        paragraphs: [
          `To the fullest extent permitted by law, ${legal.companyName} is not liable for any indirect, incidental, or consequential damages arising from your use of the store or products purchased through it. Nothing in these terms excludes liability that cannot be excluded under applicable law, including your statutory consumer rights.`
        ]
      },
      contactSection(legal, legal.emails.legal)
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
  const { returnWindowDays } = legal.policies;
  return {
    handle: "refund",
    title: "Refund Policy",
    description: `${legal.companyName}'s return window, conditions, and refund process.`,
    sections: [
      {
        heading: "Returns",
        paragraphs: [
          `We accept returns within ${returnWindowDays} days of delivery. To be eligible, items must be unused, in their original condition, and in their original packaging. Proof of purchase (your order number or confirmation email) is required.`,
          `To start a return, contact us${legal.emails.support ? ` at ${legal.emails.support}` : ""} with your order number. We will confirm the return address and any next steps. Items sent back without first requesting a return may not be accepted.`
        ]
      },
      {
        heading: "Refunds",
        paragraphs: [
          "Once we receive and inspect your return, we will notify you of the outcome. Approved refunds are issued to your original payment method; depending on your bank or card issuer, it can take several business days for the refund to appear.",
          "Original shipping costs are non-refundable unless the return is due to our error (a wrong or defective item)."
        ]
      },
      {
        heading: "Exchanges and damaged items",
        paragraphs: [
          "The fastest way to get a different item is to return the one you have and place a new order once the return is accepted.",
          "If you receive a defective, damaged, or wrong item, contact us straight away — we will make it right with a replacement or a full refund, including shipping."
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
