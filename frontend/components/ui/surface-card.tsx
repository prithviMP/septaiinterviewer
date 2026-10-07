import { cn } from "@/lib/utils";

type SurfaceCardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  lift?: boolean;
};

export function SurfaceCard({ children, className, as: Tag = "div", lift = false }: SurfaceCardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card bg-surface-container-lowest shadow-card",
        lift && "motion-pop transition duration-200 motion-safe:hover:scale-[1.01]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
