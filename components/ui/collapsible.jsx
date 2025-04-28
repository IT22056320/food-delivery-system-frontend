"use client"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

import { cn } from "@/lib/utils"

function Collapsible({ className, ...props }) {
    return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn("w-full", className)} {...props} />
}

function CollapsibleTrigger({ className, ...props }) {
    return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" className={cn("", className)} {...props} />
}

function CollapsibleContent({ className, ...props }) {
    return (
        <CollapsiblePrimitive.Content
            data-slot="collapsible-content"
            className={cn(
                "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden",
                className,
            )}
            {...props}
        />
    )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

