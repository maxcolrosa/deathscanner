"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/lib/longevity";

interface QuizStepProps {
  question: QuizQuestion;
  index: number;
  total: number;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  onNext: () => void;
  onBack: () => void;
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
  const progress = Math.round((index / total) * 100);

  const ageValid =
    question.kind === "age" &&
    typeof value === "number" &&
    value >= (question.min ?? 0) &&
    value <= (question.max ?? 200);
  const choiceValid = question.kind === "choice" && typeof value === "string";
  const canAdvance = ageValid || choiceValid;

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
              <RadioGroupItem value={option.value} />
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
