import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#020D13]/30 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-[#020D13] text-[#FFFBFC] hover:bg-[#17313d]",
        light: "bg-[#FFFBFC] text-[#020D13] hover:bg-white",
        outline:
          "border border-[#020D13]/20 bg-transparent text-[#020D13] hover:bg-[#020D13]/5",
        ghost: "text-[#020D13] hover:bg-[#020D13]/6",
        danger: "bg-red-700 text-white hover:bg-red-800",
      },
      size: {
        default: "h-11",
        sm: "h-9 min-h-9 px-3 text-xs",
        lg: "h-13 px-7 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
