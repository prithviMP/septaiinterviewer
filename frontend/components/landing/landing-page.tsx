"use client";

import { useState } from "react";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Badge } from "@/components/ui/badge";
import { CardHoverEffect, type HoverCard } from "@/components/ui/card-hover-effect";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { Icon } from "@/components/ui/icon";
import { PillButton } from "@/components/ui/pill-button";
import { PillTabs } from "@/components/ui/tabs";
import { SiteFooter } from "@/components/shell/site-footer";

const bars = [2, 3, 5, 3.5, 4.5, 2, 5, 3, 4, 2.5, 5, 1.5];

function PreviewCard() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative w-full rounded-card bg-surface-container-lowest p-6 shadow-primary-lg sm:p-7">
      <div className="absolute -top-6 -right-3 z-20 flex items-center gap-1.5 rounded-full bg-tertiary px-3.5 py-1.5 text-xs font-bold text-on-tertiary shadow-tertiary motion-safe:animate-bounce">
        <Icon name="mic" className="text-sm" />
        Live Voice Analysis
      </div>
      <div className="absolute -bottom-5 -left-4 z-20 flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-bold text-on-secondary shadow-secondary">
        <Icon name="auto_awesome" className="text-sm" />
        Gemini 2.5 Active
      </div>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary">
            <Icon name="smart_toy" />
          </div>
          <div>
            <h3 className="text-sm font-bold">System Design: Caching Tier</h3>
            <p className="text-xs text-on-surface-variant">Round 2 • Distributed Systems</p>
          </div>
        </div>
        <Badge tone="muted">Turn 4 of 6</Badge>
      </div>
      <div className="my-3 flex items-center gap-3 rounded-sheet bg-surface-container-low p-3.5">
        <button
          type="button"
          aria-label={playing ? "Pause preview audio" : "Play preview audio"}
          aria-pressed={playing}
          onClick={() => setPlaying((value) => !value)}
          className={`flex h-11 w-11 items-center justify-center rounded-full text-on-primary shadow-primary ${playing ? "bg-tertiary" : "bg-primary"}`}
        >
          <Icon name={playing ? "pause" : "volume_up"} />
        </button>
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[11px] font-medium text-on-surface-variant">
            <span>Candidate Response</span>
            <span>00:42 / 01:15</span>
          </div>
          <div className="flex h-5 items-end gap-1">
            {bars.map((height, index) => (
              <span
                key={index}
                className={`w-1.5 rounded-full ${index < 5 ? "bg-primary" : index < 8 ? "bg-secondary" : "bg-tertiary"}`}
                style={{ height: `${height * 4}px` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="my-3 flex items-center justify-between rounded-sheet bg-primary-fixed/50 p-3">
        <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-on-primary-fixed uppercase">
          <Icon name="stars" filled className="text-2xl text-primary" />
          Instant Gemini Score
        </span>
        <span className="rounded-full bg-primary px-3.5 py-1 text-sm font-black text-on-primary shadow-primary">
          8.6
        </span>
      </div>
      <AnimatedTooltip
        items={[
          { id: "accuracy", name: "Accuracy 9.0", designation: "Edge cases and runtime checks landed cleanly." },
          { id: "tradeoffs", name: "Trade-offs 8.2", designation: "Big-O was stated. Cache stampede was thin." },
          { id: "clarity", name: "Clarity 8.6", designation: "The walkthrough stayed short and ordered." },
        ]}
      />
      <div className="flex items-center justify-between pt-4">
        <span className="text-[11px] text-on-surface-variant">Ready for question 5?</span>
        <PillButton href="/topics" tone="secondary" className="px-4 py-1.5 text-xs">
          Continue Simulation
        </PillButton>
      </div>
    </div>
  );
}

function TrackModule({
  icon,
  iconClass,
  title,
  detail,
  count,
  band,
  bandClass,
}: {
  icon: string;
  iconClass: string;
  title: string;
  detail: string;
  count: string;
  band: string;
  bandClass: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-sheet bg-surface-container-low p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconClass}`}>
          <Icon name={icon} />
        </div>
        <div>
          <h4 className="text-sm font-bold">{title}</h4>
          <p className="text-xs text-on-surface-variant">{detail}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone="muted">{count}</Badge>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${bandClass}`}>{band}</span>
      </div>
    </div>
  );
}

function CoreTrack() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden p-8">
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
      <div>
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-primary-lg">
              <Icon name="terminal" className="text-3xl" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Core Tech</h3>
              <p className="text-xs font-bold tracking-wider text-secondary uppercase">Foundations & Scalability</p>
            </div>
          </div>
          <Badge>120+ Challenges</Badge>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
          Master whiteboard problem-solving, design scalable architectures, and answer trade-off questions asked by tier-1 teams.
        </p>
        <div className="space-y-4">
          <TrackModule
            icon="data_object"
            iconClass="bg-secondary-fixed text-secondary"
            title="Data Structures & Algorithms"
            detail="Trees, Graphs, DP, Intervals, Two Pointers"
            count="54 Qs"
            band="Easy → Hard"
            bandClass="bg-secondary-fixed text-secondary"
          />
          <TrackModule
            icon="architecture"
            iconClass="bg-tertiary-fixed text-tertiary"
            title="Low-Level Design (LLD)"
            detail="SOLID, Design Patterns, Concurrency, UML"
            count="36 Qs"
            band="Med → Hard"
            bandClass="bg-primary-fixed text-primary"
          />
          <TrackModule
            icon="cloud_sync"
            iconClass="bg-primary-fixed text-primary"
            title="High-Level Design (HLD)"
            detail="Sharding, Kafka, Event-Driven, CAP Theorem"
            count="32 Qs"
            band="Hard"
            bandClass="bg-tertiary-fixed text-tertiary"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between pt-6">
        <span className="flex items-center gap-1.5 text-xs font-bold text-secondary">
          <Icon name="schedule" className="text-sm" />
          Est. 14 Days to Mastery
        </span>
        <PillButton href="/topics" className="px-6 py-2.5 text-xs">
          Launch Core Track
          <Icon name="play_arrow" className="text-sm" />
        </PillButton>
      </div>
    </div>
  );
}

