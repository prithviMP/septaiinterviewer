"use client";

import { useEffect, useState } from "react";
import { useInterviewDraft } from "@/components/providers";
import { NeedsSession } from "@/components/shell/needs-session";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Icon } from "@/components/ui/icon";
import { PillButton } from "@/components/ui/pill-button";
import { ApiError, getEvaluation, type Evaluation } from "@/lib/api";
import { levelById } from "@/lib/mock-data";

const pillarStyle = [
  { icon: "code", iconWrap: "bg-primary-fixed text-primary", scoreClass: "text-primary", bar: "bg-primary" },
  { icon: "balance", iconWrap: "bg-secondary-fixed text-secondary", scoreClass: "text-secondary", bar: "bg-secondary" },
  { icon: "forum", iconWrap: "bg-tertiary-fixed text-tertiary", scoreClass: "text-tertiary", bar: "bg-tertiary" },
];

const indexClass = [
  "bg-primary-fixed text-primary",
  "bg-secondary-fixed text-secondary",
  "bg-tertiary-fixed text-tertiary",
];

function verdictClass(badge: string) {
  if (badge === "Excellent") return "bg-primary-fixed text-on-primary-fixed";
  if (badge === "Needs Work") return "bg-error-container text-on-error-container";
  return "bg-secondary-container text-on-secondary-container";
}

function labelFor(score: number) {
  if (score >= 8) return "Excellent";
  if (score >= 5) return "Good";
  return "Needs Work";
}

