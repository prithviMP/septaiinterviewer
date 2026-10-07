import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  secondary: "bg-secondary-fixed text-on-secondary-fixed",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  solid: "bg-primary text-on-primary",
  muted: "bg-surface-container text-on-surface-variant",
  sky: "bg-tertiary text-on-tertiary",
  purple: "bg-secondary text-on-secondary",
} as const;

type BadgeProps = {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
};

export function Badge({ children, tone = "primary", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
