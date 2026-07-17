import type { ReactNode } from "react";
import { notFound } from "next/navigation";

/** Template-internal QA surfaces (spec Phase E) — unreachable once deployed. */
export default function DevLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
