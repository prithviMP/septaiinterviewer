import { cn } from "@/lib/utils";

export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute -top-24 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-tertiary/10 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
    </div>
  );
}