function FrameworkTrack() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden p-8">
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-tertiary/10 blur-2xl" />
      <div>
        <div className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary text-on-tertiary shadow-tertiary">
              <Icon name="code_blocks" className="text-3xl" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Languages & Frameworks</h3>
              <p className="text-xs font-bold tracking-wider text-tertiary uppercase">Full-Stack & Enterprise Stacks</p>
            </div>
          </div>
          <Badge tone="tertiary">95+ Challenges</Badge>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
          Drill runtime details, memory, async event loops, and the framework patterns used in production services.
        </p>
        <div className="space-y-4">
          <TrackModule
            icon="coffee"
            iconClass="bg-primary-fixed text-primary"
            title="Java & Spring Boot"
            detail="JVM Tuning, IoC & DI, Hibernate JPA, Virtual Threads"
            count="48 Qs"
            band="Med → Hard"
            bandClass="bg-secondary-fixed text-secondary"
          />
          <TrackModule
            icon="javascript"
            iconClass="bg-secondary-fixed text-secondary"
            title="Node.js & Express.js"
            detail="Libuv, Event Loop, Middlewares, Streams"
            count="32 Qs"
            band="Easy → Med"
            bandClass="bg-tertiary-fixed text-tertiary"
          />
          <TrackModule
            icon="hub"
            iconClass="bg-tertiary-fixed text-tertiary"
            title="REST, gRPC & Security"
            detail="OAuth 2.0, JWT, Rate Limiting, CORS"
            count="15 Qs"
            band="All Levels"
            bandClass="bg-primary-fixed text-primary"
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between pt-6">
        <span className="flex items-center gap-1.5 text-xs font-bold text-tertiary">
          <Icon name="schedule" className="text-sm" />
          Est. 10 Days to Mastery
        </span>
        <PillButton href="/topics" tone="tertiary" className="px-6 py-2.5 text-xs">
          Launch Framework Track
          <Icon name="play_arrow" className="text-sm" />
        </PillButton>
      </div>
    </div>
  );
}

const steps = [
  {
    n: "01",
    tone: "bg-primary text-on-primary shadow-primary-lg",
    chip: "bg-primary-fixed text-on-primary-fixed",
    chipLabel: "Personalized Setup",
    title: "Pick Your Focus",
    body: "Select DSA topics, system scale targets, or stack skills. Set the level you want the mock to hold you to.",
    footIcon: "tune",
    foot: "Dynamic Difficulty Calibrated",
    footClass: "text-primary",
  },
  {
    n: "02",
    tone: "bg-secondary text-on-secondary shadow-secondary",
    chip: "bg-secondary-fixed text-on-secondary-fixed",
    chipLabel: "Multimodal Speech",
    title: "Interactive Mock Session",
    body: "Answer in code and notes. The coach pushes on edge cases, complexity, and the trade-off you skipped.",
    footIcon: "record_voice_over",
    foot: "Real-Time Audio & Synthetics",
    footClass: "text-secondary",
  },
  {
    n: "03",
    tone: "bg-tertiary text-on-tertiary shadow-tertiary",
    chip: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    chipLabel: "Targeted Feedback",
    title: "Scorecard & Rubric",
    body: "Read a line-level critique, a score per question, and the next drills that match the gaps.",
    footIcon: "analytics",
    foot: "Actionable Drill Playbooks",
    footClass: "text-tertiary",
  },
];

