import { Disclaimer } from "@/components/disclaimer";

export function SiteFooter() {
  return (
    <footer className="border-t border-monitor-line px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <span className="font-mono text-sm tracking-tight text-monitor-fg">
          LONGEVITY SCAN
        </span>
        <Disclaimer className="max-w-[65ch]" />
      </div>
    </footer>
  );
}
