import Link from "next/link";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary text-on-primary shadow-primary hover:bg-primary-container",
  secondary: "bg-secondary text-on-secondary shadow-secondary hover:bg-secondary-fixed-dim",
  tertiary: "bg-tertiary text-on-tertiary shadow-tertiary",
  surface: "bg-surface-container text-secondary hover:bg-secondary-container hover:text-on-secondary-container",
  ghost: "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
  fixed: "bg-secondary-fixed text-on-secondary-fixed shadow-secondary hover:bg-secondary-fixed-dim",
  sky: "bg-tertiary-fixed text-on-tertiary-fixed shadow-tertiary hover:bg-tertiary-fixed-dim",
} as const;

type Tone = keyof typeof tones;

type PillButtonProps = {
  children: React.ReactNode;
  tone?: Tone;
  href?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  ariaLabel?: string;
};

const classes = (tone: Tone, className?: string) =>
  cn(
    "motion-pop inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold tracking-wide transition duration-200 ease-out motion-safe:hover:scale-[1.03] motion-safe:active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
    tones[tone],
    className,
  );

export function PillButton({
  children,
  tone = "primary",
  href,
  className,
  disabled,
  type = "button",
  onClick,
  ariaLabel,
}: PillButtonProps) {
  if (href && !disabled) {
    return (
      <Link href={href} className={classes(tone, className)} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes(tone, className)}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
