import * as React from "react"
import { cn } from "@/lib/utils"

export const Popover: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("relative inline-block", className)} {...props} />
)

export const PopoverTrigger: React.FC<React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }> = ({ className, children, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { ...props })
  }
  return (
    <div className={cn(className)} {...props}>{children}</div>
  )
}

export const PopoverContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'center' | 'end' }> = ({ className, ...props }) => (
  <div className={cn("absolute z-50 mt-2 rounded-md border bg-white p-2 shadow-md", className)} {...props} />
)
