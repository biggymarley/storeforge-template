import { getEnvIssues } from "@/lib/env";

/**
 * Rendered in development when Shopify env vars are missing/invalid,
 * instead of crashing (spec §2.5).
 */
export function SetupScreen() {
  const issues = getEnvIssues();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-xl rounded-card border border-border p-8">
        <h1 className="font-heading text-2xl uppercase">Connect your Shopify store</h1>
        <p className="mt-3 text-muted">
          This storefront needs Shopify credentials before it can render. Create{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-sm">.env.local</code> in the
          project root with:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-card bg-secondary p-4 text-sm leading-6">
          {`SHOPIFY_STORE_DOMAIN=your-store.myshopify.com\nSHOPIFY_STOREFRONT_TOKEN=shpat_xxx\nNEXT_PUBLIC_SITE_URL=http://localhost:3000`}
        </pre>
        <ul className="mt-4 space-y-1 text-sm text-accent">
          {issues.map((issue) => (
            <li key={issue.variable}>
              {issue.variable} {issue.message}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Get a Storefront API token in Shopify admin → Settings → Apps and sales channels →
          Develop apps → your app → API credentials. Restart <code>npm run dev</code> after
          saving. Full instructions in README.md → Setup.
        </p>
      </div>
    </main>
  );
}
