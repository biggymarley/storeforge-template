import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProsePage } from "@/components/layout/prose-page";
import { getPolicy, POLICY_HANDLES } from "@/lib/policies";

interface PolicyPageProps {
  params: Promise<{ policy: string }>;
}

export function generateStaticParams(): { policy: string }[] {
  return POLICY_HANDLES.map((policy) => ({ policy }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const policy = getPolicy((await params).policy);
  if (!policy) return {};
  return { title: policy.title, description: policy.description };
}

/** /policies/{privacy,terms,shipping,refund} — template text from config/legal.ts (spec §4). */
export default async function PolicyPage({ params }: PolicyPageProps) {
  const policy = getPolicy((await params).policy);
  if (!policy) notFound();

  return (
    <ProsePage title={policy.title}>
      <div className="prose-store">
        {policy.sections.map((section, index) => (
          <section key={index}>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {section.paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex}>{paragraph}</p>
            ))}
            {section.list ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </ProsePage>
  );
}
