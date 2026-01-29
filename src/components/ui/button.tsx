import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-[#1d4ed8] rounded-none", // Primary: Solid Blue, white text, sharp corners
        destructive:
          "bg-alert-red text-white hover:bg-[#b91c1c] rounded-none",
        outline:
          "border border-ink-black bg-white text-ink-black hover:bg-soft-wash rounded-none", // Secondary: White bg, black border, black text
        secondary:
          "bg-soft-wash text-ink-black hover:bg-[#e5e7eb] rounded-none",
        ghost: "hover:bg-soft-wash text-ink-black rounded-none",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2", // Minimum 44px for touch targets
        sm: "h-10 px-3 text-xs",
        lg: "h-12 px-8",
        icon: "h-11 w-11", // Minimum 44px for touch targets
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
