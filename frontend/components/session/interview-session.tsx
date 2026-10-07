"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviewDraft } from "@/components/providers";
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
import { depthById, languages, questions, type Question } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
  question: Question;
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
  testsOpen,
  onLanguage,
  onCode,
  onNotes,
  onReset,
}: {
  question: Question;
  language: string;
  code: string;
  notes: string;
  testsOpen: boolean;
  onLanguage: (language: string) => void;
  onCode: (code: string) => void;
  onNotes: (notes: string) => void;
  onReset: () => void;
}) {
  const file = question.files[language] ?? Object.values(question.files)[0];
  const lines = Math.max(code.split("\n").length, 8);

  return (
    <div className="space-y-4 rounded-card bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
          Language:
          <select
            value={language}
            onChange={(event) => onLanguage(event.target.value)}
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
            <span className="ml-2 font-semibold text-secondary">{file.name}</span>
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
          <span className="text-[11px] font-semibold text-secondary">Notes stay on this device</span>
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
      {testsOpen && (
        <div className="space-y-2 rounded-sheet bg-surface-container p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-secondary uppercase">
              <Icon name="check_circle" className="text-sm text-tertiary" />
              Sample Test Runner
            </span>
            <Badge tone="tertiary">Passed {question.tests.length}/{question.tests.length} Cases</Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 font-mono sm:grid-cols-3">
            {question.tests.map((test) => (
              <div key={test.input} className="flex items-center justify-between rounded bg-surface-container-lowest p-2">
                <span>{test.input}</span>
                <span className="font-bold text-primary">{test.output}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewSession() {
  const router = useRouter();
  const { draft } = useInterviewDraft();
  const depth = depthById(draft.depth);
  const sessionQuestions = useMemo(() => questions.slice(0, depth.questions), [depth.questions]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(depth.minutes * 60);
  const [language, setLanguage] = useState("python");
  const [answers, setAnswers] = useState<Record<string, { code: string; notes: string }>>({});
  const [rubricOpen, setRubricOpen] = useState(true);
  const [hintsLeft, setHintsLeft] = useState(2);
  const [testsOpen, setTestsOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(true);

  const question = sessionQuestions[Math.min(index, sessionQuestions.length - 1)];
  const stored = answers[question.id];
  const code = stored?.code ?? question.files[language]?.code ?? Object.values(question.files)[0].code;
  const notes = stored?.notes ?? "";
  const progress = Math.round((index / sessionQuestions.length) * 100);

  useEffect(() => {
    setSeconds(depth.minutes * 60);
    setIndex(0);
  }, [depth.minutes, depth.questions]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => (value <= 0 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paused]);

  function save(next: { code?: string; notes?: string }) {
    setAnswers((current) => ({
      ...current,
      [question.id]: {
        code: next.code ?? code,
        notes: next.notes ?? notes,
      },
    }));
  }

  function changeLanguage(next: string) {
    const previousStarter = question.files[language]?.code ?? "";
    setLanguage(next);
    setAnswers((current) => {
      const existing = current[question.id];
      const untouched = !existing || existing.code === previousStarter;
      return {
        ...current,
        [question.id]: {
          code: untouched ? (question.files[next]?.code ?? "") : existing.code,
          notes: existing?.notes ?? "",
        },
      };
    });
  }

  const last = index >= sessionQuestions.length - 1;

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
                <p className="text-[11px] font-extrabold tracking-wider text-secondary uppercase">{question.eyebrow}</p>
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
            <p className="text-sm leading-relaxed text-on-surface-variant">{question.prompt}</p>
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
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="font-bold text-secondary">{example.title}</span>
                    <span className="font-mono text-[11px] text-tertiary">{example.tag}</span>
                  </div>
                  <div className="space-y-0.5 rounded bg-surface-container-lowest p-2 font-mono">
                    <div>Input: {example.input}</div>
                    <div>
                      Output: <strong className="text-primary">{example.output}</strong>
                    </div>
                    <p className="pt-1 font-sans text-[11px] text-on-surface-variant">{example.explanation}</p>
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
                  <span className="text-[11px] text-on-surface-variant">{question.rubric.length} core metrics for this question</span>
                </span>
              </span>
              <Icon name={rubricOpen ? "expand_less" : "expand_more"} className="text-secondary" />
            </button>
            {rubricOpen && (
              <AnimatedTooltip
                items={question.rubric.map((item) => ({
                  id: item.title,
                  name: item.title,
                  designation: item.detail,
                }))}
              />
            )}
          </div>

          <AnimatedModal>
            <ModalTrigger
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
              <p className="mt-2 text-sm leading-relaxed">{question.hint}</p>
              <ModalClose
                className="mt-4 inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-xs font-bold text-on-tertiary-fixed"
                onClose={() => setHintsLeft((value) => Math.max(0, value - 1))}
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
            testsOpen={testsOpen}
            onLanguage={changeLanguage}
            onCode={(value) => save({ code: value })}
            onNotes={(value) => save({ notes: value })}
            onReset={() => save({ code: question.files[language]?.code ?? "" })}
          />
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <PillButton tone="ghost" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
                <Icon name="arrow_back" className="text-sm" />
                Previous
              </PillButton>
              <PillButton tone="sky" onClick={() => setTestsOpen(true)}>
                <Icon name="play_arrow" className="text-sm text-tertiary" />
                Run Sample Tests
              </PillButton>
            </div>
            <PillButton
              className="w-full shadow-primary-lg sm:w-auto"
              onClick={() => {
                if (last) router.push("/scorecard");
                else setIndex((value) => value + 1);
              }}
            >
              {last ? "Submit Interview" : "Submit & Next Question"}
              <Icon name="arrow_forward" />
            </PillButton>
          </div>
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
