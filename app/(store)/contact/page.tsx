import type { Metadata } from "next";
import { IconFacebook, IconInstagram, IconMail, IconPhone, IconPin, IconTiktok, IconX } from "@/components/icons";
import { ProsePage } from "@/components/layout/prose-page";
import { resolveLegalConfig, resolveStoreConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with us — address, phone, email, and social channels."
};

/** /contact — store-owned contact details (config/legal.ts, config/store.ts). No hardcoded info (spec §1). */
export default function ContactPage() {
  const legal = resolveLegalConfig();
  const store = resolveStoreConfig();

  const { line1, line2, city, region, postalCode, country } = legal.address;
  const addressLines = [line1, line2, [city, region].filter(Boolean).join(", "), postalCode, country].filter(
    Boolean
  );

  const socials = [
    { href: store.socials.instagram, label: "Instagram", Icon: IconInstagram },
    { href: store.socials.facebook, label: "Facebook", Icon: IconFacebook },
    { href: store.socials.tiktok, label: "TikTok", Icon: IconTiktok },
    { href: store.socials.x, label: "X", Icon: IconX }
  ].filter((social) => social.href);

  const cards = [
    addressLines.length > 0
      ? {
          icon: IconPin,
          label: "Address",
          content: (
            <address className="not-italic text-muted">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          )
        }
      : null,
    legal.emails.support
      ? {
          icon: IconMail,
          label: "Email",
          content: (
            <a href={`mailto:${legal.emails.support}`} className="text-muted transition-colors hover:text-foreground">
              {legal.emails.support}
            </a>
          )
        }
      : null,
    legal.phone
      ? {
          icon: IconPhone,
          label: "Phone",
          content: (
            <a href={`tel:${legal.phone}`} className="text-muted transition-colors hover:text-foreground">
              {legal.phone}
            </a>
          )
        }
      : null
  ].filter((card) => card !== null);

  return (
    <ProsePage title="Contact Us">
      <p className="text-base leading-[22px] text-muted">
        Have a question about an order, a product, or anything else? {legal.companyName} is happy to help — reach us
        any of the ways below.
      </p>

      {cards.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10">
          {cards.map((card) => (
            <div key={card.label} className="flex items-start gap-4 rounded-card border border-border p-6">
              <card.icon width={22} height={22} className="mt-0.5 shrink-0 text-foreground" />
              <div>
                <h2 className="text-sm font-medium uppercase tracking-[3px] text-muted">{card.label}</h2>
                <div className="mt-1.5 text-base">{card.content}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {socials.length > 0 ? (
        <div className="mt-8 flex items-center gap-3 lg:mt-10">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-opacity hover:opacity-70"
            >
              <Icon width={16} height={16} />
            </a>
          ))}
        </div>
      ) : null}
    </ProsePage>
  );
}
