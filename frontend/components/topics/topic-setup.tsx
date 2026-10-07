"use client";

import { useRouter } from "next/navigation";
import { useInterviewDraft } from "@/components/providers";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { PillButton } from "@/components/ui/pill-button";
import { PillTabs } from "@/components/ui/tabs";
import { DepthCard } from "@/components/topics/depth-card";
import { FocusChip } from "@/components/topics/focus-chip";
import { TopicCard } from "@/components/topics/topic-card";
import { depthById, depths, focusOptions, levelById, levels, topics } from "@/lib/mock-data";

export function TopicSetup() {
  const router = useRouter();
  const { draft, setDraft } = useInterviewDraft();
  const depth = depthById(draft.depth);
  const level = levelById(draft.level);
  const canStart = draft.topics.length > 0;

  function toggleTopic(id: string) {
    setDraft((current) => ({
      ...current,
      topics: current.topics.includes(id)
        ? current.topics.filter((topic) => topic !== id)
        : [...current.topics, id],
    }));
  }

  function toggleFocus(id: string) {
    setDraft((current) => ({
      ...current,
      focuses: current.focuses.includes(id)
        ? current.focuses.filter((focus) => focus !== id)
        : [...current.focuses, id],
    }));
  }

  return (
    <div className="relative overflow-hidden px-6 pb-16 lg:px-12">
      <AmbientGlow />
      <div className="relative z-10 mx-auto max-w-7xl pt-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Badge tone="muted">
            <Icon name="tune" className="text-sm" />
            Step 01 of 03: Session Architect
          </Badge>
          <Badge tone="secondary">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            Gemini 1.5 Pro Calibrator Active
          </Badge>
        </div>

        <div className="relative mb-10 overflow-hidden rounded-panel bg-gradient-to-r from-surface-container-highest via-surface-container to-surface-container-low p-8 shadow-primary lg:p-10">
          <div className="relative z-10 max-w-2xl">
            <Badge className="mb-3 uppercase">
              <Icon name="magic_button" className="text-sm" />
              Personalized AI Sandbox
            </Badge>
            <h1 className="mb-3 text-3xl leading-tight font-black tracking-tight lg:text-4xl">
              Customize Your <span className="text-primary underline decoration-primary-container decoration-wavy decoration-2 underline-offset-4">Interview Session</span>
            </h1>
            <p className="text-base font-medium leading-relaxed text-on-surface-variant">
              Choose domains, calibrate difficulty, and launch your tailored mock with live notes and instant feedback.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <section className="space-y-6 rounded-panel bg-surface-container-lowest p-7 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary shadow-primary">1</span>
                  <div>
                    <h2 className="text-xl font-bold">Select Domains & Topics</h2>
                    <p className="text-xs font-medium text-on-surface-variant">Stack topics for cross-disciplinary questions.</p>
                  </div>
                </div>
                <Badge>{draft.topics.length} Selected</Badge>
              </div>
              <div className="space-y-3">
                <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-secondary uppercase">
                  <Icon name="terminal" /> Core Computer Science
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {topics.filter((topic) => topic.group === "core").map((topic) => (
                    <TopicCard
                      key={topic.id}
                      name={topic.name}
                      detail={topic.detail}
                      icon={topic.icon}
                      selected={draft.topics.includes(topic.id)}
                      onToggle={() => toggleTopic(topic.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <p className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-secondary uppercase">
                  <Icon name="code" /> Languages & Frameworks
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {topics.filter((topic) => topic.group === "lang").map((topic) => (
                    <TopicCard
                      key={topic.id}
                      name={topic.name}
                      detail={topic.detail}
                      icon={topic.icon}
                      compact
                      selected={draft.topics.includes(topic.id)}
                      onToggle={() => toggleTopic(topic.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-5 rounded-panel bg-surface-container-lowest p-7 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-on-secondary shadow-secondary">2</span>
                <div>
                  <h2 className="text-xl font-bold">Target Role & Experience Level</h2>
                  <p className="text-xs font-medium text-on-surface-variant">Sets prompt depth, code rigor, and how much ambiguity to expect.</p>
                </div>
              </div>
              <PillTabs
                layoutId="level-tabs"
                stretch
                className="bg-surface-container-low"
                activeClassName="bg-secondary shadow-secondary"
                value={draft.level}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, level: value as typeof current.level }))
                }
                tabs={levels.map((item) => ({
                  value: item.id,
                  title: (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Icon name={item.icon} />
                      {item.label}
                    </span>
                  ),
                }))}
              />
            </section>

            <section className="space-y-5 rounded-panel bg-surface-container-lowest p-7 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary text-sm font-bold text-on-tertiary shadow-tertiary">3</span>
                <div>
                  <h2 className="text-xl font-bold">Session Depth & Duration</h2>
                  <p className="text-xs font-medium text-on-surface-variant">Select your availability window and interview cadence.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {depths.map((item) => (
                  <DepthCard
                    key={item.id}
                    label={item.label}
                    minutes={item.minutes}
                    detail={item.detail}
                    popular={item.popular}
                    selected={draft.depth === item.id}
                    onSelect={() => setDraft((current) => ({ ...current, depth: item.id }))}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4 rounded-panel bg-surface-container-lowest p-7 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary shadow-primary">4</span>
                  <div>
                    <h2 className="text-xl font-bold">Gemini AI Evaluation Focus</h2>
                    <p className="text-xs font-medium text-on-surface-variant">Weights applied to the post-interview scorecard.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-secondary">Multimodal Real-Time</span>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                {focusOptions.map((focus) => (
                  <FocusChip
                    key={focus.id}
                    label={focus.id}
                    icon={focus.icon}
                    tone={focus.tone}
                    active={draft.focuses.includes(focus.id)}
                    onToggle={() => toggleFocus(focus.id)}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:col-span-4">
            <div className="relative overflow-hidden rounded-panel bg-surface-container-lowest p-7 shadow-primary-lg">
              <div className="flex items-center justify-between pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <Icon name="assignment_turned_in" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black">Session Blueprint</h3>
                    <span className="text-[11px] font-bold tracking-wider text-secondary uppercase">
                      {canStart ? "Ready to Generate" : "Pick a topic"}
                    </span>
                  </div>
                </div>
                <Badge tone="secondary">Live Sync</Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5 rounded-panel bg-surface-container-low p-3.5">
                  <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                    <span>Selected Focus Stack</span>
                    <span className="font-black text-primary">{draft.topics.length} Domains</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-sm font-bold">
                    {draft.topics.length === 0 && (
                      <span className="text-xs text-on-surface-variant">No topics selected.</span>
                    )}
                    {draft.topics.map((topic) => (
                      <Badge key={topic} tone={topic === "Java" || topic === "Spring Boot" ? "secondary" : "primary"}>
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 rounded-panel bg-surface-container-low p-3.5">
                    <span className="block text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Experience</span>
                    <span className="block text-sm font-bold text-secondary">{level.short}</span>
                    <span className="block text-[10px] text-on-surface-variant">{level.note}</span>
                  </div>
                  <div className="space-y-1 rounded-panel bg-surface-container-low p-3.5">
                    <span className="block text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Target Flow</span>
                    <span className="block text-sm font-bold text-tertiary">{depth.questions} Questions</span>
                    <span className="block text-[10px] text-on-surface-variant">~{depth.minutes} min session</span>
                  </div>
                </div>
                <div className="rounded-panel bg-surface-container-low p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">Gemini Multimodal Engine</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-tertiary">
                      <span className="h-1.5 w-1.5 rounded-full bg-tertiary" /> Low-Latency
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="relative h-12 w-12 shrink-0">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                        <circle className="stroke-surface-container-high" cx="18" cy="18" fill="none" r="14" strokeWidth="3.5" />
                        <circle
                          className="stroke-primary"
                          cx="18"
                          cy="18"
                          fill="none"
                          r="14"
                          strokeDasharray={`${canStart ? 88 : 8} 100`}
                          strokeLinecap="round"
                          strokeWidth="3.5"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
                        {canStart ? "88%" : "0%"}
                      </div>
                    </div>
                    <p className="text-xs leading-snug text-on-surface-variant">
                      <span className="block font-bold text-on-surface">{canStart ? "Calibration High" : "Waiting on topics"}</span>
                      Custom rubric synthesizes algorithmic and system trade-offs.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 mb-4 flex items-center justify-center gap-2 rounded-full bg-surface-container px-3 py-2 text-xs font-semibold text-on-surface-variant">
                <Icon name="schedule" className="text-sm text-tertiary" />
                Estimated Duration: <strong className="text-on-surface">{depth.minutes} Minutes</strong>
              </div>
              <PillButton
                className="w-full py-4 text-base shadow-primary-lg"
                disabled={!canStart}
                onClick={() => router.push("/session")}
              >
                Begin Interview Session
                <Icon name="arrow_forward" />
              </PillButton>
              {!canStart && (
                <p className="mt-3 text-center text-xs font-semibold text-error">Select at least one topic to begin.</p>
              )}
              <p className="mt-4 flex items-center justify-center gap-1 text-center text-[11px] text-on-surface-variant">
                <Icon name="headset_mic" className="text-xs text-primary" />
                Microphone and camera stay off in this preview.
              </p>
            </div>
            <div className="flex items-center gap-3.5 rounded-panel bg-gradient-to-br from-secondary-container/40 to-surface-container p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-on-secondary">
                <Icon name="tips_and_updates" />
              </span>
              <p className="text-xs leading-relaxed text-on-secondary-container">
                <span className="block font-bold">Interview Tip:</span>
                Speak your assumptions out loud. The scorecard weighs clarity next to correctness.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
