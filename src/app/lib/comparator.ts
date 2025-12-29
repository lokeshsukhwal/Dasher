import { 
  TimeSlot, 
  ComparisonResult, 
  ChangeResult,
  ClosedStatus,
  ParsedHours,
  GroupedChanges,
  ComparisonSummary
} from '@/types';
import { timeToMinutes, DAYS_OF_WEEK, DAY_TO_SHORT, formatTime } from './utils';
import { ensureAllDays } from './parser';

// Tolerance in minutes (3 minutes = 3/1440 of a day)
const TOLERANCE_MINUTES = 3;

function getTimeValue(slot: TimeSlot, isStart: boolean): number | null {
  if (slot.isClosed || slot.isBlank) return null;
  
  if (slot.is24Hours) {
    // For 24 hours: start = 0 (midnight), end = 1439 (11:59 PM)
    return isStart ? 0 : 1439;
  }
  
  const time = isStart ? slot.open : slot.close;
  return timeToMinutes(time);
}

function getDisplayTime(slot: TimeSlot, isStart: boolean): string {
  if (slot.isClosed) return 'Closed';
  if (slot.isBlank) return 'Blank';
  if (slot.is24Hours) return '24 Hours';
  
  const time = isStart ? slot.open : slot.close;
  return formatTime(time);
}

function getClosedStatus(oldSlot: TimeSlot, newSlot: TimeSlot): ClosedStatus {
  const oldIsClosed = oldSlot.isClosed || oldSlot.isBlank;
  const newIsClosed = newSlot.isClosed || newSlot.isBlank;
  
  if (oldIsClosed && newIsClosed) return 'Both Closed';
  if (oldIsClosed && !newIsClosed) return 'Old Time Closed';
  if (!oldIsClosed && newIsClosed) return 'New Time Closed';
  return 'Both Open';
}

/**
 * Implementation of the Google Sheets formula logic
 * 
 * Column mapping:
 * B = Old Start (System/MINT)
 * C = Old End (System/MINT)  
 * D = New Start (GMB)
 * E = New End (GMB)
 * 
 * Logic:
 * - If New Start > Old Start + 3min: Start Time Reduced (opens later)
 * - If New End < Old End - 3min: End Time Reduced (closes earlier)
 * - If New Start < Old Start - 3min: Start Time Extended (opens earlier)
 * - If New End > Old End + 3min: End Time Extended (closes later)
 */
function compareTimeSlotsWithFormula(oldSlot: TimeSlot, newSlot: TimeSlot): ChangeResult {
  const oldStart = getTimeValue(oldSlot, true);  // B
  const oldEnd = getTimeValue(oldSlot, false);   // C
  const newStart = getTimeValue(newSlot, true);  // D
  const newEnd = getTimeValue(newSlot, false);   // E
  
  const oldIsClosed = oldSlot.isClosed || oldSlot.isBlank;
  const newIsClosed = newSlot.isClosed || newSlot.isBlank;
  
  // If all times are present (COUNTBLANK = 0)
  if (!oldIsClosed && !newIsClosed && oldStart !== null && oldEnd !== null && newStart !== null && newEnd !== null) {
    
    // Handle overnight times (add 1440 if end < start)
    let adjustedOldEnd = oldEnd;
    let adjustedNewEnd = newEnd;
    
    if (oldEnd < oldStart) adjustedOldEnd += 1440;
    if (newEnd < newStart) adjustedNewEnd += 1440;
    
    // Check if both are effectively 24 hours (within tolerance)
    const oldDuration = adjustedOldEnd - oldStart;
    const newDuration = adjustedNewEnd - newStart;
    
    const isOld24Hours = Math.abs(oldDuration - 1439) < TOLERANCE_MINUTES || oldSlot.is24Hours;
    const isNew24Hours = Math.abs(newDuration - 1439) < TOLERANCE_MINUTES || newSlot.is24Hours;
    
    if (isOld24Hours && isNew24Hours) {
      return 'No Change';
    }
    
    // Check if times match within tolerance
    const startDiff = newStart - oldStart;
    const endDiff = adjustedNewEnd - adjustedOldEnd;
    
    if (Math.abs(startDiff) <= TOLERANCE_MINUTES && Math.abs(endDiff) <= TOLERANCE_MINUTES) {
      return 'No Change';
    }
    
    // Check for Full Time Reduced: New opens later AND New closes earlier
    if (startDiff > TOLERANCE_MINUTES && endDiff < -TOLERANCE_MINUTES) {
      return 'Full Time Reduced';
    }
    
    // Check for Start Time Reduced: New opens later
    if (startDiff > TOLERANCE_MINUTES) {
      return 'Start Time Reduced';
    }
    
    // Check for End Time Reduced: New closes earlier
    if (endDiff < -TOLERANCE_MINUTES) {
      return 'End Time Reduced';
    }
    
    // Check for Full Time Extended: New opens earlier AND New closes later
    if (startDiff < -TOLERANCE_MINUTES && endDiff > TOLERANCE_MINUTES) {
      return 'Full Time Extended';
    }
    
    // Check for Start Time Extended: New opens earlier
    if (startDiff < -TOLERANCE_MINUTES) {
      return 'Start Time Extended';
    }
    
    // Check for End Time Extended: New closes later
    if (endDiff > TOLERANCE_MINUTES) {
      return 'End Time Extended';
    }
    
    return 'No Change';
  }
  
  // Handle blank/closed cases
  // If old has times but new is closed/blank
  if (!oldIsClosed && newIsClosed) {
    return 'Full Day Reduced';
  }
  
  // If old is closed/blank but new has times
  if (oldIsClosed && !newIsClosed) {
    return 'Full Day Extended';
  }
  
  // Both closed or both blank
  if (oldIsClosed && newIsClosed) {
    return 'No Change';
  }
  
  return 'Incompatible Data';
}

