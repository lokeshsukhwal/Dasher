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

export const DAY_SHORT: Record<string, string> = {
  'Sunday': 'Sun',
  'Monday': 'Mon',
  'Tuesday': 'Tue',
  'Wednesday': 'Wed',
  'Thursday': 'Thu',
  'Friday': 'Fri',
  'Saturday': 'Sat',
};

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
  
  const cleaned = time.toUpperCase().replace(/\s+/g, ' ').trim();
  
  // Handle "12 AM", "12 PM" format
  const simpleMatch = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (simpleMatch) {
    let hours = parseInt(simpleMatch[1], 10);
    const period = simpleMatch[2].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60;
  }
  
  // Handle "9:00 AM", "10:30 PM" format
  const fullMatch = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (fullMatch) {
    let hours = parseInt(fullMatch[1], 10);
    const minutes = parseInt(fullMatch[2], 10);
    const period = fullMatch[3]?.toUpperCase();
    
    if (period) {
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }
    
    return hours * 60 + minutes;
  }
  
  return null;
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

export function formatDayRange(days: string[]): string {
  if (days.length === 0) return '';
  if (days.length === 1) return days[0];
  
  const shortDays = days.map(d => DAY_SHORT[d] || d);
  
  if (days.length === 7) {
    return 'Mon-Sun';
  }
  
  // Check if consecutive
  const dayIndices = days.map(d => DAYS_OF_WEEK.indexOf(d as any)).filter(i => i !== -1).sort((a, b) => a - b);
  
  let isConsecutive = true;
  for (let i = 1; i < dayIndices.length; i++) {
    if (dayIndices[i] - dayIndices[i - 1] !== 1) {
      isConsecutive = false;
      break;
    }
  }
  
  if (isConsecutive && days.length >= 3) {
    return `${shortDays[0]}-${shortDays[shortDays.length - 1]}`;
  }
  
  if (days.length === 2) {
    return shortDays.join(' and ');
  }
  
  return shortDays.slice(0, -1).join(', ') + ' and ' + shortDays[shortDays.length - 1];
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}