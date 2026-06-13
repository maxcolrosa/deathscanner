"use client";

import { useRef } from "react";
import { Tabs } from "@base-ui/react/tabs";
import type { GuideDoc } from "@/lib/guide/schema";
import type { DeepscanQuestion } from "@/lib/deepscan/questions";
import { GUIDE_TABS } from "@/lib/guide/guide-tabs";
import { useGuideTab } from "@/components/guide/use-guide-tab";
import {
  GuideHeader,
  DeepscanPanel,
  StartHerePanel,
  TrainPanel,
  EatPanel,
  RecoverPanel,
  ReferencePanel,
  TabNav,
} from "@/components/guide/guide-panels";

/* ─── Design constants ───────────────────────────────────────────────────── */
// DESIGN_VARIANCE: 8 | MOTION_INTENSITY: 6 (CSS cubic-bezier cascades)
// VISUAL_DENSITY: 4 | Monitor palette only. No new themes, no light mode.

/* ─── Main component ─────────────────────────────────────────────────────── */

export function GuideView({
  guide,
  token,
  deepscanQuestions,
}: {
  guide: GuideDoc;
  token: string;
  deepscanQuestions: DeepscanQuestion[];
}) {
  const [active, setActive] = useGuideTab();
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});

  // Switch tab, then bring the tab bar and the freshly-active tab into view.
  const navigate = (id: string) => {
    setActive(id);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    listRef.current?.scrollIntoView({ block: "start", behavior });
    tabRefs.current[id]?.scrollIntoView({ inline: "center", block: "nearest" });
  };

  return (
    <>
      {/* Keyframe injection: fixed pseudo-element, never repaints on scroll */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes accentPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>

      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-5 sm:px-6 pt-20 pb-32">
        <GuideHeader guide={guide} token={token} />

        <Tabs.Root value={active} onValueChange={(v) => navigate(String(v))}>
          {/* Sticky numbered tab bar. Backed so scrolled content does not show
              through; mobile scrolls horizontally with the active tab centered. */}
          <Tabs.List
            ref={listRef}
            className="sticky top-0 z-20 -mx-5 sm:-mx-6 mb-2 flex items-stretch gap-1 overflow-x-auto border-b border-monitor-line bg-monitor-bg/95 px-5 sm:px-6 backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {GUIDE_TABS.map((t, i) => (
              <Tabs.Tab
                key={t.id}
                value={t.id}
                ref={(el: HTMLElement | null) => {
                  tabRefs.current[t.id] = el;
                }}
                className="group relative flex shrink-0 snap-start items-center gap-2 whitespace-nowrap px-3 py-3.5 text-sm font-medium text-monitor-muted transition-colors duration-200 outline-none hover:text-monitor-fg focus-visible:text-monitor-fg focus-visible:ring-1 focus-visible:ring-monitor-accent/50 rounded-sm data-[active]:text-monitor-accent"
              >
                <span className="font-mono text-[11px] tabular-nums text-monitor-muted/50 transition-colors duration-200 group-hover:text-monitor-muted group-data-[active]:text-monitor-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {t.label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator className="pointer-events-none absolute bottom-0 left-0 h-px w-[calc(var(--active-tab-width)*1px)] translate-x-[calc(var(--active-tab-left)*1px)] bg-monitor-accent transition-[width,transform] duration-300 ease-out motion-reduce:transition-none" />
          </Tabs.List>

          <Tabs.Panel value="deepscan" keepMounted className="pt-10">
            <DeepscanPanel
              token={token}
              questions={deepscanQuestions}
              initial={guide.deepscan ?? null}
            />
            <TabNav currentId="deepscan" onNavigate={navigate} />
          </Tabs.Panel>
          <Tabs.Panel value="start" keepMounted className="pt-10">
            <StartHerePanel guide={guide} />
            <TabNav currentId="start" onNavigate={navigate} />
          </Tabs.Panel>
          <Tabs.Panel value="train" keepMounted className="pt-10">
            <TrainPanel guide={guide} />
            <TabNav currentId="train" onNavigate={navigate} />
          </Tabs.Panel>
          <Tabs.Panel value="eat" keepMounted className="pt-10">
            <EatPanel guide={guide} />
            <TabNav currentId="eat" onNavigate={navigate} />
          </Tabs.Panel>
          <Tabs.Panel value="recover" keepMounted className="pt-10">
            <RecoverPanel guide={guide} />
            <TabNav currentId="recover" onNavigate={navigate} />
          </Tabs.Panel>
          <Tabs.Panel value="reference" keepMounted className="pt-10">
            <ReferencePanel guide={guide} />
            <div className="flex flex-col gap-4 border-t border-monitor-line pt-10">
              <div className="h-px w-6 bg-monitor-accent/40" />
              <p className="text-base leading-relaxed text-monitor-fg max-w-[58ch]">{guide.closing}</p>
            </div>
          </Tabs.Panel>
        </Tabs.Root>
      </main>
    </>
  );
}
