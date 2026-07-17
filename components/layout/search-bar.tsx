"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { IconSearch } from "@/components/icons";

/** Header search: pill input, submits to /search?q=… */
export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <form
      role="search"
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const query = new FormData(event.currentTarget).get("q");
        const value = typeof query === "string" ? query.trim() : "";
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
      }}
    >
      <label className="flex items-center gap-3 rounded-full bg-secondary px-4 py-3">
        <IconSearch width={24} height={24} className="shrink-0 text-foreground/40" />
        <input
          type="search"
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Search for products..."
          className="w-full min-w-0 bg-transparent text-base outline-none placeholder:text-foreground/40"
        />
      </label>
    </form>
  );
}
