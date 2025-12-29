import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const DAY_TO_SHORT: Record<string, string> = {
  'Monday': 'Mon',
  'Tuesday': 'Tue',
  'Wednesday': 'Wed',
  'Thursday': 'Thu',
  'Friday': 'Fri',
  'Saturday': 'Sat',
  'Sunday': 'Sun',
};

export const SHORT_TO_DAY: Record<string, string> = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday',
  'Sun': 'Sunday',
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

// Convert time string to minutes since midnight
export function timeToMinutes(time: string | null): number | null {
  if (!time) return null;

  const cleaned = time.toUpperCase().replace(/\s+/g, ' ').trim();

  // Handle "24 Hours"
  if (cleaned.includes('24 HOURS')) {
    return null; // Special case
  }

  // Handle "Closed" or "Blank"
  if (cleaned === 'CLOSED' || cleaned === 'BLANK' || cleaned === '-') {
    return null;
  }

  // Handle "12 AM", "12 PM" format (no minutes)
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

// Convert minutes to time string
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  if (mins === 0) {
    return `${displayHours} ${period}`;
  }
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Format time for display (consistent format)
export function formatTime(time: string | null | Date): string {
  if (!time) return 'Closed';

  if (time instanceof Date) {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    if (minutes === 0) {
      return `${displayHours} ${period}`;
    }
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  const cleaned = time.toString().trim().toUpperCase();

  if (cleaned === 'CLOSED' || cleaned === 'BLANK' || cleaned === '-' || !cleaned) {
    return 'Closed';
  }

  if (cleaned.includes('24 HOURS')) {
    return '24 Hours';
  }

  const mins = timeToMinutes(time);
  if (mins !== null) {
    return minutesToTime(mins);
  }

  return time.toString();
}

// Build day range string like "Mon–Fri" or "Mon, Wed, Fri"
export function buildDayRange(days: string[]): string {
  if (!days.length) return '';

  // Get unique short day names
  const uniqueDays = [...new Set(days.map(d => DAY_TO_SHORT[d] || d))];

  // Get indices
  const indices = uniqueDays
    .map(d => SHORT_DAYS.indexOf(d as any))
    .filter(i => i !== -1)
    .sort((a, b) => a - b);

  if (indices.length === 0) return uniqueDays.join(', ');
  if (indices.length === 7) return 'Mon–Sun';

  // Find consecutive ranges
  const getRanges = (arr: number[]): [number, number][] => {
    const ranges: [number, number][] = [];
    let start = arr[0];
    let end = start;

    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === end + 1) {
        end = arr[i];
      } else {
        ranges.push([start, end]);
        start = end = arr[i];
      }
    }
    ranges.push([start, end]);
    return ranges;
  };

  // Try different starting points to find the best grouping
  let bestString = '';
  let minGroups = Infinity;

  for (let shift = 0; shift < 7; shift++) {
    const shifted = indices.map(i => (i - shift + 7) % 7).sort((a, b) => a - b);
    const ranges = getRanges(shifted);

    if (ranges.length < minGroups) {
      minGroups = ranges.length;
      bestString = ranges.map(([s, e]) => {
        const actualStart = (s + shift) % 7;
        const actualEnd = (e + shift) % 7;

        if (actualStart === actualEnd) {
          return SHORT_DAYS[actualStart];
        }
        return `${SHORT_DAYS[actualStart]}–${SHORT_DAYS[actualEnd]}`;
      }).join(', ');
    }
  }

  return bestString;
}

// Normalize time string (handle "24 Hours – 24 Hours" etc.)
export function normalizeTimeString(str: string): string {
  return str.replace(/24 Hours\s*[–-]\s*24 Hours/gi, '24 Hours');
}

// Title case with preserved words
export function titleCase(str: string, preserve: string[] = ['GMB', 'Closed', 'AM', 'PM']): string {
  let result = str;
  preserve.forEach(word => {
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(re, word);
  });
  return result.replace(/\b(am|pm)\b/gi, s => s.toUpperCase());
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}