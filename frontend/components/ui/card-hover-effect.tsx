"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HoverCard = {
  key: string;
  children: React.ReactNode;
  className?: string;
};

export function CardHoverEffect({
  items,
  className,
}: {
  items: HoverCard[];
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-2", className)}>
      {items.map((item) => (
        <div
          key={item.key}
          className="relative h-full"
          onMouseEnter={() => setHovered(item.key)}
          onMouseLeave={() => setHovered(null)}
        >
          <AnimatePresence>
            {hovered === item.key && (
              <motion.span
                layoutId="card-hover-wash"
                className="absolute inset-0 block rounded-card bg-primary-fixed/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
              />
            )}
          </AnimatePresence>
          <div className={cn("relative z-10 h-full rounded-card bg-surface-container-lowest shadow-card", item.className)}>
            {item.children}
          </div>
        </div>
      ))}
    </div>
  );
}
