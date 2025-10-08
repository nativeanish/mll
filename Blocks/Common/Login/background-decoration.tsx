export function BackgroundDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Large ring inspired by Paradigm design */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          width="800"
          height="800"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-[0.03] dark:opacity-[0.05]"
        >
          <circle
            cx="400"
            cy="400"
            r="300"
            stroke="currentColor"
            strokeWidth="100"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Smaller accent circles */}
      <div className="absolute right-[10%] top-[15%]">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-[0.04] dark:opacity-[0.06]"
        >
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="currentColor"
            className="text-accent"
          />
        </svg>
      </div>

      <div className="absolute bottom-[20%] left-[15%]">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-[0.04] dark:opacity-[0.06]"
        >
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
