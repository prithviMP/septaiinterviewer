"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary text-on-primary shadow-primary",
  secondary: "bg-secondary text-on-secondary shadow-secondary",
  tertiary: "bg-tertiary text-on-tertiary shadow-tertiary",
  muted: "bg-surface-container-low text-on-surface-variant",
};

type FocusChipProps = {
  label: string;
  icon: string;
  tone: keyof typeof tones;
  active: boolean;
  onToggle: () => void;
};

export function FocusChip({ label, icon, tone, active, onToggle }: FocusChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        "motion-pop inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition duration-200 motion-safe:hover:scale-105",
        active ? tones[tone] : tones.muted,
      )}
    >
      <Icon name={icon} />
      {label}
    </button>
  );
}
