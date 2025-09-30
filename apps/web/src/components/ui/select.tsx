import React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: { value: string; label: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options = [], placeholder, onValueChange, onChange, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onChange={(e) => {
          onValueChange?.(e.target.value)
          onChange?.(e)
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)

Select.displayName = "Select"
// Shadcn-like API shims used by existing code
const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("inline-flex items-center justify-between rounded-md border px-2 py-1 text-sm", className)} {...props}>
      {children}
    </div>
  )
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { side?: string }> = ({ className, children, ...props }) => (
  <div className={cn("mt-2 rounded-md border bg-white p-1 shadow-md", className)} {...props}>
    {children}
  </div>
)

const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }> = ({ className, children, ...props }) => (
  <div className={cn("cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100", className)} {...props}>
    {children}
  </div>
)

const SelectValue: React.FC<{ placeholder?: React.ReactNode; children?: React.ReactNode }> = ({ placeholder, children }) => (
  <span>{children ?? placeholder}</span>
)

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
