import { SiteHeader } from "@/components/shell/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-surface pt-20">{children}</main>
    </>
  );
}