export function Scorecard() {
  const { draft, ready } = useInterviewDraft();
  const level = levelById(draft.level);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState("");
  const [missingSubmit, setMissingSubmit] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!ready || !draft.sessionId) return;
    let cancelled = false;
    setError("");
    setMissingSubmit(false);
    getEvaluation(draft.sessionId)
      .then((body) => {
        if (cancelled) return;
        setEvaluation(body);
        setOpen(Object.fromEntries(body.question_evaluations.map((item) => [item.question_id, true])));
      })
      .catch((caught) => {
        if (cancelled) return;
        if (caught instanceof ApiError && caught.status === 404) {
          setMissingSubmit(true);
          return;
        }
        setError(caught instanceof ApiError ? caught.message : "Could not load the scorecard.");
      });
    return () => {
      cancelled = true;
    };
  }, [ready, draft.sessionId]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  if (!ready) {
    return <p className="px-6 py-24 text-center text-sm font-semibold text-secondary">Loading scorecard…</p>;
  }

  if (!draft.sessionId) {
    return (
      <NeedsSession
        title="No scorecard yet"
        detail="Start an interview from topic setup. The scorecard appears after you submit."
      />
    );
  }

  if (missingSubmit) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Submit the interview first</h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          The scorecard loads after Gemini scores every answer.
        </p>
        <PillButton href="/session" className="mt-6">
          Back to the session
        </PillButton>
      </div>
    );
  }

  if (error) {
    return <NeedsSession title="Scorecard did not load" detail={error} />;
  }

  if (!evaluation) {
    return <p className="px-6 py-24 text-center text-sm font-semibold text-secondary">Scoring your answers…</p>;
  }

  const reviews = evaluation.question_evaluations;
  const allOpen = reviews.every((item) => open[item.question_id]);
  const gauge = 314.159 * (1 - Math.min(10, Math.max(0, evaluation.overall_score)) / 10);

  function toggle(id: string) {
    setOpen((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <div className="relative overflow-hidden px-6 py-8 pb-16 lg:px-12">
      <AmbientGlow />
      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3.5 py-1.5 text-xs font-bold tracking-wider text-secondary uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Evaluation dossier
              <span className="text-outline">•</span>
              <span className="font-medium text-on-surface-variant normal-case">Session {draft.sessionId.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
              {level.short} Technical Mock • Completed Session Report
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="tertiary" className="px-4 py-2 shadow-tertiary">
              <Icon name="verified" filled className="text-sm text-tertiary" />
              {reviews.length} Questions Evaluated
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
                  <Badge className="uppercase">{labelFor(evaluation.overall_score)}</Badge>
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
                    strokeDashoffset={gauge}
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tracking-tighter">{evaluation.overall_score.toFixed(1)}</span>
                  <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">out of 10</span>
                </div>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-lg leading-tight font-bold">{labelFor(evaluation.overall_score)}</p>
                <p className="max-w-xs text-xs leading-relaxed text-on-surface-variant">{evaluation.summary}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 text-xs text-on-surface-variant">
              <span>Interviewer: Gemini</span>
              <span className="font-bold text-secondary">{draft.topics.join(", ")}</span>
            </div>
          </BentoGridItem>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
            {evaluation.pillars.map((pillar, index) => {
              const style = pillarStyle[index % pillarStyle.length];
              return (
                <BentoGridItem key={pillar.name} className="flex flex-col justify-between motion-safe:hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${style.iconWrap}`}>
                      <Icon name={style.icon} />
                    </span>
                    <span className={`text-xl font-black ${style.scoreClass}`}>{pillar.score.toFixed(1)}</span>
                  </div>
                  <div className="my-4 space-y-1.5">
                    <p className="text-sm font-bold">{pillar.name}</p>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-container">
                      <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${Math.min(100, pillar.score * 10)}%` }} />
                    </div>
                  </div>
                  <p className="text-[11px] leading-normal text-on-surface-variant">{pillar.detail}</p>
                </BentoGridItem>
              );
            })}
          </div>
        </BentoGrid>

        <div className="flex flex-col items-start gap-4 rounded-card bg-secondary-container p-6 text-on-secondary-container shadow-secondary sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-secondary">
            <Icon name="neurology" filled className="text-2xl" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold tracking-wider text-secondary uppercase">Gemini Coach Synthesis</span>
            <p className="text-sm leading-relaxed">{evaluation.summary}</p>
          </div>
        </div>

        <section className="space-y-4 pt-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Question-by-Question Deep Dive</h2>
              <p className="text-sm text-on-surface-variant">Open a question to read your answer and the critique.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(Object.fromEntries(reviews.map((item) => [item.question_id, !allOpen])))}
              className="min-h-11 rounded-full bg-surface-container px-4 text-xs font-bold text-secondary"
            >
              {allOpen ? "Collapse All" : "Expand All"}
            </button>
          </div>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <article key={review.question_id} className="overflow-hidden rounded-card bg-surface-container-lowest shadow-card">
                <button
                  type="button"
                  className="flex w-full flex-col items-start justify-between gap-4 p-6 text-left hover:bg-surface-container-low md:flex-row md:items-center"
                  aria-expanded={Boolean(open[review.question_id])}
                  onClick={() => toggle(review.question_id)}
                >
                  <span className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${indexClass[index % indexClass.length]}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="space-y-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge tone="secondary" className="uppercase">{review.topic}</Badge>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${verdictClass(review.badge)}`}>
                          {review.score.toFixed(1)} / 10 • {review.badge}
                        </span>
                      </span>
                      <span className="block text-base font-bold sm:text-lg">{review.question_text}</span>
                    </span>
                  </span>
                  <Icon name={open[review.question_id] ? "expand_less" : "expand_circle_down"} className="text-xl text-primary" />
                </button>
                {open[review.question_id] && (
                  <div className="space-y-4 px-6 pt-2 pb-6">
                    <div className="space-y-2 rounded-card bg-surface-container-low p-4">
                      <p className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                        <Icon name="terminal" className="text-sm text-tertiary" />
                        Your answer
                      </p>
                      <pre className="overflow-x-auto rounded-sheet bg-surface-container-highest p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                        {review.user_response || "No answer stored."}
                      </pre>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2 rounded-card bg-primary-fixed/30 p-4">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-on-primary-fixed">
                          <Icon name="check_circle" filled className="text-primary" />
                          Key Strengths
                        </p>
                        <ul className="list-inside list-disc space-y-1 text-xs">
                          {review.feedback.key_strengths.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2 rounded-card bg-surface-container p-4">
                        <p className="flex items-center gap-1.5 text-xs font-bold text-secondary">
                          <Icon name="rocket_launch" />
                          Areas to Elevate
                        </p>
                        <ul className="list-inside list-disc space-y-1 text-xs">
                          {review.feedback.areas_for_improvement.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-2 rounded-card bg-tertiary-fixed/30 p-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-on-tertiary-fixed">
                        <Icon name="lightbulb" className="text-sm text-tertiary" />
                        Ideal answer
                      </span>
                      <p className="text-xs leading-relaxed">{review.feedback.ideal_answer_summary}</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {evaluation.drills.length > 0 && (
          <section className="space-y-4 pt-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Personalized Growth Roadmap</h2>
              <p className="text-sm text-on-surface-variant">Drills picked from the gaps in this mock.</p>
            </div>
            <BentoGrid className="md:grid-cols-2">
              {evaluation.drills.map((drill, index) => (
                <BentoGridItem key={drill.title} className="flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <Badge tone={index % 2 === 0 ? "secondary" : "tertiary"} className="uppercase">
                      Targeted Drill #{index + 1}
                    </Badge>
                    <h3 className="text-lg font-bold">{drill.title}</h3>
                    <p className="text-xs leading-relaxed text-on-surface-variant">{drill.detail}</p>
                    <div className="flex flex-wrap gap-2">
                      {drill.chips.map((chip) => (
                        <Badge key={chip} tone="muted">{chip}</Badge>
                      ))}
                    </div>
                  </div>
                  <PillButton href="/topics" tone={index % 2 === 0 ? "surface" : "sky"} className="w-full justify-between">
                    Practice this gap
                    <Icon name="arrow_forward" />
                  </PillButton>
                </BentoGridItem>
              ))}
            </BentoGrid>
          </section>
        )}

        <div className="flex flex-col items-center justify-between gap-6 rounded-card bg-surface-container-lowest p-8 shadow-primary-lg md:flex-row">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-xl font-black sm:text-2xl">Ready to refine your answers or run it again?</h3>
            <p className="max-w-lg text-sm text-on-surface-variant">Retake starts a new topic setup.</p>
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
            <PillButton tone="fixed" onClick={() => window.print()}>
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
