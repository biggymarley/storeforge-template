import type { Metadata } from "next";
import { ProsePage } from "@/components/layout/prose-page";
import { resolveLegalConfig, resolveStoreConfig } from "@/lib/config";
import { parseMarkdownSections } from "@/lib/policies";

export const metadata: Metadata = {
  title: "About Us"
};

/**
 * /about — template-owned story/mission copy with the store's name and
 * location interpolated in (config/store.ts, config/legal.ts). Same pattern
 * as lib/policies.ts: static text, no live fetch, no hardcoded store info.
 *
 * When StoreForge writes `config/legal.ts` `pageOverrides.about`, that custom
 * body replaces the placeholder below — parsed by the same markdown-ish helper
 * the /policies/* override pages use (lib/policies.ts).
 */
export default function AboutPage() {
  const store = resolveStoreConfig();
  const legal = resolveLegalConfig();

  const override = legal.pageOverrides?.about?.trim();
  if (override) {
    return (
      <ProsePage title={`About ${store.name}`} breadcrumbLabel="About Us">
        <div className="prose-store">
          {parseMarkdownSections(override).map((section, index) => (
            <section key={index}>
              {section.heading ? <h2>{section.heading}</h2> : null}
              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex}>{paragraph}</p>
              ))}
              {section.list ? (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </ProsePage>
    );
  }

  const location = [legal.address.city, legal.address.region].filter(Boolean).join(", ");

  return (
    <ProsePage title={`About ${store.name}`} breadcrumbLabel="About Us">
      <div className="prose-store">
        <h2>Our Story</h2>
        <p>
          Welcome to <strong>{store.name}</strong> — where everyday essentials meet extraordinary value. We started
          with a simple, powerful idea: finding high-quality, reliable products shouldn&rsquo;t be a hassle or cost a
          fortune.
        </p>
        <p>
          {location ? `Operating out of ${location}, our` : "Our"} journey began when we realized how hard it was to
          find a single, trustworthy store that truly caters to everyday needs. We decided to change that. We scour
          the market to curate a unique collection of products, ensuring every single item meets our strict standards
          for durability, functionality, and style.
        </p>
        <h2>Our Mission</h2>
        <p>
          We are more than just a general store. We are a team dedicated to making your life easier. We believe
          shopping should be a seamless, enjoyable experience. That is why we are committed to providing top-tier
          customer support, fast shipping, and deals that keep you coming back.
        </p>
        <p>Thank you for choosing {store.name}. Welcome to the family!</p>
      </div>
    </ProsePage>
  );
}