function generateDayRemark(
  day: string,
  oldSlot: TimeSlot,
  newSlot: TimeSlot,
  result: ChangeResult
): string {
  const oldStart = getDisplayTime(oldSlot, true);
  const oldEnd = getDisplayTime(oldSlot, false);
  const newStart = getDisplayTime(newSlot, true);
  const newEnd = getDisplayTime(newSlot, false);
  
  switch (result) {
    case 'No Change':
      return 'No Change';
    case 'Full Time Reduced':
      return `${day} (Full Day): From (${oldStart} - ${oldEnd}) to (${newStart} - ${newEnd})`;
    case 'Start Time Reduced':
      return `${day} (Opening Time): From ${oldStart} to ${newStart}`;
    case 'End Time Reduced':
      return `${day} (End Time): From ${oldEnd} to ${newEnd}`;
    case 'Full Day Reduced':
      return `${day} (Full Day): From (${oldStart} - ${oldEnd}) to Closed`;
    case 'Full Time Extended':
      return `${day} (Full Day): From (${oldStart} - ${oldEnd}) to (${newStart} - ${newEnd})`;
    case 'Start Time Extended':
      return `${day} (Opening Time): From ${oldStart} to ${newStart}`;
    case 'End Time Extended':
      return `${day} (End Time): From ${oldEnd} to ${newEnd}`;
    case 'Full Day Extended':
      return `${day} (Full Day): From Closed to (${newStart} - ${newEnd})`;
    default:
      return 'Incompatible Data';
  }
}

export function compareBusinessHours(
  oldHours: ParsedHours, 
  newHours: ParsedHours
): ComparisonResult[] {
  const completeOld = ensureAllDays(oldHours);
  const completeNew = ensureAllDays(newHours);
  
  const results: ComparisonResult[] = [];
  
  for (const day of DAYS_OF_WEEK) {
    const oldDayData = completeOld[day];
    const newDayData = completeNew[day];
    
    const closedStatus = getClosedStatus(oldDayData.timeSlot, newDayData.timeSlot);
    const result = compareTimeSlotsWithFormula(oldDayData.timeSlot, newDayData.timeSlot);
    const dayRemark = generateDayRemark(day, oldDayData.timeSlot, newDayData.timeSlot, result);
    
    results.push({
      day,
      dayShort: DAY_TO_SHORT[day] || day,
      oldStartTime: getDisplayTime(oldDayData.timeSlot, true),
      oldEndTime: getDisplayTime(oldDayData.timeSlot, false),
      newStartTime: getDisplayTime(newDayData.timeSlot, true),
      newEndTime: getDisplayTime(newDayData.timeSlot, false),
      oldHours: oldDayData.timeSlot,
      newHours: newDayData.timeSlot,
      closedStatus,
      result,
      dayRemark,
    });
  }
  
  return results;
}

