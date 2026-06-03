import Link from "next/link";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.18em] text-monitor-accent"
        >
          Longevity Scan
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight text-monitor-fg">
          {title}
        </h1>
        <p className="font-mono text-xs text-monitor-muted">Last updated 3 June 2026</p>
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-monitor-muted [&_a]:text-monitor-accent [&_h2]:mt-6 [&_h2]:font-mono [&_h2]:text-xs [&_h2]:uppercase [&_h2]:tracking-[0.18em] [&_h2]:text-monitor-fg [&_strong]:text-monitor-fg">
          {children}
        </div>
      </div>
    </main>
  );
}
