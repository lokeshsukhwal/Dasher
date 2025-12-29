export interface TimeSlot {
  open: string | null;
  close: string | null;
  is24Hours: boolean;
  isClosed: boolean;
  isBlank: boolean;
  rawText: string;
}

export interface DayHours {
  day: string;
  normalizedDay: string;
  timeSlot: TimeSlot;
  notes: string[];
}

export type ChangeResult = 
  | 'Full Time Extended'
  | 'Start Time Extended'
  | 'End Time Extended'
  | 'Full Time Reduced'
  | 'Start Time Reduced'
  | 'End Time Reduced'
  | 'Full Day Extended'
  | 'Full Day Reduced'
  | 'No Change'
  | 'Incompatible Data';

export type ClosedStatus = 
  | 'Old Time Closed'
  | 'New Time Closed'
  | 'Both Open'
  | 'Both Closed';

export interface ComparisonResult {
  day: string;
  dayShort: string;
  oldStartTime: string;
  oldEndTime: string;
  newStartTime: string;
  newEndTime: string;
  oldHours: TimeSlot;
  newHours: TimeSlot;
  closedStatus: ClosedStatus;
  result: ChangeResult;
  dayRemark: string;
}

export interface GroupedChanges {
  reduce: {
    'Full Time Reduced': Record<string, string[]>;
    'Start Time Reduced': Record<string, string[]>;
    'End Time Reduced': Record<string, string[]>;
    'Full Day Reduced': Record<string, string[]>;
  };
  extend: {
    'Full Time Extended': Record<string, string[]>;
    'Start Time Extended': Record<string, string[]>;
    'End Time Extended': Record<string, string[]>;
    'Full Day Extended': Record<string, string[]>;
  };
  noChange: string[];
}

export interface FinalRemarks {
  reduceRemark: string;
  extendRemark: string;
  hasReduceChanges: boolean;
  hasExtendChanges: boolean;
  hasNoChanges: boolean;
}

export interface ComparisonSummary {
  totalDays: number;
  extendedDays: number;
  reducedDays: number;
  noChangeDays: number;
  closedNowDays: number;
  openNowDays: number;
  hasReducedHours: boolean;
  hasExtendedHours: boolean;
  shouldUpdate: boolean;
}

export interface ParsedHours {
  [key: string]: DayHours;
}