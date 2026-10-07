import { PillButton } from "@/components/ui/pill-button";

export function NeedsSession({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{detail}</p>
      <PillButton href="/topics" className="mt-6">
        Choose topics
      </PillButton>
    </div>
  );
}