export function LandingPage() {
  const [filter, setFilter] = useState("all");
  const tracks: HoverCard[] = [];
  if (filter !== "frameworks") tracks.push({ key: "core", children: <CoreTrack /> });
  if (filter !== "core") tracks.push({ key: "frameworks", children: <FrameworkTrack /> });

  return (
    <>
      <div className="relative overflow-hidden px-6 py-12 md:py-20 lg:px-12">
        <AmbientGlow />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <Badge className="px-4 py-2 uppercase shadow-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Next-Gen Audio & Code AI Coach
            </Badge>
            <HeroHighlight>
              <h1 className="text-4xl leading-[1.1] font-black tracking-tight sm:text-5xl lg:text-6xl">
                Ace Your Tech Interviews with <Highlight>Gemini AI</Highlight>
              </h1>
            </HeroHighlight>
            <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant sm:text-xl">
              Practice DSA, System Design, and full-stack frameworks with real-time audio dialogues, instant precision rubrics, and joyful step-by-step guidance.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <PillButton href="/topics" className="px-8 py-4 text-base shadow-primary-lg">
                Start Free Mock Interview
                <Icon name="arrow_forward" />
              </PillButton>
              <PillButton href="#tracks" tone="surface" className="px-7 py-4 text-base">
                <Icon name="explore" />
                Explore Tracks
              </PillButton>
            </div>
            <div className="flex flex-wrap gap-3 pt-6">
              {[
                ["fact_check", "text-primary", "15,000+ Questions Practiced"],
                ["trending_up", "text-secondary", "94% Higher Confidence"],
                ["bolt", "text-tertiary", "<3s Gemini Feedback Speed"],
              ].map(([icon, color, label]) => (
                <div key={label} className="flex items-center gap-2.5 rounded-full bg-surface-container-low px-4 py-2.5 shadow-sm">
                  <Icon name={icon} className={color} />
                  <span className="text-sm font-bold">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <PreviewCard />
          </div>
        </div>
      </div>

      <div className="px-6 py-6 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-sheet bg-gradient-to-r from-primary-fixed via-secondary-fixed to-tertiary-fixed p-1 shadow-primary">
          <div className="flex flex-col items-center justify-between gap-4 rounded-sheet bg-surface-container-lowest px-6 py-5 md:flex-row">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-primary">
                <Icon name="neurology" className="text-2xl" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="text-[10px] uppercase">Engine v2.5</Badge>
                  <h2 className="text-base font-black md:text-lg">Phase 2 Powered by Google Gemini 2.5</h2>
                </div>
                <p className="mt-0.5 text-xs text-on-surface-variant md:text-sm">
                  Instant accuracy scoring, semantic reasoning critiques, and personalized follow-up questions.
                </p>
              </div>
            </div>
            <Badge tone="secondary">
              <span className="h-2 w-2 rounded-full bg-tertiary" />
              99.98% Live Uptime
            </Badge>
          </div>
        </div>
      </div>

      <section id="tracks" className="scroll-mt-24 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <Badge tone="secondary" className="uppercase">
                <Icon name="hub" className="text-sm" />
                Curated Practice Tracks
              </Badge>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Targeted Practice Modules</h2>
              <p className="max-w-xl text-base text-on-surface-variant">
                Choose your battleground. From whiteboard algorithms to production services and language internals.
              </p>
            </div>
            <PillTabs
              layoutId="track-filter"
              value={filter}
              onChange={setFilter}
              tabs={[
                { title: "All Tracks", value: "all" },
                { title: "Core Systems", value: "core" },
                { title: "Frameworks", value: "frameworks" },
              ]}
            />
          </div>
          <CardHoverEffect items={tracks} className={tracks.length === 1 ? "lg:grid-cols-1" : undefined} />
        </div>
      </section>

      <section className="relative bg-surface-container-low/60 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Badge className="mb-3 uppercase">
              <Icon name="flowsheet" className="text-sm" />
              Frictionless Loop
            </Badge>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">How Gemini AI Preps You</h2>
            <p className="mt-2 text-base text-on-surface-variant">
              From warm-up to senior-level mastery in three structured stages.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.n}
                className="motion-pop flex flex-col justify-between rounded-card bg-surface-container-lowest p-8 shadow-card transition duration-200 motion-safe:hover:scale-[1.02]"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-black ${step.tone}`}>
                      {step.n}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${step.chip}`}>{step.chipLabel}</span>
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">{step.body}</p>
                </div>
                <div className="flex items-center gap-3 rounded-sheet bg-surface-container-low p-3.5">
                  <Icon name={step.footIcon} className={step.footClass} />
                  <span className="text-xs font-semibold">{step.foot}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-14 text-center">
            <PillButton href="/topics" className="px-10 py-4 text-base shadow-primary-lg">
              Start Your First 15-Minute Session
              <Icon name="rocket_launch" />
            </PillButton>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
