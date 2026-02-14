import * as React from "react";

import { cn } from "@/src/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-2 border-border placeholder:text-muted-foreground bg-background flex field-sizing-content min-h-16 w-full rounded-lg px-3 py-2 text-base font-medium shadow-[2px_2px_0px_var(--border)] transition-all outline-none focus-visible:shadow-[4px_4px_0px_var(--border)] focus-visible:translate-x-[-1px] focus-visible:translate-y-[-1px] focus-visible:border-primary aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
