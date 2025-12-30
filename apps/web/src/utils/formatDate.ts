/**
 * Date formatting utilities
 */

import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Unknown';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a date for display (e.g., "Jan 1, 2024")
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Unknown';
  
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format a date with time (e.g., "Jan 1, 2024 at 2:30 PM")
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Unknown';
  
  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a date for ISO string
 */
export function formatISODate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return dateObj.toISOString();
}

/**
 * Format a timestamp number to a readable date
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  
  if (!isValid(date)) return 'Unknown';
  
  return format(date, 'MMM d, yyyy h:mm a');
}

export default formatDate;
