import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProsePage } from "@/components/layout/prose-page";
import { ErrorState } from "@/components/ui/error-state";
import { getPage } from "@/lib/shopify/api";
import { ShopifyError } from "@/lib/shopify/client";

interface ShopifyPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ShopifyPageProps): Promise<Metadata> {
  const { handle } = await params;
  try {
    const page = await getPage(handle);
    if (!page) return {};
    return {
      title: page.seo?.title ?? page.title,
      description: page.seo?.description ?? (page.bodySummary || undefined)
    };
  } catch {
    return {};
  }
}

/** Shopify pages (About etc.) rendered from the Storefront API (spec §4). */
export default async function ShopifyContentPage({ params }: ShopifyPageProps) {
  const { handle } = await params;

  try {
    const page = await getPage(handle);
    if (!page) notFound();

    return (
      <ProsePage title={page.title}>
        <div className="prose-store" dangerouslySetInnerHTML={{ __html: page.body }} />
      </ProsePage>
    );
  } catch (error) {
    if (!(error instanceof ShopifyError)) throw error;
    return <ErrorState title="This page is unavailable" message={error.message} />;
  }
}
