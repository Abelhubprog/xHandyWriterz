import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind-friendly class name merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

// Format a date string or Date into a readable string
export function formatDate(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' },
  locale: string | string[] = undefined as unknown as string
): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    // If invalid date, return empty string
    if (isNaN(d.getTime())) return '';
    const formatter = new Intl.DateTimeFormat(locale || undefined, options);
    return formatter.format(d);
  } catch {
    return '';
  }
}

// Format a number as currency, default USD
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string | string[] = undefined as unknown as string
): string {
  try {
    const formatter = new Intl.NumberFormat(locale || undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol'
    });
    return formatter.format(amount);
  } catch {
    // Fallback simple format
    const sign = amount < 0 ? '-' : '';
    return `${sign}${currency} ${Math.abs(amount).toFixed(2)}`;
  }
}

// Small helpers
export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export function truncate(str: string, maxLen = 120) {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen - 1)}…` : str;
}
