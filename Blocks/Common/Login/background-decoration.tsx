export function BackgroundDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute -top-[30%] -right-[20%] h-[600px] w-[600px] rounded-full bg-violet-500/4 dark:bg-violet-500/6 blur-3xl" />
      <div className="absolute -bottom-[20%] -left-[15%] h-[500px] w-[500px] rounded-full bg-indigo-500/4 dark:bg-indigo-500/6 blur-3xl" />
      <div className="absolute top-[20%] left-[50%] h-[300px] w-[300px] rounded-full bg-purple-500/3 dark:bg-purple-500/4 blur-3xl" />

      {/* Subtle ring */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg
          width="700"
          height="700"
          viewBox="0 0 700 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-[0.02] dark:opacity-[0.04]"
        >
          <circle
            cx="350"
            cy="350"
            r="280"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary"
          />
          <circle
            cx="350"
            cy="350"
            r="200"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="4 6"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Grid dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.012] dark:opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 0.5px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
