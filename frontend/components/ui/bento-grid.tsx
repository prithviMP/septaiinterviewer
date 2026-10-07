import { cn } from "@/lib/utils";

export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid grid-cols-1 gap-6", className)}>{children}</div>;
}

export function BentoGridItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-card bg-surface-container-lowest p-6 shadow-card", className)}>{children}</div>
  );
}
