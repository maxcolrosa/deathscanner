import Link from "next/link";

const LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms and Conditions" },
  { href: "/cookies", label: "Cookies Policy" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-monitor-line px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <span className="font-mono text-sm tracking-tight text-monitor-fg">
          VIVRUN
        </span>
        <span className="font-mono text-xs text-monitor-muted">
          Vivrun is a brand of ColrosaStudios LTD.
        </span>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs text-monitor-muted transition-colors hover:text-monitor-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="font-mono text-xs text-monitor-muted">
          For entertainment. Results vary.{" "}
          <Link href="/terms" className="text-monitor-accent hover:underline">
            See our Terms.
          </Link>
        </span>
        <span className="font-mono text-xs text-monitor-muted">
          &copy; {new Date().getFullYear()} ColrosaStudios LTD. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
