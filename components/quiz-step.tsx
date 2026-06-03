"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { AnswerValue, QuizOption, QuizQuestion } from "@/lib/longevity";
import { toValues } from "@/lib/longevity";

interface QuizStepProps {
  question: QuizQuestion;
  index: number;
  total: number;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  onNext: () => void;
  onBack: () => void;
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

function nextMultiValue(
  options: QuizOption[],
  selected: string[],
  toggled: string
): string[] {
  const opt = options.find((o) => o.value === toggled);
  if (selected.includes(toggled)) {
    return selected.filter((v) => v !== toggled);
  }
  // Selecting an exclusive option ("None") clears the rest; selecting any other
  // option clears whatever exclusive option was set.
  if (opt?.exclusive) return [toggled];
  const withoutExclusive = selected.filter(
    (v) => !options.find((o) => o.value === v)?.exclusive
  );
  return [...withoutExclusive, toggled];
}

export function QuizStep({
  question,
  index,
  total,
  value,
  onChange,
  onNext,
  onBack,
}: QuizStepProps) {
  const progress = Math.round(((index + 1) / total) * 100);
  const selected = toValues(value);

  const ageValid =
    question.kind === "age" &&
    typeof value === "number" &&
    value >= (question.min ?? 0) &&
    value <= (question.max ?? 200);
  const singleChoiceValid =
    question.kind === "choice" && !question.multi && typeof value === "string";
  const multiChoiceValid =
    question.kind === "choice" && Boolean(question.multi) && selected.length >= 1;
  const canAdvance = ageValid || singleChoiceValid || multiChoiceValid;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-xs text-monitor-muted">
          <span>
            QUESTION {String(index + 1).padStart(2, "0")} / {total}
          </span>
          <span className="text-monitor-accent">SCANNING</span>
        </div>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-monitor-line"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-monitor-accent transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight text-monitor-fg">
          {question.prompt}
        </h2>
        {question.helper ? (
          <p className="font-mono text-sm text-monitor-muted">{question.helper}</p>
        ) : null}
      </div>

      {question.kind === "age" ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="age-input"
            className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-muted"
          >
            Age
          </label>
          <input
            id="age-input"
            type="number"
            inputMode="numeric"
            min={question.min}
            max={question.max}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-40 rounded-md border border-monitor-line bg-monitor-panel px-4 py-3 font-mono text-2xl text-monitor-fg outline-none focus:border-monitor-accent"
          />
          {typeof value === "number" && !ageValid ? (
            <p className="font-mono text-xs text-monitor-alert">
              Enter an age between {question.min} and {question.max}.
            </p>
          ) : null}
        </div>
      ) : question.multi ? (
        // Multi-select: checkbox-style buttons. Each selection is scored (or, for
        // unscored questions, personalizes the plan). aria-checked exposes state.
        <div role="group" aria-label={question.prompt} className="flex flex-col gap-3">
          {question.options!.map((option) => {
            const isOn = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="checkbox"
                aria-checked={isOn}
                onClick={() =>
                  onChange(nextMultiValue(question.options!, selected, option.value))
                }
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-md border bg-monitor-panel px-4 py-4 text-left text-monitor-fg",
                  "transition-colors duration-200 active:scale-[0.99]",
                  isOn
                    ? "border-monitor-accent bg-monitor-accent/[0.06]"
                    : "border-monitor-line hover:border-monitor-accent/60",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors",
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
      ) : (
        // base-ui RadioGroup: controlled via `value` + `onValueChange`.
        // RadioGroupItem renders a <span> with data-checked when selected;
        // we use has-[data-checked] on the wrapping label for the selected border.
        <RadioGroup
          value={typeof value === "string" ? value : ""}
          onValueChange={(v: string) => onChange(v)}
          className="flex flex-col gap-3"
        >
          {question.options!.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-monitor-line bg-monitor-panel px-4 py-4 text-monitor-fg transition-colors hover:border-monitor-accent/60 has-[data-checked]:border-monitor-accent"
            >
              <RadioGroupItem value={option.value} aria-label={option.label} />
              <span>{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={index === 0}
          className="text-monitor-muted hover:text-monitor-fg"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canAdvance}
          className="bg-monitor-accent text-monitor-bg hover:bg-monitor-accent/90"
        >
          {index === total - 1 ? "Run Scan" : "Next"}
        </Button>
      </div>
    </div>
  );
}
