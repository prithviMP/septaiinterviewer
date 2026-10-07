import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const columns = [
  {
    title: "DSA Practice",
    links: [
      { label: "Dynamic Programming", href: "/topics" },
      { label: "Trees & Graphs", href: "/topics" },
      { label: "Binary Search & Arrays", href: "/topics" },
    ],
  },
  {
    title: "System Design",
    links: [
      { label: "Distributed Caching", href: "/topics" },
      { label: "Microservices & Queues", href: "/topics" },
      { label: "Rate Limiters & Proxies", href: "/topics" },
    ],
  },
  {
    title: "Frameworks & Soft Skills",
    links: [
      { label: "React & Web Vitals", href: "/topics" },
      { label: "STAR Behavioral Coach", href: "/topics" },
      { label: "Executive Pitch Prep", href: "/scorecard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 w-full bg-surface-container-low pt-14 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <Icon name="psychology" className="text-primary" filled />
              AI Interview Coach
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Joyful, real-time audio and behavioral prep powered by advanced AI intelligence.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-secondary">
              <span className="h-2 w-2 rounded-full bg-tertiary" />
              Gemini Pro Active
            </div>
          </div>
          {columns.map((column) => (
            <div key={column.title} className="space-y-2">
              <p className="text-xs font-bold tracking-wider text-secondary uppercase">{column.title}</p>
              <ul className="space-y-1.5 text-xs text-on-surface-variant">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-on-surface-variant sm:flex-row">
          <p>© 2026 AI Interview Coach. Built with Gemini Multimodal AI.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              System Operational
            </span>
            <span>Joyful Prep Studio</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
