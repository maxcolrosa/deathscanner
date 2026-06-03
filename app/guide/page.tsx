import { GuidePitch } from "@/components/guide-pitch";

export default function GuidePage() {
  return (
    <main className="px-6 pt-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-monitor-fg">
          The protocol
        </h1>
        <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-monitor-muted">
          You do not need a death scan to start. You just need to start.
        </p>
      </div>
      <GuidePitch recoverableYears={0} />
    </main>
  );
}
