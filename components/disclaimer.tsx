export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`font-mono text-xs leading-relaxed text-monitor-muted ${className}`}>
      This is a parody. The Longevity Scan is not a medical device, not medical
      advice, and predicts nothing. For entertainment only.
    </p>
  );
}
