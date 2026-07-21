import type { Metadata } from "next";
import { IconVerified } from "@/components/icons";
import { ProsePage } from "@/components/layout/prose-page";
import { ButtonLink } from "@/components/ui/button";
import { resolveLegalConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your order is confirmed.",
  // Per-customer confirmation URLs (order number/email in the query) have no business in search results.
  robots: { index: false, follow: false }
};

interface ThankYouPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/**
 * /thank-you — generic order confirmation. Checkout runs on Shopify's domain,
 * and standard (non-Plus) checkout can't redirect back here, so this route gets
 * no guaranteed traffic: it exists for Plus merchants who configure that
 * redirect themselves, or for anything else that links to it (confirmation
 * emails, support replies). `order_number` / `email` query params personalize
 * the copy when present; the page reads perfectly fine without them.
 */
export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const sp = await searchParams;
  const orderNumber = firstParam(sp.order_number);
  const email = firstParam(sp.email);
  const legal = resolveLegalConfig();

  return (
    <ProsePage title="Thank You for Your Order" breadcrumbLabel="Thank You">
      <div className="flex items-start gap-4 rounded-card border border-border p-6">
        <IconVerified width={22} height={22} className="mt-0.5 shrink-0 text-foreground" />
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[3px] text-muted">
            {orderNumber ? `Order #${orderNumber}` : "Order Confirmed"}
          </h2>
          <p className="mt-1.5 text-base text-muted">
            {email
              ? `A confirmation email with your order details is on its way to ${email}.`
              : "A confirmation email with your order details is on its way to your inbox."}
          </p>
        </div>
      </div>

      <p className="mt-6 text-base leading-[22px] text-muted">
        {legal.companyName} is getting your order ready. You&rsquo;ll receive another email with tracking
        information as soon as it ships.
      </p>

      {legal.emails.support ? (
        <p className="mt-4 text-base leading-[22px] text-muted">
          Questions about your order? Reach us any time at{" "}
          <a href={`mailto:${legal.emails.support}`} className="transition-colors hover:text-foreground">
            {legal.emails.support}
          </a>
          .
        </p>
      ) : null}

      <ButtonLink href="/products" size="md" className="mt-8">
        Continue Shopping
      </ButtonLink>
    </ProsePage>
  );
}
