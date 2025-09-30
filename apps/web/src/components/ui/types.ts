import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from './button';
import { cardVariants } from './card';
import { inputVariants } from './input';
import { textareaVariants } from './textarea';
import { labelVariants } from './label';

export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type TextareaVariants = VariantProps<typeof textareaVariants>;
export type LabelVariants = VariantProps<typeof labelVariants>;

// Common form field props
export interface BaseFieldProps {
  id: string;
  label?: string;
  error?: string;
  success?: string;
  optional?: boolean;
  required?: boolean;
  className?: string;
  description?: string;
}

export type ValidationState = {
  error?: string;
  success?: string;
};
