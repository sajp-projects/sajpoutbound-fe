import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2", {
  variants: {
    variant: {
      default: "bg-blue-600 text-blue-600-foreground hover:bg-blue-600/80",
      secondary: "bg-gray-100 text-gray-600-foreground hover:bg-gray-100/80",
      destructive: "bg-red-600 text-red-600-foreground hover:bg-red-600/80",
      outline: "text-gray-900",
      success: "bg-green-100 text-green-800 hover:bg-green-200",
      warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      info: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
