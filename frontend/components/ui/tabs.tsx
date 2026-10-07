"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TabItem = {
  title: string;
  value: string;
  content?: React.ReactNode;
};

type PillTabsProps = {
  tabs: { title: React.ReactNode; value: string }[];
  value: string;
  onChange: (value: string) => void;
  layoutId?: string;
  className?: string;
  activeClassName?: string;
  stretch?: boolean;
};

export function PillTabs({
  tabs,
  value,
  onChange,
  layoutId = "pill-tab",
  className,
  activeClassName,
  stretch,
}: PillTabsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1 rounded-full bg-surface-container p-1", className)}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative min-h-11 rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant",
              stretch && "min-w-0 flex-1",
              active && "text-on-primary",
            )}
            aria-pressed={active}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className={cn("absolute inset-0 rounded-full bg-primary shadow-primary", activeClassName)}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.title}</span>
          </button>
        );
      })}
    </div>
  );
}

type TabsProps = {
  tabs: TabItem[];
  className?: string;
  containerClassName?: string;
  layoutId?: string;
};

export function Tabs({ tabs, className, containerClassName, layoutId = "content-tab" }: TabsProps) {
  const [active, setActive] = useState(tabs[0]?.value ?? "");
  const reduce = useReducedMotion();
  const current = tabs.find((tab) => tab.value === active) ?? tabs[0];

  return (
    <div className={className}>
      <PillTabs
        tabs={tabs}
        value={active}
        onChange={setActive}
        layoutId={layoutId}
        className={containerClassName}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={current?.value}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          {current?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
