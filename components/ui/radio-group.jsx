"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "@/lib/utils"

const RadioGroup = RadioGroupPrimitive.Root

const RadioGroupItem = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            className={cn(
                "peer data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator
                className={cn("flex items-center justify-center text-current transition-none")}
            >
                <span className="size-2 rounded-full bg-current" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
