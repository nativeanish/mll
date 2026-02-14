export function BackgroundDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Neo-brutal geometric shapes */}
      <div className="absolute -top-8 -right-8 h-48 w-48 rotate-12 rounded-lg border-2 border-border bg-accent/30 shadow-[4px_4px_0px_var(--border)]" />
      <div className="absolute bottom-20 -left-12 h-36 w-36 -rotate-6 rounded-lg border-2 border-border bg-primary/20 shadow-[4px_4px_0px_var(--border)]" />
      <div className="absolute top-1/4 right-1/4 h-20 w-20 rotate-45 rounded-md border-2 border-border bg-secondary/30 shadow-[3px_3px_0px_var(--border)]" />
      <div className="absolute bottom-1/3 right-12 h-14 w-14 rounded-full border-2 border-border bg-nb-pink/20 shadow-[2px_2px_0px_var(--border)]" />
      <div className="absolute top-16 left-1/4 h-10 w-10 rounded-md border-2 border-border bg-nb-orange/25 shadow-[2px_2px_0px_var(--border)]" />

      {/* Zigzag line decoration */}
      <svg
        className="absolute bottom-0 left-0 w-full h-16 text-border opacity-10"
        viewBox="0 0 1200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 30 L30 10 L60 30 L90 10 L120 30 L150 10 L180 30 L210 10 L240 30 L270 10 L300 30 L330 10 L360 30 L390 10 L420 30 L450 10 L480 30 L510 10 L540 30 L570 10 L600 30 L630 10 L660 30 L690 10 L720 30 L750 10 L780 30 L810 10 L840 30 L870 10 L900 30 L930 10 L960 30 L990 10 L1020 30 L1050 10 L1080 30 L1110 10 L1140 30 L1170 10 L1200 30"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>

      {/* Grid dot pattern - bolder */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1.5px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
