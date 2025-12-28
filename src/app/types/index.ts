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

export type ChangeType = 
  | 'EXTENDED_OPEN' 
  | 'EXTENDED_CLOSE' 
  | 'EXTENDED_FULL'
  | 'REDUCED_OPEN'
  | 'REDUCED_CLOSE'
  | 'REDUCED_FULL'
  | 'NO_CHANGE' 
  | 'CLOSED_NOW' 
  | 'OPEN_NOW' 
  | 'BECAME_24_HOURS'
  | 'BLANK_TO_HOURS';

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
  wasBlankNowHasHours: boolean;
  oldOpenTime: string | null;
  oldCloseTime: string | null;
  newOpenTime: string | null;
  newCloseTime: string | null;
}

export interface ComparisonResult {
  day: string;
  dayShort: string;
  newOpenTime: string;
  newCloseTime: string;
  oldOpenTime: string;
  oldCloseTime: string;
  oldHours: TimeSlot;
  newHours: TimeSlot;
  changeType: ChangeType;
  changeDetails: ChangeDetails;
  status: 'Extended' | 'Reduced' | 'No Change' | 'Closed Now' | 'Open Now';
  dayRemark: string;
  changeCategory: 'Opening Time' | 'End Time' | 'Full Day' | 'No Change' | 'Status Change';
}

export interface GroupedChanges {
  reducedOpen: ComparisonResult[];
  reducedClose: ComparisonResult[];
  reducedFull: ComparisonResult[];
  extendedOpen: ComparisonResult[];
  extendedClose: ComparisonResult[];
  extendedFull: ComparisonResult[];
  noChange: ComparisonResult[];
  closedNow: ComparisonResult[];
  openNow: ComparisonResult[];
  blankToHours: ComparisonResult[];
}

export interface FinalRemark {
  title: string;
  remark: string;
  type: 'reduced' | 'extended' | 'noChange' | 'blank';
  actionRequired: boolean;
  priority: number;
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