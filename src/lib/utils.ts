import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a date string as local time, ignoring timezone information.
 * This is useful when we want to display the time exactly as it appears in the string
 * regardless of the user's local timezone.
 */
export function parseAsLocalTime(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Remove timezone offset (Z or +HH:MM or -HH:MM)
  // This forces new Date() to treat it as a local date-time string
  const localDateStr = dateStr.replace(/(Z|[+-]\d{2}:?\d{2})$/, '');
  return new Date(localDateStr);
}
