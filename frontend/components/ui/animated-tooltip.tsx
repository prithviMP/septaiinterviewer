"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export type TooltipItem = {
  id: string;
  name: string;
  designation: string;
};

export function AnimatedTooltip({
  items,
  className,
}: {
  items: TooltipItem[];
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const x = useMotionValue(0);
  const spring = { stiffness: 120, damping: 12 };
  const rotate = useSpring(useTransform(x, [-80, 80], [-12, 12]), spring);
  const translateX = useSpring(useTransform(x, [-80, 80], [-16, 16]), spring);

  function onMove(event: React.MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - bounds.left - bounds.width / 2);
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <div key={item.id} className="relative">
          <button
            type="button"
            className="min-h-11 rounded-full bg-surface-container-lowest px-3 py-2 text-left text-xs font-bold text-on-surface"
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={onMove}
            onFocus={() => setHovered(item.id)}
            onBlur={() => setHovered(null)}
          >
            {item.name}
          </button>
          <AnimatePresence>
            {hovered === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                style={{ translateX, rotate }}
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-card bg-inverse-surface px-3 py-2 text-inverse-on-surface shadow-primary"
              >
                <p className="text-xs font-bold">{item.name}</p>
                <p className="mt-1 text-[11px] leading-snug text-primary-fixed">{item.designation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
