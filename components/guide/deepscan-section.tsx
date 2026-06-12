"use client";

// Post-purchase AI Deepscan: a full second assessment. Intro -> step-through
// wizard (one question at a time, like the main quiz) -> analyzing -> written
// report. Included with the purchase (no extra charge); one run per order,
// enforced server-side in lib/deepscan/actions.ts. Matches the guide-view
// design system (monitor palette, mono labels, rounded-xl panels).

import { useState } from "react";
import type { DeepscanQuestion } from "@/lib/deepscan/questions";
import type { DeepscanMarker, DeepscanRecord } from "@/lib/deepscan/schema";
import { runDeepscanAction } from "@/lib/deepscan/actions";

type DeepAnswers = Record<string, string | string[]>;

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-monitor-muted/70">
      {children}
    </span>
  );
}

const STATUS_STYLE: Record<DeepscanMarker["status"], string> = {
  optimal: "border-monitor-accent/40 bg-monitor-accent/[0.08] text-monitor-accent",
  watch: "border-monitor-line bg-monitor-line/30 text-monitor-fg",
  flag: "border-monitor-alert/40 bg-monitor-alert/[0.08] text-monitor-alert",
};

const STATUS_LABEL: Record<DeepscanMarker["status"], string> = {
  optimal: "Optimal",
  watch: "Watch",
  flag: "Flag",
};

function toggleMulti(
  question: DeepscanQuestion,
  selected: string[],
  value: string
): string[] {
  if (selected.includes(value)) return selected.filter((v) => v !== value);
  if (value === question.exclusiveValue) return [value];
  return [...selected.filter((v) => v !== question.exclusiveValue), value];
}

function CheckMark() {
  return (
    <svg
      aria-hidden
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 6.5l2.5 2.5L10 3" />
    </svg>
  );
}

/* ── Intro state ─────────────────────────────────────────────────────────── */

function IntroState({
  questions,
  sections,
  onBegin,
}: {
  questions: DeepscanQuestion[];
  sections: string[];
  onBegin: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 px-6 py-7 sm:px-8">
      <p className="max-w-[58ch] text-sm leading-relaxed text-monitor-muted">
        Your scan set the headline number. The Deepscan is the full workup:{" "}
        {questions.length} questions across {sections.length} systems, then the
        AI writes a marker-by-marker readout of your health, diet, and
        lifestyle, with concrete actions for each area. Takes about 3 minutes.
        One run, yours to keep.
      </p>

      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <span
            key={s}
            className="rounded border border-monitor-line bg-monitor-line/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-monitor-muted"
          >
            {s}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onBegin}
        className="inline-flex w-full items-center justify-center rounded-lg bg-monitor-accent px-7 py-3.5 text-sm font-semibold text-monitor-bg transition-all duration-200 hover:bg-monitor-accent/90 active:scale-[0.97] sm:w-fit"
      >
        Begin my Deepscan
      </button>
    </div>
  );
}

/* ── Wizard state ────────────────────────────────────────────────────────── */

