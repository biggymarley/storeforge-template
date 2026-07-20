import { StepperDemo } from "@/components/dev/stepper-demo";
import {
  IconAccount,
  IconArrow,
  IconCart,
  IconChevronDown,
  IconClose,
  IconMail,
  IconMenu,
  IconSearch,
  IconSliders,
  IconTag,
  IconTrash,
  IconVerified
} from "@/components/icons";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/product/product-card";
import { ReviewCard } from "@/components/product/review-card";
import { DiscountBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { PillInput } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Price } from "@/components/ui/price";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { resolveStoreConfig } from "@/lib/config";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

export const metadata = { title: "Component gallery" };

const mockProduct: ProductCardType = {
  id: "gid://shopify/Product/1",
  handle: "mock-product",
  title: "Gradient Graphic T-shirt",
  availableForSale: true,
  featuredImage: null,
  priceRange: {
    minVariantPrice: { amount: "145.0", currencyCode: "USD" },
    maxVariantPrice: { amount: "145.0", currencyCode: "USD" }
  },
  compareAtPriceRange: { maxVariantPrice: { amount: "180.0", currencyCode: "USD" } },
  quickAddVariants: { edges: [{ node: { id: "gid://shopify/ProductVariant/1", availableForSale: true } }] }
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-border pb-10">
      <h2 className="text-sm font-medium uppercase tracking-[3px] text-muted">{title}</h2>
      {children}
    </section>
  );
}

/** Template-internal gallery for eyeballing Phase C components against Figma. */
export default function ComponentsGallery() {
  const store = resolveStoreConfig();

  return (
    <div>
      <AnnouncementBar text={store.announcement.text || "Announcement bar text"} />
      <Header
        links={[
          { label: "Shop", href: "/products" },
          { label: "On Sale", href: "/products" },
          { label: "New Arrivals", href: "/products" },
          { label: "Brands", href: "/products" }
        ]}
        withCart={false}
      />
      <main className="mx-auto flex max-w-page flex-col gap-10 px-4 py-10">
        <h1 className="font-heading text-3xl uppercase">Component gallery</h1>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Add to Cart</Button>
            <Button variant="secondary">View All</Button>
            <Button size="md">Apply Filter</Button>
            <Button disabled>Disabled</Button>
            <ButtonLink href="#" variant="primary">
              Go to Checkout <IconArrow width={24} height={24} className="-rotate-90" />
            </ButtonLink>
          </div>
        </Section>

        <Section title="Chips / badges / swatches">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>Small</Chip>
            <Chip>Medium</Chip>
            <Chip selected>Large</Chip>
            <Chip>X-Large</Chip>
            <DiscountBadge>-20%</DiscountBadge>
          </div>
          <div className="flex gap-3.5">
            <ColorSwatch color="#4F4631" colorName="Olive" selected />
            <ColorSwatch color="#314F4A" colorName="Pine" />
            <ColorSwatch color="#31344F" colorName="Navy" />
          </div>
        </Section>

        <Section title="Rating / price">
          <StarRating rating={4.5} />
          <StarRating rating={3} />
          <Price price={{ amount: "260.0", currencyCode: "USD" }} compareAt={{ amount: "300.0", currencyCode: "USD" }} size="lg" />
          <Price price={{ amount: "145.0", currencyCode: "USD" }} />
        </Section>

        <Section title="Inputs / stepper">
          <div className="flex max-w-md flex-col gap-3">
            <PillInput icon={<IconSearch width={24} height={24} />} placeholder="Search for products..." />
            <PillInput icon={<IconTag width={24} height={24} />} placeholder="Add promo code" />
          </div>
          <div className="flex items-center gap-4">
            <StepperDemo />
            <StepperDemo size="sm" />
          </div>
        </Section>

        <Section title="Breadcrumbs / pagination">
          <Breadcrumbs items={[{ label: "Shop", href: "/products" }, { label: "T-shirts" }]} />
          <Pagination hasPreviousPage={false} hasNextPage previousHref="#" nextHref="#" />
        </Section>

        <Section title="Icons">
          <div className="flex flex-wrap items-center gap-4 text-foreground">
            <IconMenu /> <IconClose width={20} height={20} /> <IconSearch /> <IconCart /> <IconAccount />
            <IconChevronDown width={16} height={16} /> <IconSliders /> <IconTag /> <IconArrow /> <IconMail />
            <IconTrash className="text-accent" /> <IconVerified className="text-success" />
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid max-w-3xl grid-cols-2 gap-5 lg:grid-cols-3">
            <ProductCard product={mockProduct} />
            <ProductCard product={{ ...mockProduct, title: "Checkered Shirt", availableForSale: false, compareAtPriceRange: { maxVariantPrice: { amount: "0", currencyCode: "USD" } } }} />
            <ProductCardSkeleton />
          </div>
          <div className="max-w-md">
            <ReviewCard
              name="Sarah M."
              verified
              rating={5}
              quote="I'm blown away by the quality and style of the clothes I received. Every piece I've bought has exceeded my expectations."
              date="August 14, 2023"
            />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
