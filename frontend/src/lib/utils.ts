import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Name Function: cn
 * Description: Merges and normalizes Tailwind CSS class strings with automatic utility conflict resolution.
 * Reason: Combines clsx for dynamic class toggling and twMerge to deterministically resolve conflicting Tailwind utilities.
 **/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
