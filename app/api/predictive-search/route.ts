import { NextResponse } from "next/server";
import { predictiveSearch } from "@/lib/shopify/api";
import { ShopifyError } from "@/lib/shopify/client";

/** Backs the header search dropdown. Failures degrade to "no suggestions" —
 * the user can still submit to /search. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ products: [] });
  try {
    const products = await predictiveSearch(q, 6);
    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof ShopifyError) return NextResponse.json({ products: [] });
    throw error;
  }
}
