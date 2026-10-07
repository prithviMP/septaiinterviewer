"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewDraft } from "@/components/providers";
import { NeedsSession } from "@/components/shell/needs-session";
import {
  AnimatedModal,
  ModalBody,
  ModalClose,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { PillButton } from "@/components/ui/pill-button";
import {
  ApiError,
  listQuestions,
  requestHint,
  submitSession,
  type InterviewQuestion,
} from "@/lib/api";
import { depthById, languages } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type LanguageId = "python" | "javascript" | "java";

const fileNames: Record<LanguageId, string> = {
  python: "solution.py",
  javascript: "solution.js",
  java: "Solution.java",
};

const rubric = [
  { title: "Accuracy", detail: "Does the answer solve the prompt?" },
  { title: "Completeness", detail: "Edges, constraints, and trade-offs." },
  { title: "Clarity", detail: "Can a reviewer follow the reasoning?" },
];

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function starterFor(question: InterviewQuestion, language: LanguageId) {
  return question.starters[language] ?? "";
}

function SessionBar({
  index,
  total,
  question,
  seconds,
  paused,
  onTogglePause,
}: {
  index: number;
  total: number;
  question: InterviewQuestion;
  seconds: number;
  paused: boolean;
  onTogglePause: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-card bg-surface-container-low p-4 shadow-sm sm:p-5">
      <div className="relative z-10 flex flex-col items-center justify-between gap-4 lg:flex-row">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-1.5 shadow-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-sm font-bold">
              Question {index + 1} of {total}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5">
            {Array.from({ length: total }, (_, step) => {
              if (step < index) {
                return (
                  <span
                    key={step}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-primary"
                    title={`Question ${step + 1} done`}
                  >
                    <Icon name="check" className="text-xs" />
                  </span>
                );
              }
              if (step === index) {
                return (
                  <span
                    key={step}
                    className="flex h-7 w-7 scale-110 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container shadow-primary"
                  >
                    {step + 1}
                  </span>
                );
              }
              return <span key={step} className="h-3.5 w-3.5 rounded-full bg-surface-dim opacity-70" />;
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge tone="secondary">
            <Icon name="code_blocks" className="text-sm text-secondary" />
            {question.topic}
          </Badge>
          <Badge tone="tertiary">
            <span className="h-2 w-2 rounded-full bg-tertiary" />
            {question.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 shadow-secondary">
            <Icon name="timer" className="text-primary" />
            <span className="text-sm font-bold tracking-wider">{formatTime(seconds)}</span>
            <span className="text-xs font-medium text-on-surface-variant">remaining</span>
          </div>
          <button
            type="button"
            aria-label={paused ? "Resume interview" : "Pause interview"}
            onClick={onTogglePause}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-on-surface-variant shadow-sm hover:text-primary"
          >
            <Icon name={paused ? "play_arrow" : "pause"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CodePad({
  question,
  language,
  code,
  notes,
  casesOpen,
  onLanguage,
  onCode,
  onNotes,
  onReset,
}: {
  question: InterviewQuestion;
  language: LanguageId;
  code: string;
  notes: string;
  casesOpen: boolean;
  onLanguage: (language: LanguageId) => void;
  onCode: (code: string) => void;
  onNotes: (notes: string) => void;
  onReset: () => void;
}) {
  const lines = Math.max(code.split("\n").length, 8);

  return (
    <div className="space-y-4 rounded-card bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
          Language:
          <select
            value={language}
            onChange={(event) => onLanguage(event.target.value as LanguageId)}
            className="min-h-11 rounded-full bg-surface-container-high px-4 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {languages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-[11px] text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-tertiary" />
            {code.length} characters
            <span className="font-semibold text-secondary">Autosaved</span>
          </span>
          <button
            type="button"
            aria-label="Reset code"
            onClick={onReset}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:text-primary"
          >
            <Icon name="restart_alt" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-sheet bg-surface-container-low p-3 font-mono text-xs shadow-inner">
        <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-error" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary-container" />
            <span className="h-2.5 w-2.5 rounded-full bg-tertiary" />
            <span className="ml-2 font-semibold text-secondary">{fileNames[language]}</span>
          </div>
          <span className="font-bold text-primary">UTF-8</span>
        </div>
        <div className="flex gap-3">
          <div className="w-6 select-none pr-2 text-right text-outline/70" aria-hidden>
            {Array.from({ length: lines }, (_, line) => (
              <div key={line}>{String(line + 1).padStart(2, "0")}</div>
            ))}
          </div>
          <label className="sr-only" htmlFor="code-editor">
            Answer code
          </label>
          <textarea
            id="code-editor"
            value={code}
            onChange={(event) => onCode(event.target.value)}
            spellCheck={false}
            rows={14}
            className="min-h-56 w-full resize-y bg-transparent font-mono text-xs leading-relaxed text-on-surface focus:outline-none"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="thought-process" className="flex items-center gap-1.5 text-xs font-bold">
            <Icon name="psychology" className="text-sm text-primary" />
            Candidate Thought Process & Complexity Notes
          </label>
          <span className="text-[11px] font-semibold text-secondary">Notes stay with this answer</span>
        </div>
        <textarea
          id="thought-process"
          value={notes}
          onChange={(event) => onNotes(event.target.value)}
          rows={3}
          placeholder="Explain the choice. Example: sliding window with an index map, O(N) time, O(min(N, M)) space."
          className="w-full resize-y rounded-sheet bg-surface-container-low p-3 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        />
      </div>
      {casesOpen && (
        <div className="space-y-2 rounded-sheet bg-surface-container p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-secondary uppercase">
              <Icon name="data_object" className="text-sm text-tertiary" />
              Sample cases
            </span>
            <Badge tone="tertiary">Examples</Badge>
          </div>
          {question.examples.length === 0 ? (
            <p className="text-on-surface-variant">This question has no sample cases.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 font-mono sm:grid-cols-2">
              {question.examples.map((example) => (
                <div key={`${example.title}-${example.input}`} className="space-y-1 rounded bg-surface-container-lowest p-2">
                  <span className="font-sans text-[11px] font-bold text-secondary">{example.title}</span>
                  <div>Input: {example.input}</div>
                  <div>
                    Output: <span className="font-bold text-primary">{example.output}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function InterviewSession() {
  const router = useRouter();
  const { draft, ready } = useInterviewDraft();
  const depth = depthById(draft.depth);
  const [sessionQuestions, setSessionQuestions] = useState<InterviewQuestion[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(depth.minutes * 60);
  const [language, setLanguage] = useState<LanguageId>("python");
  const [answers, setAnswers] = useState<Record<string, { code: string; notes: string }>>({});
  const [rubricOpen, setRubricOpen] = useState(true);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [hintText, setHintText] = useState("");
  const [hintStatus, setHintStatus] = useState("");
  const [casesOpen, setCasesOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!ready || !draft.sessionId) return;
    let cancelled = false;
    setLoadError("");
    setSessionQuestions(null);
    listQuestions(draft.sessionId)
      .then((body) => {
        if (!cancelled) setSessionQuestions(body.questions);
      })
      .catch((caught) => {
        if (!cancelled) {
          setLoadError(caught instanceof ApiError ? caught.message : "Could not load the questions.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ready, draft.sessionId]);

  useEffect(() => {
    setSeconds(depth.minutes * 60);
  }, [depth.minutes]);

  useEffect(() => {
    if (paused || !sessionQuestions) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => (value <= 0 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paused, sessionQuestions]);

  if (!ready) {
    return <p className="px-6 py-24 text-center text-sm font-semibold text-secondary">Loading session…</p>;
  }

  if (!draft.sessionId) {
    return (
      <NeedsSession
        title="No interview is open"
        detail="Start from topic setup so Gemini can write the questions for this session."
      />
    );
  }

  if (loadError) {
    return (
      <NeedsSession
        title="Questions did not load"
        detail={loadError}
      />
    );
  }

  if (!sessionQuestions) {
    return <p className="px-6 py-24 text-center text-sm font-semibold text-secondary">Loading your questions…</p>;
  }

  if (sessionQuestions.length === 0) {
    return (
      <NeedsSession
        title="This session has no questions"
        detail="Go back to topic setup and start a new interview."
      />
    );
  }

  const question = sessionQuestions[Math.min(index, sessionQuestions.length - 1)];
  const stored = answers[question.id];
  const code = stored?.code ?? starterFor(question, language);
  const notes = stored?.notes ?? "";
  const progress = Math.round((index / sessionQuestions.length) * 100);
  const last = index >= sessionQuestions.length - 1;

  function save(next: { code?: string; notes?: string }) {
    setAnswers((current) => ({
      ...current,
      [question.id]: {
        code: next.code ?? code,
        notes: next.notes ?? notes,
      },
    }));
  }

  function changeLanguage(next: LanguageId) {
    const previousStarter = starterFor(question, language);
    setLanguage(next);
    setAnswers((current) => {
      const existing = current[question.id];
      const untouched = !existing || existing.code === previousStarter;
      return {
        ...current,
        [question.id]: {
          code: untouched ? starterFor(question, next) : existing.code,
          notes: existing?.notes ?? "",
        },
      };
    });
  }

  function openHint() {
    if (!draft.sessionId || hintsLeft === 0) return;
    setHintText("");
    setHintStatus("Writing a nudge…");
    requestHint(draft.sessionId, question.id)
      .then((body) => {
        setHintText(body.hint);
        setHintStatus("");
      })
      .catch((caught) => {
        setHintStatus(caught instanceof ApiError ? caught.message : "Could not load a hint.");
      });
  }

  async function finish() {
    if (!draft.sessionId || !sessionQuestions) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitSession(
        draft.sessionId,
        sessionQuestions.map((item) => {
          const saved = answers[item.id];
          const answerCode = saved?.code ?? starterFor(item, language);
          const answerNotes = saved?.notes ?? "";
          return {
            question_id: item.id,
            response: `Code:\n${answerCode}\n\nNotes:\n${answerNotes}`,
          };
        }),
      );
      router.push("/scorecard");
    } catch (caught) {
      setSubmitError(caught instanceof ApiError ? caught.message : "Could not score the interview.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-28 sm:px-6 lg:px-8">
      <SessionBar
        index={index}
        total={sessionQuestions.length}
        question={question}
        seconds={seconds}
        paused={paused}
        onTogglePause={() => setPaused((value) => !value)}
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <article className="space-y-5 rounded-card bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold tracking-wider text-secondary uppercase">{question.topic}</p>
                <h1 className="text-xl leading-tight font-bold">{question.title}</h1>
              </div>
              <button
                type="button"
                aria-label="Bookmark question"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-secondary"
              >
                <Icon name="bookmark_border" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-on-surface-variant">{question.question_text}</p>
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wider uppercase">Constraints & Invariants</p>
              <ul className="space-y-1.5 rounded-sheet bg-surface-container-low p-3.5 font-mono text-xs text-on-surface-variant">
                {question.constraints.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold tracking-wider uppercase">Test Cases & Examples</p>
              {question.examples.map((example) => (
                <div key={example.title} className="space-y-1.5 rounded-sheet bg-surface-container-low p-3.5 text-xs">
                  <div className="font-bold text-secondary">{example.title}</div>
                  <div className="space-y-0.5 rounded bg-surface-container-lowest p-2 font-mono">
                    <div>Input: {example.input}</div>
                    <div>
                      Output: <strong className="text-primary">{example.output}</strong>
                    </div>
                    {example.explanation && (
                      <p className="pt-1 font-sans text-[11px] text-on-surface-variant">{example.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="space-y-3 rounded-card bg-surface-container p-4">
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between text-left"
              aria-expanded={rubricOpen}
              onClick={() => setRubricOpen((value) => !value)}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
                  <Icon name="award_star" className="text-sm" />
                </span>
                <span>
                  <span className="block text-xs font-bold">Gemini Evaluation Rubric</span>
                  <span className="text-[11px] text-on-surface-variant">{rubric.length} core metrics for this question</span>
                </span>
              </span>
              <Icon name={rubricOpen ? "expand_less" : "expand_more"} className="text-secondary" />
            </button>
            {rubricOpen && (
              <AnimatedTooltip
                items={rubric.map((item) => ({
                  id: item.title,
                  name: item.title,
                  designation: item.detail,
                }))}
              />
            )}
          </div>

          <AnimatedModal>
            <ModalTrigger
              onOpen={openHint}
              className={cn(
                "motion-pop inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary-fixed px-5 py-3 text-xs font-bold text-on-secondary-fixed shadow-secondary motion-safe:hover:scale-[1.02]",
                hintsLeft === 0 && "pointer-events-none opacity-45",
              )}
            >
              <Icon name="lightbulb" className="text-secondary" />
              Request AI Hint
              <span className="rounded-full bg-surface px-2 py-0.5 font-mono text-[10px] font-extrabold text-secondary">
                {hintsLeft} Left
              </span>
            </ModalTrigger>
            <ModalBody title="AI hint">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Icon name="tips_and_updates" className="text-sm" />
                  Hint {3 - hintsLeft} of 2
                </span>
                <ModalClose className="flex h-11 w-11 items-center justify-center rounded-full" label="Close hint">
                  <Icon name="close" />
                </ModalClose>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{hintText || hintStatus || "Writing a nudge…"}</p>
              <ModalClose
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-xs font-bold text-on-tertiary-fixed"
                onClose={() => {
                  if (hintText) setHintsLeft((value) => Math.max(0, value - 1));
                }}
              >
                Use this hint
              </ModalClose>
            </ModalBody>
          </AnimatedModal>

          <div className="flex items-center justify-between gap-4 rounded-card bg-surface-container-lowest p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                <path
                  className="text-surface-container"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${progress}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div>
                <div className="text-xs font-bold">Session Completion</div>
                <div className="text-[11px] text-on-surface-variant">
                  {index} of {sessionQuestions.length} questions addressed
                </div>
              </div>
            </div>
            <span className="text-sm font-extrabold text-primary">{progress}% Complete</span>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-7">
          <CodePad
            question={question}
            language={language}
            code={code}
            notes={notes}
            casesOpen={casesOpen}
            onLanguage={changeLanguage}
            onCode={(value) => save({ code: value })}
            onNotes={(value) => save({ notes: value })}
            onReset={() => save({ code: starterFor(question, language) })}
          />
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <PillButton tone="ghost" disabled={index === 0 || submitting} onClick={() => setIndex((value) => value - 1)}>
                <Icon name="arrow_back" className="text-sm" />
                Previous
              </PillButton>
              <PillButton tone="sky" onClick={() => setCasesOpen(true)}>
                <Icon name="visibility" className="text-sm text-tertiary" />
                Show sample cases
              </PillButton>
            </div>
            <PillButton
              className="w-full shadow-primary-lg sm:w-auto"
              disabled={submitting}
              onClick={() => {
                if (last) void finish();
                else setIndex((value) => value + 1);
              }}
            >
              {submitting ? "Scoring your answers…" : last ? "Submit Interview" : "Submit & Next Question"}
              {!submitting && <Icon name="arrow_forward" />}
            </PillButton>
          </div>
          {submitting && (
            <p className="text-center text-xs font-semibold text-secondary sm:text-right">Scoring your answers…</p>
          )}
          {submitError && <p className="text-center text-xs font-semibold text-error sm:text-right">{submitError}</p>}
        </div>
      </div>

      <div className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-3">
        {coachOpen && (
          <div className="hidden max-w-xs space-y-1 rounded-card bg-surface-container-lowest p-3.5 shadow-primary-lg sm:block">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Coach Gemini
              </span>
              <button type="button" aria-label="Dismiss coach note" onClick={() => setCoachOpen(false)} className="flex h-11 w-11 items-center justify-center">
                <Icon name="close" className="text-sm" />
              </button>
            </div>
            <p className="text-xs leading-snug">
              Talk through why you chose that structure. The scorecard weighs the trade-off next to the syntax.
            </p>
          </div>
        )}
        <button
          type="button"
          aria-label="AI Coach Assistant"
          onClick={() => setCoachOpen((value) => !value)}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-primary-lg motion-safe:hover:scale-105"
        >
          <Icon name="smart_toy" className="text-3xl" filled />
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-tertiary ring-2 ring-surface" />
        </button>
      </div>
    </div>
  );
}
