import Link from "next/link";
import { IconFacebook, IconInstagram, IconTiktok, IconX } from "@/components/icons";
import type { NavLink } from "@/components/layout/nav-links";
import { NewsletterBand } from "@/components/layout/newsletter-band";
import { PaymentBadges } from "@/components/ui/payment-badges";
import { resolveLegalConfig, resolveStoreConfig } from "@/lib/config";

interface FooterProps {
  /** Collections column from the API; pages pass it in. */
  shopLinks?: NavLink[];
}

export function Footer({ shopLinks = [] }: FooterProps) {
  const store = resolveStoreConfig();
  const legal = resolveLegalConfig();

  const addressLines = [
    legal.address.line1,
    legal.address.line2,
    [legal.address.city, legal.address.region, legal.address.postalCode].filter(Boolean).join(", "),
    legal.address.country
  ].filter(Boolean);

  const socials = [
    { href: store.socials.x, label: "X", Icon: IconX },
    { href: store.socials.facebook, label: "Facebook", Icon: IconFacebook },
    { href: store.socials.instagram, label: "Instagram", Icon: IconInstagram },
    { href: store.socials.tiktok, label: "TikTok", Icon: IconTiktok }
  ].filter((social) => social.href);

  const columns: { title: string; links: NavLink[] }[] = [
    {
      title: "Shop",
      links: [{ label: "All Products", href: "/products" }, ...shopLinks.slice(0, 4)]
    },
    {
      title: "Help",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Delivery Details", href: "/policies/shipping" },
        { label: "Terms & Conditions", href: "/policies/terms" },
        { label: "Privacy Policy", href: "/policies/privacy" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Refund Policy", href: "/policies/refund" },
        { label: "Shipping Policy", href: "/policies/shipping" },
        { label: "Secure Payment", href: "/policies/payment" },
        { label: "Terms of Service", href: "/policies/terms" },
        { label: "Privacy", href: "/policies/privacy" }
      ]
    }
  ];

  return (
    <footer className="mt-16 lg:mt-20">
      {/*
        Newsletter band straddles the white/gray boundary (Figma). A background
        split at the exact midpoint of this wrapper keeps the card's own
        vertical center pinned to the seam no matter how many lines its
        heading wraps to — a fixed translate + guessed padding-top on the
        panel below broke on mobile once the 3-line heading made the card
        taller than the guess accounted for.
      */}
      <div className="bg-[linear-gradient(to_bottom,var(--color-background)_50%,var(--color-secondary)_50%)]">
        <NewsletterBand />
      </div>
      <div className="bg-secondary pb-8 pt-10 lg:pt-14">
        <div className="mx-auto flex max-w-page flex-col gap-10 px-4 lg:flex-row lg:justify-between">
          <div className="flex max-w-62 flex-col gap-6 lg:gap-9">
            <div className="flex flex-col gap-6">
              <Link href="/" className="font-heading text-[1.75rem] uppercase leading-none lg:text-[2.1rem]">
                {store.name}
              </Link>
              {store.tagline ? <p className="text-sm leading-[22px] text-muted">{store.tagline}</p> : null}
            </div>
            {addressLines.length > 0 || legal.phone || legal.emails.support ? (
              <div className="flex flex-col gap-1 text-sm leading-[22px] text-muted">
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {legal.phone ? (
                  <a href={`tel:${legal.phone}`} className="transition-colors hover:text-foreground">
                    {legal.phone}
                  </a>
                ) : null}
                {legal.emails.support ? (
                  <a href={`mailto:${legal.emails.support}`} className="transition-colors hover:text-foreground">
                    {legal.emails.support}
                  </a>
                ) : null}
              </div>
            ) : null}
            {socials.length > 0 ? (
              <div className="flex gap-3">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-7 items-center justify-center rounded-full bg-primary text-background transition-opacity hover:opacity-75"
                  >
                    <Icon width={13} height={13} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-24">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-4 lg:gap-6">
                <h3 className="text-base font-medium uppercase tracking-[3px]">{column.title}</h3>
                <ul className="flex flex-col gap-3.5">
                  {column.links.map((link) => (
                    <li key={`${link.label}-${link.href}`}>
                      <Link href={link.href} className="text-base text-muted transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-page flex-col items-center gap-4 border-t border-border px-4 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted">
            {legal.companyName} © {new Date().getFullYear()}, All Rights Reserved
          </p>
          <PaymentBadges badgeWidth={47} badgeHeight={30} />
        </div>
      </div>
    </footer>
  );
}
