import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg hover:scale-[1.05]",
        secondary: "bg-secondary text-secondary-foreground shadow-neu-flat-sm hover:scale-[1.05]",
        destructive: "bg-destructive text-destructive-foreground shadow-lg hover:scale-[1.05]",
        soft: "bg-background text-primary shadow-neu-flat-sm hover:shadow-neu-pressed",
        outline: "bg-background text-foreground shadow-neu-flat-sm hover:shadow-neu-pressed",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
