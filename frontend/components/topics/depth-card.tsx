"use client";

import { cn } from "@/lib/utils";

type DepthCardProps = {
  label: string;
  minutes: number;
  detail: string;
  popular?: boolean;
  selected: boolean;
  onSelect: () => void;
};

export function DepthCard({ label, minutes, detail, popular, selected, onSelect }: DepthCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "motion-pop flex min-h-28 flex-col justify-between rounded-panel p-4 text-left transition duration-200 motion-safe:hover:scale-[1.02]",
        selected
          ? "bg-tertiary-fixed/60 shadow-tertiary"
          : "bg-surface-container-low hover:bg-surface-container",
      )}
    >
      <span className="mb-3 flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold",
            selected ? "bg-tertiary text-on-tertiary" : "bg-surface-container text-on-surface-variant",
          )}
        >
          {minutes} min
        </span>
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full",
            selected ? "bg-tertiary" : "bg-surface-container-high",
          )}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-on-tertiary" />}
        </span>
      </span>
      <span>
        <span className="flex items-center gap-1.5">
          <span className="font-bold">{label}</span>
          {popular && (
            <span className="rounded-full bg-tertiary px-1.5 py-0.5 text-[10px] font-extrabold text-on-tertiary uppercase">
              Popular
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-on-surface-variant">{detail}</span>
      </span>
    </button>
  );
}
