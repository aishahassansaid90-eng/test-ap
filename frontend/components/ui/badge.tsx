import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-slate-100 text-slate-800 border-slate-200",
    destructive: "bg-red-100 text-red-800 border-red-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    outline: "text-slate-800 border-slate-300",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles,
        className
      )}
      {...props}
    />
  );
}

export { Badge }
