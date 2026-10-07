"use client";

import { useState } from "react";
import Link from "next/link";
import { FloatingNavbar, type NavItem } from "@/components/ui/floating-navbar";
import { Icon } from "@/components/ui/icon";
import { PillButton } from "@/components/ui/pill-button";

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Practice Topics", href: "/topics" },
  { name: "Mock Session", href: "/session" },
  { name: "Scorecards", href: "/scorecard" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/85 shadow-header backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 rounded-full">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-primary">
            <Icon name="psychology" filled />
          </span>
          <span className="flex flex-col">
            <span className="text-lg leading-tight font-bold tracking-tight">AI Interview Coach</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-secondary uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Powered by Gemini AI
            </span>
          </span>
        </Link>

        <FloatingNavbar items={navItems} />

        <div className="flex items-center gap-3">
          <PillButton href="/topics" className="hidden sm:inline-flex">
            Start Interview
          </PillButton>
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-secondary-fixed text-sm font-bold text-on-secondary-fixed shadow-secondary">
            You
            <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-tertiary ring-2 ring-surface" />
          </span>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-on-surface lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-outline-variant bg-surface px-6 py-3 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded-full px-4 text-sm font-bold text-on-surface"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
