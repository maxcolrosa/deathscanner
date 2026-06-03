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
          LONGEVITY SCAN
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
          &copy; {new Date().getFullYear()} Longevity Scan
        </span>
      </div>
    </footer>
  );
}
