import { ButtonLink } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  className?: string;
}

/** Styled API-failure state (spec §5: never a raw crash). */
export function ErrorState({ title = "Something went wrong", message, className = "" }: ErrorStateProps) {
  return (
    <div className={`mx-auto max-w-page px-4 py-16 ${className}`}>
      <div className="flex flex-col items-start gap-4 rounded-card border border-border p-8 lg:p-12">
        <h1 className="font-heading text-2xl uppercase lg:text-3xl">{title}</h1>
        <p className="max-w-xl text-sm text-muted lg:text-base">{message}</p>
        <ButtonLink href="/" variant="secondary" size="md">
          Back to Home
        </ButtonLink>
      </div>
    </div>
  );
}
