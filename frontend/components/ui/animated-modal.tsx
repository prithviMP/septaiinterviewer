"use client";

import { createContext, useContext, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ModalContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

function useModal() {
  const value = useContext(ModalContext);
  if (!value) throw new Error("Modal parts must sit inside AnimatedModal");
  return value;
}

export function AnimatedModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <ModalContext.Provider value={{ open, setOpen }}>{children}</ModalContext.Provider>;
}

export function ModalTrigger({
  children,
  className,
  onOpen,
}: {
  children: React.ReactNode;
  className?: string;
  onOpen?: () => void;
}) {
  const { setOpen } = useModal();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onOpen?.();
        setOpen(true);
      }}
    >
      {children}
    </button>
  );
}

export function ModalBody({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
}) {
  const { open, setOpen } = useModal();
  const reduce = useReducedMotion();

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-inverse-surface/45"
        aria-label="Close dialog"
        onClick={() => setOpen(false)}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={reduce ? false : { opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className={cn(
          "relative z-10 w-full max-w-md rounded-card bg-tertiary-fixed p-5 text-on-tertiary-fixed shadow-tertiary",
          className,
        )}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ModalClose({
  children,
  className,
  label,
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  onClose?: () => void;
}) {
  const { setOpen } = useModal();
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => {
        onClose?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
