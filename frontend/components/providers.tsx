"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type LevelId = "junior" | "mid" | "senior";
export type DepthId = "sprint" | "standard" | "deep";

export type InterviewDraft = {
  topics: string[];
  level: LevelId;
  depth: DepthId;
  focuses: string[];
};

const STORAGE_KEY = "aic-interview-draft";

export const defaultDraft: InterviewDraft = {
  topics: ["DSA", "HLD", "Java"],
  level: "mid",
  depth: "standard",
  focuses: ["Technical Accuracy", "Edge Case Handling", "Big-O Complexity"],
};

type DraftContextValue = {
  draft: InterviewDraft;
  setDraft: (next: InterviewDraft | ((current: InterviewDraft) => InterviewDraft)) => void;
  ready: boolean;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function InterviewDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraftState] = useState<InterviewDraft>(defaultDraft);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as InterviewDraft;
        if (Array.isArray(parsed.topics) && parsed.level && parsed.depth && Array.isArray(parsed.focuses)) {
          setDraftState(parsed);
        }
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  const setDraft: DraftContextValue["setDraft"] = useCallback((next) => {
    setDraftState((current) => {
      const value = typeof next === "function" ? next(current) : next;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      return value;
    });
  }, []);

  const value = useMemo(() => ({ draft, setDraft, ready }), [draft, ready, setDraft]);

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useInterviewDraft() {
  const value = useContext(DraftContext);
  if (!value) throw new Error("useInterviewDraft must sit inside InterviewDraftProvider");
  return value;
}
