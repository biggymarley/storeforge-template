import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

interface ProsePageProps {
  title: string;
  /** Breadcrumb trail label; defaults to the title. */
  breadcrumbLabel?: string;
  children: ReactNode;
}

/**
 * Prose layout for /pages/[handle] and /policies/* (blueprint §Search/pages:
 * Integral 40 h1, 16/22 body, 720px measure — no Figma frame, improvised in
 * the type system).
 */
export function ProsePage({ title, breadcrumbLabel, children }: ProsePageProps) {
  return (
    <div className="mx-auto max-w-310 px-4 pt-5 lg:pt-6">
      <Breadcrumbs items={[{ label: breadcrumbLabel ?? title }]} className="text-sm lg:text-base" />
      <article className="mx-auto max-w-[720px] pb-16 pt-8 lg:pt-12">
        <h1 className="font-heading text-[2rem] uppercase leading-tight lg:text-[2.5rem]">{title}</h1>
        <div className="mt-6 lg:mt-8">{children}</div>
      </article>
    </div>
  );
}
