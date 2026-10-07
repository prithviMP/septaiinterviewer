"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type TopicCardProps = {
  name: string;
  detail: string;
  icon: string;
  selected: boolean;
  compact?: boolean;
  onToggle: () => void;
};

export function TopicCard({ name, detail, icon, selected, compact, onToggle }: TopicCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "motion-pop min-h-11 rounded-sheet p-4 text-left transition duration-200 motion-safe:hover:scale-[1.02]",
        compact ? "flex items-center justify-between" : "flex h-28 flex-col justify-between",
        selected
          ? "bg-primary-fixed/50 text-on-surface shadow-primary"
          : "bg-surface-container-low text-on-surface hover:bg-surface-container",
      )}
    >
      <span className={cn("flex w-full items-center", compact ? "gap-2" : "justify-between")}>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            selected ? "bg-primary text-on-primary" : "bg-surface-container text-secondary",
          )}
        >
          <Icon name={icon} className="text-lg" />
        </span>
        {compact && <span className="font-bold">{name}</span>}
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary",
            !selected && "invisible",
          )}
        >
          <Icon name="check" className="text-sm" />
        </span>
      </span>
      {!compact && (
        <span>
          <span className="block text-sm leading-tight font-bold">{name}</span>
          <span className="text-[11px] text-on-surface-variant">{detail}</span>
        </span>
      )}
    </button>
  );
}
