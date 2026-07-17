import { resolveStoreConfig } from "@/lib/config";

/**
 * Temporary Phase B stub — exercises the theming pipeline end-to-end
 * (config colors → CSS vars → Tailwind tokens, config fonts → next/font).
 * Replaced by the real home page in Phase D.
 */
export default function Home() {
  const store = resolveStoreConfig();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 p-8">
      <h1 className="font-heading text-5xl uppercase leading-none">{store.name}</h1>
      <p className="text-muted">{store.tagline}</p>
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-primary px-13 py-4 text-background">Primary button</span>
        <span className="rounded-full border border-border px-13 py-4">Secondary button</span>
        <span className="rounded-full bg-accent/10 px-3.5 py-1.5 text-xs text-accent">-20%</span>
      </div>
      <div className="w-full rounded-card bg-secondary p-6 text-sm text-muted">
        Phase B scaffold — real pages arrive in Phase D. Raw data check lives at /dev/scratch.
      </div>
    </main>
  );
}