export function groupResults(results: ComparisonResult[]): GroupedChanges {
  const grouped: GroupedChanges = {
    reduce: {
      'Full Time Reduced': {},
      'Start Time Reduced': {},
      'End Time Reduced': {},
      'Full Day Reduced': {},
    },
    extend: {
      'Full Time Extended': {},
      'Start Time Extended': {},
      'End Time Extended': {},
      'Full Day Extended': {},
    },
    noChange: [],
  };
  
  for (const r of results) {
    const { result, closedStatus, dayShort, oldStartTime, oldEndTime, newStartTime, newEndTime } = r;
    
    // Handle Old Time Closed -> Full Day Extended
    if (closedStatus === 'Old Time Closed') {
      const key = `${newStartTime}–${newEndTime}|Closed`;
      if (!grouped.extend['Full Day Extended'][key]) {
        grouped.extend['Full Day Extended'][key] = [];
      }
      grouped.extend['Full Day Extended'][key].push(dayShort);
      continue;
    }
    
    // Handle New Time Closed -> Full Day Reduced
    if (closedStatus === 'New Time Closed') {
      const key = `${oldStartTime}–${oldEndTime}|Closed`;
      if (!grouped.reduce['Full Day Reduced'][key]) {
        grouped.reduce['Full Day Reduced'][key] = [];
      }
      grouped.reduce['Full Day Reduced'][key].push(dayShort);
      continue;
    }
    
    // Handle other results
    if (result === 'No Change') {
      grouped.noChange.push(dayShort);
      continue;
    }
    
    // Build time keys based on result type
    let key = '';
    
    switch (result) {
      case 'Full Time Reduced':
        key = `${oldStartTime}–${oldEndTime}|${newStartTime}–${newEndTime}`;
        if (!grouped.reduce['Full Time Reduced'][key]) {
          grouped.reduce['Full Time Reduced'][key] = [];
        }
        grouped.reduce['Full Time Reduced'][key].push(dayShort);
        break;
        
      case 'Start Time Reduced':
        key = `${oldStartTime}|${newStartTime}`;
        if (!grouped.reduce['Start Time Reduced'][key]) {
          grouped.reduce['Start Time Reduced'][key] = [];
        }
        grouped.reduce['Start Time Reduced'][key].push(dayShort);
        break;
        
      case 'End Time Reduced':
        key = `${oldEndTime}|${newEndTime}`;
        if (!grouped.reduce['End Time Reduced'][key]) {
          grouped.reduce['End Time Reduced'][key] = [];
        }
        grouped.reduce['End Time Reduced'][key].push(dayShort);
        break;
        
      case 'Full Day Reduced':
        key = `${oldStartTime}–${oldEndTime}|Closed`;
        if (!grouped.reduce['Full Day Reduced'][key]) {
          grouped.reduce['Full Day Reduced'][key] = [];
        }
        grouped.reduce['Full Day Reduced'][key].push(dayShort);
        break;
        
      case 'Full Time Extended':
        key = `${newStartTime}–${newEndTime}|${oldStartTime}–${oldEndTime}`;
        if (!grouped.extend['Full Time Extended'][key]) {
          grouped.extend['Full Time Extended'][key] = [];
        }
        grouped.extend['Full Time Extended'][key].push(dayShort);
        break;
        
      case 'Start Time Extended':
        key = `${newStartTime}|${oldStartTime}`;
        if (!grouped.extend['Start Time Extended'][key]) {
          grouped.extend['Start Time Extended'][key] = [];
        }
        grouped.extend['Start Time Extended'][key].push(dayShort);
        break;
        
      case 'End Time Extended':
        key = `${newEndTime}|${oldEndTime}`;
        if (!grouped.extend['End Time Extended'][key]) {
          grouped.extend['End Time Extended'][key] = [];
        }
        grouped.extend['End Time Extended'][key].push(dayShort);
        break;
        
      case 'Full Day Extended':
        key = `${newStartTime}–${newEndTime}|Closed`;
        if (!grouped.extend['Full Day Extended'][key]) {
          grouped.extend['Full Day Extended'][key] = [];
        }
        grouped.extend['Full Day Extended'][key].push(dayShort);
        break;
    }
  }
  
  return grouped;
}

export function calculateSummary(results: ComparisonResult[]): ComparisonSummary {
  let extendedDays = 0;
  let reducedDays = 0;
  let noChangeDays = 0;
  let closedNowDays = 0;
  let openNowDays = 0;
  
  for (const r of results) {
    switch (r.result) {
      case 'No Change':
        noChangeDays++;
        break;
      case 'Full Time Extended':
      case 'Start Time Extended':
      case 'End Time Extended':
      case 'Full Day Extended':
        extendedDays++;
        if (r.closedStatus === 'Old Time Closed') {
          openNowDays++;
        }
        break;
      case 'Full Time Reduced':
      case 'Start Time Reduced':
      case 'End Time Reduced':
      case 'Full Day Reduced':
        reducedDays++;
        if (r.closedStatus === 'New Time Closed') {
          closedNowDays++;
        }
        break;
    }
  }
  
  return {
    totalDays: results.length,
    extendedDays,
    reducedDays,
    noChangeDays,
    closedNowDays,
    openNowDays,
    hasReducedHours: reducedDays > 0,
    hasExtendedHours: extendedDays > 0,
    shouldUpdate: reducedDays > 0,
  };
}