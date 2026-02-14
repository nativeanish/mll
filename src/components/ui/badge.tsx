import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border-2 border-border px-2 py-0.5 text-xs font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none shadow-[2px_2px_0px_var(--border)] transition-all overflow-hidden uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a&]:hover:translate-x-[-1px] [a&]:hover:translate-y-[-1px] [a&]:hover:shadow-[3px_3px_0px_var(--border)]",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:translate-x-[-1px] [a&]:hover:translate-y-[-1px] [a&]:hover:shadow-[3px_3px_0px_var(--border)]",
        destructive:
          "bg-destructive text-white [a&]:hover:translate-x-[-1px] [a&]:hover:translate-y-[-1px] [a&]:hover:shadow-[3px_3px_0px_var(--border)]",
        outline:
          "bg-background text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge };
