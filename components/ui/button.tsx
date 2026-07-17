import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-3 rounded-full font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  // Figma: black pill, 16px Satoshi Medium, white text
  primary: "bg-primary text-background hover:opacity-85",
  // Figma "View All": white pill, 1px foreground/10 border
  secondary: "border border-border bg-background text-foreground hover:bg-secondary"
};

const sizes: Record<Size, string> = {
  md: "px-13.5 py-3 text-sm",
  lg: "px-13.5 py-4 text-base"
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", size = "lg", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = BaseProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function ButtonLink({ variant = "primary", size = "lg", className = "", href, children, ...props }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
