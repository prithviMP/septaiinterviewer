"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = {
  name: string;
  href: string;
};

type FloatingNavbarProps = {
  items: NavItem[];
  className?: string;
  pinned?: boolean;
};

export function FloatingNavbar({ items, className, pinned = true }: FloatingNavbarProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (pinned) return;
    const previous = scrollY.getPrevious() ?? 0;
    if (current < 48) {
      setVisible(true);
      return;
    }
    setVisible(current < previous);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          aria-label="Primary"
          className={cn(
            "hidden items-center gap-1 rounded-full bg-surface-container-low p-1.5 lg:flex",
            className,
          )}
        >
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface",
                  active && "font-bold text-on-primary-container",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="floating-nav-pill"
                    className="absolute inset-0 rounded-full bg-primary-container shadow-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
