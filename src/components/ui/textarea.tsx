import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "flex field-sizing-content min-h-16 w-full rounded-md px-3 py-2 text-base outline-none",
        // Enhanced gradient background + border
        "bg-gradient-to-br from-purple-50/50 to-pink-50/50",
        "border-2 border-purple-200/50",
        // Focus state - enhanced ring effect
        "focus-visible:border-purple-400 focus-visible:ring-4 focus-visible:ring-purple-400/20",
        // Transitions
        "transition-all duration-200",
        // Placeholder
        "placeholder:text-muted-foreground",
        // Invalid state
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Typography
        "leading-relaxed md:text-sm",
        // Shadow (subtle)
        "shadow-xs",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
