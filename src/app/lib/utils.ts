import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAY_ABBREVIATIONS: Record<string, string> = {
  'sun': 'Sunday',
  'mon': 'Monday',
  'tue': 'Tuesday',
  'tues': 'Tuesday',
  'wed': 'Wednesday',
  'thu': 'Thursday',
  'thur': 'Thursday',
  'thurs': 'Thursday',
  'fri': 'Friday',
  'sat': 'Saturday',
  'sunday': 'Sunday',
  'monday': 'Monday',
  'tuesday': 'Tuesday',
  'wednesday': 'Wednesday',
  'thursday': 'Thursday',
  'friday': 'Friday',
  'saturday': 'Saturday',
};

export function normalizeDay(day: string): string {
  const cleaned = day.toLowerCase().trim();
  return DAY_ABBREVIATIONS[cleaned] || day;
}

export function timeToMinutes(time: string | null): number | null {
  if (!time) return null;
  
  const cleaned = time.toUpperCase().replace(/\s+/g, '');
  
  // Handle various formats
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/i);
  
  if (!match) {
    // Try alternative formats
    const altMatch = cleaned.match(/^(\d{1,2})(AM|PM)$/i);
    if (altMatch) {
      let hours = parseInt(altMatch[1], 10);
      const period = altMatch[2].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours * 60;
    }
    return null;
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3]?.toUpperCase();
  
  if (period) {
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }
  
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  if (mins === 0) {
    return `${displayHours} ${period}`;
  }
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function formatTimeForDisplay(time: string | null): string {
  if (!time) return '-';
  const minutes = timeToMinutes(time);
  if (minutes === null) return time;
  return minutesToTime(minutes);
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}