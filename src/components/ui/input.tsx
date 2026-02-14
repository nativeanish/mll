import * as React from "react";

import { cn } from "@/src/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-9 w-full min-w-0 rounded-lg border-2 border-border bg-background px-3 py-1 text-base font-medium shadow-[2px_2px_0px_var(--border)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:shadow-[4px_4px_0px_var(--border)] focus-visible:translate-x-[-1px] focus-visible:translate-y-[-1px] focus-visible:border-primary",
        "aria-invalid:border-destructive aria-invalid:shadow-[2px_2px_0px_var(--destructive)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
