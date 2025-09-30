import * as React from "react"
import { cn } from "@/lib/utils"

export const Command: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-1 p-2", className)} {...props} />
)
export const CommandInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={cn("mb-1 h-8 w-full rounded-md border px-2 text-sm", className)} {...props} />
)
export const CommandList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("max-h-64 overflow-auto", className)} {...props} />
)
export const CommandEmpty: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-2 text-sm text-muted-foreground", className)} {...props} />
)
export const CommandGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("p-1", className)} {...props} />
)
export const CommandItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-gray-100", className)} {...props} />
)
export const CommandSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("my-1 h-px bg-gray-200", className)} {...props} />
)
