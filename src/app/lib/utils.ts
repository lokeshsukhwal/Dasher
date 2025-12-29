import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/* -------------------- Classname Utility -------------------- */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------- Days Constants -------------------- */
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
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

export const SHORT_TO_DAY: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

/* -------------------- Day Normalization -------------------- */
export const DAY_ABBREVIATIONS: Record<string, string> = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  tues: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  thur: 'Thursday',
  thurs: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

export function normalizeDay(day: string): string {
  const cleaned = day.toLowerCase().trim();
  return DAY_ABBREVIATIONS[cleaned] ?? day;
}

/* -------------------- Time Utilities -------------------- */
export function timeToMinutes(time: string | null): number | null {
  if (!time) return null;

  const cleaned = time.toUpperCase().replace(/\s+/g, ' ').trim();

  if (cleaned.includes('24 HOURS')) return null;
  if (cleaned === 'CLOSED' || cleaned === 'BLANK' || cleaned === '-') return null;

  const simpleMatch = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/);
  if (simpleMatch) {
    let hours = Number(simpleMatch[1]);
    const period = simpleMatch[2];

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60;
  }

  const fullMatch = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (fullMatch) {
    let hours = Number(fullMatch[1]);
    const minutes = Number(fullMatch[2]);
    const period = fullMatch[3];

    if (period) {
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }

    return hours * 60 + minutes;
  }

  return null;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return mins === 0
    ? `${displayHours} ${period}`
    : `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

export function formatTime(time: string | Date | null): string {
  if (!time) return 'Closed';

  if (time instanceof Date) {
    return minutesToTime(time.getHours() * 60 + time.getMinutes());
  }

  const cleaned = time.trim().toUpperCase();

  if (cleaned === 'CLOSED' || cleaned === 'BLANK' || cleaned === '-' || !cleaned) {
    return 'Closed';
  }

  if (cleaned.includes('24 HOURS')) return '24 Hours';

  const mins = timeToMinutes(time);
  return mins !== null ? minutesToTime(mins) : time;
}

/* -------------------- Day Range Builder -------------------- */
export function buildDayRange(days: string[]): string {
  if (!days.length) return '';

  const uniqueDays = Array.from(
    new Set(days.map(d => DAY_TO_SHORT[d] ?? d))
  );

  const indices = uniqueDays
    .map(d => SHORT_DAYS.indexOf(d as (typeof SHORT_DAYS)[number]))
    .filter(i => i !== -1)
    .sort((a, b) => a - b);

  if (indices.length === 7) return 'Mon–Sun';
  if (!indices.length) return uniqueDays.join(', ');

  const ranges: [number, number][] = [];
  let start = indices[0];
  let end = start;

  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === end + 1) {
      end = indices[i];
    } else {
      ranges.push([start, end]);
      start = end = indices[i];
    }
  }
  ranges.push([start, end]);

  return ranges
    .map(([s, e]) =>
      s === e ? SHORT_DAYS[s] : `${SHORT_DAYS[s]}–${SHORT_DAYS[e]}`
    )
    .join(', ');
}

/* -------------------- String Helpers -------------------- */
export function normalizeTimeString(str: string): string {
  return str.replace(/24 Hours\s*[–-]\s*24 Hours/gi, '24 Hours');
}

export function titleCase(
  str: string,
  preserve: string[] = ['GMB', 'Closed', 'AM', 'PM']
): string {
  let result = str;

  preserve.forEach(word => {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), word);
  });

  return result.replace(/\b(am|pm)\b/gi, s => s.toUpperCase());
}

/* -------------------- Clipboard -------------------- */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
