import { getEnv } from "@/lib/env";
import { SHOPIFY_API_VERSION } from "@/lib/shopify/constants";

export class ShopifyError extends Error {
  readonly status: number;
  readonly graphqlErrors: string[];

  constructor(message: string, options: { status?: number; graphqlErrors?: string[] } = {}) {
    super(message);
    this.name = "ShopifyError";
    this.status = options.status ?? 0;
    this.graphqlErrors = options.graphqlErrors ?? [];
  }
}

interface ShopifyFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  /** Pass "no-store" for cart operations; product/collection reads default to ISR. */
  cache?: RequestCache;
  /** Revalidation window in seconds; defaults to 60 for cached reads (spec §5). */
  revalidate?: number;
  tags?: string[];
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/**
 * Typed Storefront API client (spec §5). Normalizes transport, HTTP and
 * GraphQL errors into ShopifyError so pages/actions can catch one thing.
 */
export async function shopifyFetch<T>({
  query,
  variables,
  cache,
  revalidate,
  tags
}: ShopifyFetchOptions): Promise<T> {
  const env = getEnv();
  const url = `https://${env.SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": env.SHOPIFY_STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables }),
      ...(cache === "no-store"
        ? { cache: "no-store" as const }
        : { next: { revalidate: revalidate ?? 60, ...(tags ? { tags } : {}) } })
    });
  } catch (error) {
    throw new ShopifyError(
      `Could not reach Shopify (${env.SHOPIFY_STORE_DOMAIN}): ${error instanceof Error ? error.message : "network error"}`
    );
  }

  if (!response.ok) {
    throw new ShopifyError(
      `Shopify responded with HTTP ${response.status}. Check SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN.`,
      { status: response.status }
    );
  }

  const body = (await response.json()) as GraphQLResponse<T>;

  if (body.errors && body.errors.length > 0) {
    throw new ShopifyError(`Shopify GraphQL error: ${body.errors[0].message}`, {
      status: response.status,
      graphqlErrors: body.errors.map((e) => e.message)
    });
  }

  if (!body.data) {
    throw new ShopifyError("Shopify returned an empty response.", { status: response.status });
  }

  return body.data;
}
