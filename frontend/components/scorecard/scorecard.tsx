"use client";

import { useState } from "react";
import { useInterviewDraft } from "@/components/providers";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Icon } from "@/components/ui/icon";
import { PillButton } from "@/components/ui/pill-button";
import { levelById } from "@/lib/mock-data";

const metrics = [
  {
    icon: "code",
    iconWrap: "bg-primary-fixed text-primary",
    score: "9.0",
    scoreClass: "text-primary",
    bar: "bg-primary",
    width: "90%",
    title: "Technical Accuracy",
    detail: "Exceptional edge case coverage and runtime validation.",
  },
  {
    icon: "balance",
    iconWrap: "bg-secondary-fixed text-secondary",
    score: "8.2",
    scoreClass: "text-secondary",
    bar: "bg-secondary",
    width: "82%",
    title: "Completeness & Trade-offs",
    detail: "Solid Big-O analysis and fallback logic.",
  },
  {
    icon: "forum",
    iconWrap: "bg-tertiary-fixed text-tertiary",
    score: "8.6",
    scoreClass: "text-tertiary",
    bar: "bg-tertiary",
    width: "86%",
    title: "Communication & Clarity",
    detail: "Structured walkthrough and concise thought formulation.",
  },
];

const reviews = [
  {
    id: "q1",
    index: "01",
    indexClass: "bg-primary-fixed text-primary",
    tag: "DSA • Sliding Window",
    verdict: "9.5 / 10 • Exceptional",
    verdictClass: "bg-primary-fixed text-on-primary-fixed",
    title: "Find Longest Substring with At Most K Distinct Characters",
    time: "9m 24s",
    body: (
      <div className="space-y-4">
        <div className="space-y-2 rounded-card bg-surface-container-low p-4">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <Icon name="terminal" className="text-sm text-tertiary" />
              Candidate Code Snapshot
            </span>
            <span className="font-mono text-tertiary">O(N) Time • O(K) Space</span>
          </div>
          <pre className="overflow-x-auto rounded-sheet bg-surface-container-highest p-3 font-mono text-xs leading-relaxed">{`int left = 0, maxLen = 0;
Map<Character, Integer> freq = new HashMap<>();
for (int right = 0; right < s.length(); right++) {
    freq.put(s.charAt(right), freq.getOrDefault(s.charAt(right), 0) + 1);
    while (freq.size() > k) {
        char leftChar = s.charAt(left);
        freq.put(leftChar, freq.get(leftChar) - 1);
        if (freq.get(leftChar) == 0) freq.remove(leftChar);
        left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
}`}</pre>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-card bg-primary-fixed/30 p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-on-primary-fixed">
              <Icon name="check_circle" filled className="text-primary" />
              Key Strengths
            </p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              <li>Single-pass two pointers with no backtracking.</li>
              <li>Called out the k = 0 edge before writing code.</li>
              <li>Names stayed clear. No syntax fixes needed.</li>
            </ul>
          </div>
          <div className="space-y-2 rounded-card bg-surface-container p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-secondary">
              <Icon name="rocket_launch" />
              Areas to Elevate
            </p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              <li>An int[128] array beats a HashMap for ASCII and skips boxing.</li>
              <li>Say what happens if the stream is larger than memory.</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "q2",
    index: "02",
    indexClass: "bg-secondary-fixed text-secondary",
    tag: "High-Level Design • Distributed Systems",
    verdict: "8.0 / 10 • Good",
    verdictClass: "bg-secondary-container text-on-secondary-container",
    title: "Design a Global Distributed API Rate Limiter (Token Bucket)",
    time: "18m 10s",
    body: (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 rounded-card bg-surface-container-low p-4 sm:flex-row">
          <div className="flex w-full flex-col items-center rounded-sheet bg-surface-container-lowest p-3 text-center shadow-sm sm:w-1/3">
            <Icon name="schema" className="text-3xl text-tertiary" />
            <span className="mt-1 text-xs font-bold">Evaluated Architecture</span>
            <span className="text-[10px] text-on-surface-variant">Redis Sliding Logs + Token Bucket</span>
          </div>
          <div className="w-full space-y-2 sm:w-2/3">
            <p className="flex items-center gap-2 text-xs font-bold text-secondary">
              <Icon name="psychology" className="text-sm" />
              Gemini Trade-off Assessment
            </p>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              You caught the Redis race on separate GET and SET calls and moved the refill into one script. Cross-region lag between APAC and US-East still needs a number.
            </p>
          </div>
        </div>
        <div className="space-y-2 rounded-card bg-tertiary-fixed/30 p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-on-tertiary-fixed">
              <Icon name="lightbulb" className="text-sm text-tertiary" />
              Ideal Architectural Recommendation
            </span>
            <span className="text-[10px] font-bold tracking-wider text-tertiary uppercase">Staff+ Pattern</span>
          </div>
          <p className="text-xs leading-relaxed">
            Keep a small token buffer at the edge proxy and sync it to the global bucket in batches. That drops gateway overhead while the limit stays within a few percent.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "q3",
    index: "03",
    indexClass: "bg-tertiary-fixed text-tertiary",
    tag: "Java • Spring Boot • Internals",
    verdict: "8.2 / 10 • Solid",
    verdictClass: "bg-tertiary-fixed text-on-tertiary-fixed",
    title: "Bean Lifecycles, Circular Dependencies, and Transactional Proxies",
    time: "14m 44s",
    body: (
      <div className="space-y-4">
        <div className="space-y-2 rounded-card bg-surface-container-low p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold">
            <Icon name="record_voice_over" className="text-sm text-secondary" />
            Verbal Answer Excerpt
          </p>
          <blockquote className="rounded-sheet bg-surface-container-highest/60 p-3 text-xs leading-relaxed text-on-surface-variant italic">
            Spring exposes an early singleton so a cycle can resolve. A @Transactional self-call skips the proxy, so the advice never runs.
          </blockquote>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1 rounded-card bg-surface-container p-4">
            <p className="flex items-center gap-1 text-xs font-bold text-primary">
              <Icon name="check" className="text-sm" /> Mastered Concept
            </p>
            <p className="text-xs text-on-surface-variant">
              Self-invocation was named, with a refactor as the fix.
            </p>
          </div>
          <div className="space-y-1 rounded-card bg-error-container/40 p-4">
            <p className="flex items-center gap-1 text-xs font-bold text-error">
              <Icon name="warning" className="text-sm" /> Targeted Focus
            </p>
            <p className="text-xs text-on-surface-variant">
              Review isolation levels and when a lock is the right tool.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export function Scorecard() {
  const { draft } = useInterviewDraft();
  const level = levelById(draft.level);
  const [open, setOpen] = useState<Record<string, boolean>>({ q1: true, q2: true, q3: true });
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function toggle(id: string) {
    setOpen((current) => ({ ...current, [id]: !current[id] }));
  }

  const allOpen = reviews.every((item) => open[item.id]);

  return (
    <div className="relative overflow-hidden px-6 py-8 pb-16 lg:px-12">
      <AmbientGlow />
      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3.5 py-1.5 text-xs font-bold tracking-wider text-secondary uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Mock Evaluation Dossier
              <span className="text-outline">•</span>
              <span className="font-medium text-on-surface-variant normal-case">Session #EV-8841</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
              {level.short} Technical Mock • Completed Session Report
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="tertiary" className="px-4 py-2 shadow-tertiary">
              <Icon name="verified" filled className="text-sm text-tertiary" />
              Completed Just Now • 5 Questions Evaluated
            </Badge>
            <button
              type="button"
              aria-label="Print scorecard"
              onClick={() => window.print()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container shadow-sm hover:bg-surface-container-high"
            >
              <Icon name="print" />
            </button>
          </div>
        </div>

        <BentoGrid className="lg:grid-cols-12">
          <BentoGridItem className="flex flex-col justify-between p-8 shadow-primary lg:col-span-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold tracking-wider text-secondary uppercase">Overall Verdict</span>
                <div className="mt-1">
                  <Badge className="uppercase">Strong Hire • Top 4%</Badge>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/40 text-primary">
                <Icon name="stars" filled />
              </div>
            </div>
            <div className="my-6 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
                  <circle className="text-surface-container" cx="60" cy="60" fill="transparent" r="50" stroke="currentColor" strokeWidth="12" />
                  <circle
                    className="text-primary"
                    cx="60"
                    cy="60"
                    fill="transparent"
                    r="50"
                    stroke="currentColor"
                    strokeDasharray="314.159"
                    strokeDashoffset="44"
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tracking-tighter">8.6</span>
                  <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">out of 10</span>
                </div>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-lg leading-tight font-bold">Exceptional Performance</p>
                <p className="max-w-xs text-xs leading-relaxed text-on-surface-variant">
                  Above the {level.short.toLowerCase()} benchmark. Architecture came through with little coaching.
                </p>
                <Badge tone="muted">
                  <Icon name="trending_up" className="text-xs text-tertiary" />
                  +1.2 pts vs. previous mock
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 text-xs text-on-surface-variant">
              <span>Interviewer: Gemini preview</span>
              <span className="font-bold text-secondary">42m 18s duration</span>
            </div>
          </BentoGridItem>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
            {metrics.map((metric) => (
              <BentoGridItem key={metric.title} className="flex flex-col justify-between motion-safe:hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${metric.iconWrap}`}>
                    <Icon name={metric.icon} />
                  </span>
                  <span className={`text-xl font-black ${metric.scoreClass}`}>{metric.score}</span>
                </div>
                <div className="my-4 space-y-1.5">
                  <p className="text-sm font-bold">{metric.title}</p>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
                    <div className={`h-full rounded-full ${metric.bar}`} style={{ width: metric.width }} />
                  </div>
                </div>
                <p className="text-[11px] leading-normal text-on-surface-variant">{metric.detail}</p>
              </BentoGridItem>
            ))}
          </div>
        </BentoGrid>

        <div className="flex flex-col items-start gap-4 rounded-card bg-secondary-container p-6 text-on-secondary-container shadow-secondary sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-secondary">
            <Icon name="neurology" filled className="text-2xl" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold tracking-wider text-secondary uppercase">Gemini Coach Synthesis</span>
              <Badge tone="muted">Mock scorecard</Badge>
            </div>
            <p className="text-sm leading-relaxed">
              Strong algorithmic intuition on DSA and a clear split of the rate limiter. Next pass: transaction isolation in the Spring persistence layer.
              {draft.topics.length > 0 && ` Topics in this draft: ${draft.topics.join(", ")}.`}
            </p>
          </div>
        </div>

        <section className="space-y-4 pt-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Question-by-Question Deep Dive</h2>
              <p className="text-sm text-on-surface-variant">Open a question to read the critique, the code snapshot, and the next step.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setOpen(Object.fromEntries(reviews.map((item) => [item.id, !allOpen])))
              }
              className="min-h-11 rounded-full bg-surface-container px-4 text-xs font-bold text-secondary"
            >
              {allOpen ? "Collapse All" : "Expand All"}
            </button>
          </div>
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="overflow-hidden rounded-card bg-surface-container-lowest shadow-card">
                <button
                  type="button"
                  className="flex w-full flex-col items-start justify-between gap-4 p-6 text-left hover:bg-surface-container-low md:flex-row md:items-center"
                  aria-expanded={open[review.id]}
                  onClick={() => toggle(review.id)}
                >
                  <span className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${review.indexClass}`}>
                      {review.index}
                    </span>
                    <span className="space-y-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge tone="secondary" className="uppercase">{review.tag}</Badge>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${review.verdictClass}`}>
                          {review.verdict}
                        </span>
                      </span>
                      <span className="block text-base font-bold sm:text-lg">{review.title}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="hidden text-xs font-semibold text-secondary sm:inline">Time Taken: {review.time}</span>
                    <Icon name={open[review.id] ? "expand_less" : "expand_circle_down"} className="text-xl text-primary" />
                  </span>
                </button>
                {open[review.id] && <div className="px-6 pt-2 pb-6">{review.body}</div>}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4 pt-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Personalized Growth Roadmap</h2>
            <p className="text-sm text-on-surface-variant">Drills picked from the gaps in this mock.</p>
          </div>
          <BentoGrid className="md:grid-cols-2">
            <BentoGridItem className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge tone="secondary" className="uppercase">Targeted Drill #1</Badge>
                  <span className="flex items-center gap-1 text-xs font-bold text-primary">
                    <Icon name="bolt" className="text-sm" /> High Impact
                  </span>
                </div>
                <h3 className="text-lg font-bold">Concurrency & Thread Safety in Java</h3>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Atomic updates, virtual-thread scheduling, and isolation levels for senior concurrency questions.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["ReentrantLock", "Deadlock Prevention", "Virtual Threads"].map((chip) => (
                    <Badge key={chip} tone="muted">{chip}</Badge>
                  ))}
                </div>
              </div>
              <PillButton href="/topics" tone="surface" className="w-full justify-between">
                Start 15m Interactive Drill
                <Icon name="arrow_forward" />
              </PillButton>
            </BentoGridItem>
            <BentoGridItem className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge tone="tertiary" className="uppercase">Targeted Drill #2</Badge>
                  <span className="flex items-center gap-1 text-xs font-bold text-tertiary">
                    <Icon name="star" className="text-sm" /> System Design
                  </span>
                </div>
                <h3 className="text-lg font-bold">Distributed Caching Strategies</h3>
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Invalidation across regions, write-through versus write-behind, and stampede control.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Redis Cluster", "Consistent Hashing", "Cache Warming"].map((chip) => (
                    <Badge key={chip} tone="muted">{chip}</Badge>
                  ))}
                </div>
              </div>
              <PillButton href="/topics" tone="sky" className="w-full justify-between text-tertiary">
                Launch Whiteboard Simulation
                <Icon name="arrow_forward" />
              </PillButton>
            </BentoGridItem>
          </BentoGrid>
        </section>

        <div className="flex flex-col items-center justify-between gap-6 rounded-card bg-surface-container-lowest p-8 shadow-primary-lg md:flex-row">
          <div className="space-y-1.5 text-center md:text-left">
            <Badge>
              <Icon name="workspace_premium" className="text-sm" />
              Preview scorecard
            </Badge>
            <h3 className="text-xl font-black sm:text-2xl">Ready to refine your answers or run it again?</h3>
            <p className="max-w-lg text-sm text-on-surface-variant">
              Scores on this page are sample data. Retake starts a new topic setup.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <PillButton
              tone="ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  showToast("Scorecard link copied.");
                } catch {
                  showToast("Copy failed. Select the address bar.");
                }
              }}
            >
              <Icon name="share" className="text-sm text-secondary" />
              Share Scorecard
            </PillButton>
            <PillButton
              tone="fixed"
              onClick={() => showToast("PDF export arrives with live evaluation.")}
            >
              <Icon name="download" className="text-sm" />
              Download PDF Report
            </PillButton>
            <PillButton href="/topics">
              <Icon name="refresh" className="text-sm" />
              Retake Mock Interview
            </PillButton>
          </div>
        </div>
      </div>
      {toast && (
        <div
          role="status"
          className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-full bg-inverse-surface px-5 py-3 text-inverse-on-surface shadow-primary-lg"
        >
          <Icon name="check_circle" filled className="text-lg text-primary" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}
    </div>
  );
}
