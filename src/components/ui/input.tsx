import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full rounded-md border border-[#020D13]/15 bg-white px-4 text-sm text-[#020D13] outline-none transition placeholder:text-[#020D13]/45 focus:border-[#020D13] focus:ring-2 focus:ring-[#020D13]/10",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-28 w-full resize-y rounded-md border border-[#020D13]/15 bg-white px-4 py-3 text-sm text-[#020D13] outline-none transition placeholder:text-[#020D13]/45 focus:border-[#020D13] focus:ring-2 focus:ring-[#020D13]/10",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
