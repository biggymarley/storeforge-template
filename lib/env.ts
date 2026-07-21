import { z } from "zod";

const envSchema = z.object({
  SHOPIFY_STORE_DOMAIN: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/, {
      message: "must look like your-store.myshopify.com (no protocol, no trailing slash)"
    }),
  SHOPIFY_STOREFRONT_TOKEN: z.string().min(1),
  SHOPIFY_ADMIN_TOKEN: z.string().optional(),
  /** Custom app API secret key — verifies webhook HMACs. Unset → webhook route rejects all deliveries. */
  SHOPIFY_WEBHOOK_SECRET: z.string().optional(),
  /** Meta Conversions API token — server-side Purchase events from the orders webhook. Unset → CAPI skipped. */
  META_CAPI_ACCESS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional()
});

export type Env = z.infer<typeof envSchema>;

export interface EnvIssue {
  variable: string;
  message: string;
}

let cached: { env: Env | null; issues: EnvIssue[] } | null = null;

function validate(): { env: Env | null; issues: EnvIssue[] } {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_TOKEN: process.env.SHOPIFY_STOREFRONT_TOKEN,
    SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN || undefined,
    SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET || undefined,
    META_CAPI_ACCESS_TOKEN: process.env.META_CAPI_ACCESS_TOKEN || undefined,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined
  });
  cached = parsed.success
    ? { env: parsed.data, issues: [] }
    : {
        env: null,
        issues: parsed.error.issues.map((issue) => ({
          variable: String(issue.path[0] ?? "env"),
          message: issue.message === "Required" ? "is not set" : issue.message
        }))
      };
  return cached;
}

export function isShopifyConfigured(): boolean {
  return validate().env !== null;
}

export function getEnvIssues(): EnvIssue[] {
  return validate().issues;
}

/**
 * Returns validated env or throws a friendly, actionable error.
 * In dev, prefer `isShopifyConfigured()` + the setup screen over letting this throw.
 */
export function getEnv(): Env {
  const { env, issues } = validate();
  if (!env) {
    const details = issues.map((i) => `  - ${i.variable} ${i.message}`).join("\n");
    throw new Error(
      `[storeforge-template] Shopify environment is not configured:\n${details}\n` +
        `Set these in .env.local (dev) or your Vercel project (production). See README.md → Setup.`
    );
  }
  return env;
}

export function getSiteUrl(): string {
  const { env } = validate();
  return env?.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