function WizardStep({
  question,
  index,
  total,
  value,
  error,
  onChange,
  onBack,
  onNext,
  isLast,
}: {
  question: DeepscanQuestion;
  index: number;
  total: number;
  value: string | string[] | undefined;
  error: string | null;
  onChange: (value: string | string[]) => void;
  onBack: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const selected = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  const answered = selected.length > 0;
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div className="flex flex-col gap-6 px-6 py-7 sm:px-8">
      {/* Progress header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-[11px] text-monitor-muted">
          <span>
            MARKER {String(index + 1).padStart(2, "0")} / {total}
          </span>
          <span className="uppercase tracking-[0.14em] text-monitor-accent">
            {question.section}
          </span>
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-monitor-line"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-monitor-accent transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold tracking-tight text-monitor-fg">
          {question.prompt}
        </h3>
        {question.helper ? (
          <p className="font-mono text-xs leading-relaxed text-monitor-muted">
            {question.helper}
          </p>
        ) : null}
      </div>

      {/* Options */}
      <div
        role={question.multi ? "group" : "radiogroup"}
        aria-label={question.prompt}
        className="flex flex-col gap-2.5"
        data-deepscan-question
      >
        {question.options.map((option) => {
          const isOn = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role={question.multi ? "checkbox" : "radio"}
              aria-checked={isOn}
              onClick={() =>
                onChange(
                  question.multi
                    ? toggleMulti(question, selected, option.value)
                    : option.value
                )
              }
              className={[
                "flex cursor-pointer items-center gap-3 rounded-md border bg-monitor-bg/40 px-4 py-3 text-left text-sm text-monitor-fg",
                "transition-colors duration-200 active:scale-[0.99]",
                isOn
                  ? "border-monitor-accent bg-monitor-accent/[0.06]"
                  : "border-monitor-line hover:border-monitor-accent/60",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={[
                  "flex h-[16px] w-[16px] shrink-0 items-center justify-center border transition-colors",
                  question.multi ? "rounded-[4px]" : "rounded-full",
                  isOn
                    ? "border-monitor-accent bg-monitor-accent text-monitor-bg"
                    : "border-monitor-line text-transparent",
                ].join(" ")}
              >
                <CheckMark />
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="font-mono text-xs text-monitor-alert" role="alert">
          {error}
        </p>
      ) : null}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={index === 0}
          className="rounded-md px-3 py-2 text-sm text-monitor-muted transition-colors hover:text-monitor-fg disabled:opacity-30 disabled:hover:text-monitor-muted"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!answered}
          className="inline-flex items-center justify-center rounded-lg bg-monitor-accent px-6 py-2.5 text-sm font-semibold text-monitor-bg transition-all duration-200 hover:bg-monitor-accent/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLast ? "Run my Deepscan" : "Next"}
        </button>
      </div>
    </div>
  );
}

/* ── Analyzing state ─────────────────────────────────────────────────────── */

function AnalyzingState() {
  return (
    <div className="flex flex-col gap-4 px-6 py-8 sm:px-8" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="block h-1.5 w-1.5 animate-ping rounded-full bg-monitor-accent" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-monitor-accent">
          Deepscan running
        </span>
      </div>
      <p className="text-sm leading-relaxed text-monitor-muted">
        Reading your markers against your scan profile and writing your
        analysis. This usually takes under a minute. Keep this page open.
      </p>
      <div className="flex flex-col gap-2.5" aria-hidden>
        {[82, 64, 91, 47, 73].map((w, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-monitor-line/60"
            style={{ width: `${w}%`, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Report state ────────────────────────────────────────────────────────── */

function DeepscanReportView({ record }: { record: DeepscanRecord }) {
  const { report } = record;
  return (
    <div className="flex flex-col divide-y divide-monitor-line">
      {/* Summary */}
      <div className="flex flex-col gap-2 px-6 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="block h-1.5 w-1.5 rounded-full bg-monitor-accent" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-monitor-accent">
            Deepscan complete
          </span>
        </div>
        <p className="text-base leading-relaxed text-monitor-fg">{report.summary}</p>
      </div>

      {/* Markers table */}
      <div className="flex flex-col gap-3 px-6 py-6 sm:px-8">
        <SubLabel>Your markers</SubLabel>
        <ul className="flex flex-col divide-y divide-monitor-line rounded-xl border border-monitor-line overflow-hidden">
          {report.markers.map((m) => (
            <li key={m.name} className="flex flex-col gap-1.5 px-4 py-3.5 sm:px-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="text-sm font-semibold text-monitor-fg">{m.name}</span>
                <span className="font-mono text-[11px] text-monitor-muted">{m.band}</span>
                <span
                  className={[
                    "ml-auto inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                    STATUS_STYLE[m.status],
                  ].join(" ")}
                >
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-monitor-muted">{m.note}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Narrative sections, each with its own action list */}
      <div className="flex flex-col gap-6 px-6 py-6 sm:px-8">
        {report.sections.map((s) => (
          <div
            key={s.title}
            className="flex flex-col divide-y divide-monitor-line overflow-hidden rounded-xl border border-monitor-line"
          >
            <div className="flex flex-col gap-1.5 px-5 py-4">
              <SubLabel>{s.title}</SubLabel>
              <p className="text-sm leading-relaxed text-monitor-fg">{s.body}</p>
            </div>
            <div className="flex flex-col gap-2 bg-monitor-accent/[0.04] px-5 py-4">
              <SubLabel>Do this</SubLabel>
              <ul className="flex flex-col gap-2">
                {s.actions.map((a) => (
                  <li key={a} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-[3px] shrink-0 font-mono text-xs font-bold text-monitor-accent leading-none"
                    >
                      +
                    </span>
                    <span className="text-sm leading-relaxed text-monitor-fg">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Priorities */}
      <div className="flex flex-col gap-3 bg-monitor-accent/[0.04] px-6 py-6 sm:px-8">
        <SubLabel>Fix these first</SubLabel>
        <ol className="flex flex-col gap-2.5">
          {report.priorities.map((p, i) => (
            <li key={p} className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-monitor-accent tabular-nums mt-[2px] shrink-0 w-5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-relaxed text-monitor-fg">{p}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Disclaimer + provenance */}
      <div className="flex flex-col gap-1 px-6 py-4 sm:px-8">
        <p className="text-xs leading-relaxed text-monitor-muted/50">{report.disclaimer}</p>
        <p className="font-mono text-[10px] text-monitor-muted/40">
          Engine: {record.model}
        </p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function DeepscanSection({
  token,
  questions,
  initial,
}: {
  token: string;
  questions: DeepscanQuestion[];
  initial: DeepscanRecord | null;
}) {
  const [answers, setAnswers] = useState<DeepAnswers>({});
  const [record, setRecord] = useState<DeepscanRecord | null>(initial);
  const [phase, setPhase] = useState<"intro" | "wizard" | "running">("intro");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const sections: string[] = [];
  for (const q of questions) {
    if (!sections.includes(q.section)) sections.push(q.section);
  }

  async function submit(finalAnswers: DeepAnswers) {
    setPhase("running");
    setError(null);
    try {
      const res = await runDeepscanAction(token, finalAnswers);
      if (res.ok) {
        setRecord(res.deepscan);
      } else {
        setError(res.error);
        setPhase("wizard");
      }
    } catch {
      setError("Something went wrong running your Deepscan. Try again.");
      setPhase("wizard");
    }
  }

  function next() {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      void submit(answers);
    }
  }

  const question = questions[step];

  return (
    <section className="overflow-hidden rounded-xl border border-monitor-accent/40 bg-monitor-panel shadow-[inset_0_1px_0_rgba(46,230,201,0.08)]">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-monitor-accent/20 bg-monitor-accent/[0.04] px-6 py-3 sm:px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-monitor-accent">
          AI Deepscan
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-monitor-muted">
          Included with your purchase
        </span>
      </div>

      {record ? (
        <DeepscanReportView record={record} />
      ) : phase === "running" ? (
        <AnalyzingState />
      ) : phase === "intro" ? (
        <IntroState
          questions={questions}
          sections={sections}
          onBegin={() => setPhase("wizard")}
        />
      ) : (
        <WizardStep
          question={question}
          index={step}
          total={questions.length}
          value={answers[question.id]}
          error={error}
          onChange={(v) => setAnswers((a) => ({ ...a, [question.id]: v }))}
          onBack={() => setStep(Math.max(0, step - 1))}
          onNext={next}
          isLast={step === questions.length - 1}
        />
      )}
    </section>
  );
}
