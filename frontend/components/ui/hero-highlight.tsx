"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type HeroHighlightProps = {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
};

export function HeroHighlight({ children, className, containerClassName }: HeroHighlightProps) {
  const reduce = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current || reduce) return;
    const bounds = ref.current.getBoundingClientRect();
    mouseX.set(event.clientX - bounds.left);
    mouseY.set(event.clientY - bounds.top);
  }

  const background = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, var(--theme-color-primary-fixed), transparent 80%)`;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn("group relative", containerClassName)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-card opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: reduce ? undefined : background }}
      />
      <div className={cn("relative", className)}>{children}</div>
    </div>
  );
}

export function Highlight({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  return (
    <span className={cn("relative inline-block text-primary", className)}>
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-primary-fixed"
        initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{ originX: 0 }}
      />
      {children}
      <svg
        className="absolute -bottom-2 left-0 h-3 w-full text-primary-container"
        viewBox="0 0 200 12"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M2 9C50 2 150 2 198 9" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      </svg>
    </span>
  );
}
