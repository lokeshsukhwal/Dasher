export interface TimeSlot {
  open: string | null;
  close: string | null;
  is24Hours: boolean;
  isClosed: boolean;
  rawText: string;
}

export interface DayHours {
  day: string;
  normalizedDay: string;
  timeSlot: TimeSlot;
  notes: string[];
}

export interface ChangeDetails {
  openTimeChanged: boolean;
  closeTimeChanged: boolean;
  openTimeExtended: boolean;
  closeTimeExtended: boolean;
  openTimeReduced: boolean;
  closeTimeReduced: boolean;
  became24Hours: boolean;
  becameClosed: boolean;
  wasClosedNowOpen: boolean;
}

export type ChangeType = 
  | 'EXTENDED' 
  | 'REDUCED' 
  | 'NO_CHANGE' 
  | 'CLOSED_NOW' 
  | 'OPEN_NOW' 
  | 'BECAME_24_HOURS'
  | 'WAS_24_HOURS';

export interface ComparisonResult {
  day: string;
  oldHours: TimeSlot;
  newHours: TimeSlot;
  changeType: ChangeType;
  changeDetails: ChangeDetails;
  dayRemark: string;
  changeCategory: 'open' | 'close' | 'full' | 'none' | 'status';
}

export interface GroupedRemarks {
  extended: ComparisonResult[];
  reduced: ComparisonResult[];
  noChange: ComparisonResult[];
  closedNow: ComparisonResult[];
  openNow: ComparisonResult[];
  became24Hours: ComparisonResult[];
}

export interface ParsedHours {
  [key: string]: DayHours;
}

export interface FinalRemark {
  title: string;
  remark: string;
  type: 'extended' | 'reduced' | 'noChange' | 'mixed';
  actionRequired: boolean;
}

export interface ComparisonSummary {
  totalDays: number;
  extendedDays: number;
  reducedDays: number;
  noChangeDays: number;
  closedNowDays: number;
  openNowDays: number;
  hasChanges: boolean;
  shouldUpdate: boolean;
}