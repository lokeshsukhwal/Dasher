import { 
  TimeSlot, 
  ComparisonResult, 
  ChangeDetails, 
  ChangeType,
  ParsedHours,
  GroupedChanges,
  ComparisonSummary
} from '@/types';
import { timeToMinutes, DAYS_OF_WEEK, DAY_SHORT, formatTimeForDisplay } from './utils';
import { ensureAllDays } from './parser';

function getDisplayTime(slot: TimeSlot, isOpen: boolean): string {
  if (slot.isClosed) return 'Closed';
  if (slot.isBlank) return 'Blank';
  if (slot.is24Hours) return isOpen ? '12 AM' : '11:59 PM';
  
  const time = isOpen ? slot.open : slot.close;
  return formatTimeForDisplay(time);
}

function compareTimeSlots(oldSlot: TimeSlot, newSlot: TimeSlot): { changeDetails: ChangeDetails; changeType: ChangeType } {
  const changeDetails: ChangeDetails = {
    openTimeChanged: false,
    closeTimeChanged: false,
    openTimeExtended: false,
    closeTimeExtended: false,
    openTimeReduced: false,
    closeTimeReduced: false,
    became24Hours: false,
    becameClosed: false,
    wasClosedNowOpen: false,
    wasBlankNowHasHours: false,
    oldOpenTime: getDisplayTime(oldSlot, true),
    oldCloseTime: getDisplayTime(oldSlot, false),
    newOpenTime: getDisplayTime(newSlot, true),
    newCloseTime: getDisplayTime(newSlot, false),
  };
  
  // Handle blank old hours with new hours (extending)
  if ((oldSlot.isBlank || oldSlot.isClosed) && !newSlot.isBlank && !newSlot.isClosed) {
    changeDetails.wasBlankNowHasHours = true;
    changeDetails.openTimeExtended = true;
    changeDetails.closeTimeExtended = true;
    return { changeDetails, changeType: 'BLANK_TO_HOURS' };
  }
  
  // Handle closed scenarios
  if (newSlot.isClosed && !oldSlot.isClosed && !oldSlot.isBlank) {
    changeDetails.becameClosed = true;
    return { changeDetails, changeType: 'CLOSED_NOW' };
  }
  
  if (!newSlot.isClosed && oldSlot.isClosed) {
    changeDetails.wasClosedNowOpen = true;
    return { changeDetails, changeType: 'OPEN_NOW' };
  }
  
  if ((newSlot.isClosed && oldSlot.isClosed) || (newSlot.isBlank && oldSlot.isBlank)) {
    return { changeDetails, changeType: 'NO_CHANGE' };
  }
  
  // Handle 24 hours scenarios
  if (newSlot.is24Hours && !oldSlot.is24Hours && !oldSlot.isBlank) {
    changeDetails.became24Hours = true;
    changeDetails.openTimeExtended = true;
    changeDetails.closeTimeExtended = true;
    return { changeDetails, changeType: 'EXTENDED_FULL' };
  }
  
  if (!newSlot.is24Hours && oldSlot.is24Hours) {
    changeDetails.openTimeReduced = true;
    changeDetails.closeTimeReduced = true;
    return { changeDetails, changeType: 'REDUCED_FULL' };
  }
  
  if (newSlot.is24Hours && oldSlot.is24Hours) {
    return { changeDetails, changeType: 'NO_CHANGE' };
  }
  
  // Compare actual times
  const oldOpenMins = timeToMinutes(oldSlot.open);
  const oldCloseMins = timeToMinutes(oldSlot.close);
  const newOpenMins = timeToMinutes(newSlot.open);
  const newCloseMins = timeToMinutes(newSlot.close);
  
  // Check open time changes
  if (oldOpenMins !== null && newOpenMins !== null) {
    if (newOpenMins !== oldOpenMins) {
      changeDetails.openTimeChanged = true;
      if (newOpenMins < oldOpenMins) {
        // Opens earlier = extended
        changeDetails.openTimeExtended = true;
      } else {
        // Opens later = reduced
        changeDetails.openTimeReduced = true;
      }
    }
  }
  
  // Check close time changes
  if (oldCloseMins !== null && newCloseMins !== null) {
    if (newCloseMins !== oldCloseMins) {
      changeDetails.closeTimeChanged = true;
      if (newCloseMins > oldCloseMins) {
        // Closes later = extended
        changeDetails.closeTimeExtended = true;
      } else {
        // Closes earlier = reduced
        changeDetails.closeTimeReduced = true;
      }
    }
  }
  
  // Determine overall change type
  let changeType: ChangeType = 'NO_CHANGE';
  
  if (changeDetails.openTimeChanged || changeDetails.closeTimeChanged) {
    const hasOpenChange = changeDetails.openTimeChanged;
    const hasCloseChange = changeDetails.closeTimeChanged;
    
    if (hasOpenChange && hasCloseChange) {
      // Both changed
      if (changeDetails.openTimeExtended || changeDetails.closeTimeExtended) {
        if (changeDetails.openTimeReduced || changeDetails.closeTimeReduced) {
          // Mixed - check net effect
          const oldDuration = (oldCloseMins ?? 0) - (oldOpenMins ?? 0);
          const newDuration = (newCloseMins ?? 0) - (newOpenMins ?? 0);
          changeType = newDuration > oldDuration ? 'EXTENDED_FULL' : 'REDUCED_FULL';
        } else {
          changeType = 'EXTENDED_FULL';
        }
      } else {
        changeType = 'REDUCED_FULL';
      }
    } else if (hasOpenChange) {
      changeType = changeDetails.openTimeExtended ? 'EXTENDED_OPEN' : 'REDUCED_OPEN';
    } else if (hasCloseChange) {
      changeType = changeDetails.closeTimeExtended ? 'EXTENDED_CLOSE' : 'REDUCED_CLOSE';
    }
  }
  
  return { changeDetails, changeType };
}

function getStatus(changeType: ChangeType): 'Extended' | 'Reduced' | 'No Change' | 'Closed Now' | 'Open Now' {
  switch (changeType) {
    case 'EXTENDED_OPEN':
    case 'EXTENDED_CLOSE':
    case 'EXTENDED_FULL':
    case 'BECAME_24_HOURS':
    case 'BLANK_TO_HOURS':
      return 'Extended';
    case 'REDUCED_OPEN':
    case 'REDUCED_CLOSE':
    case 'REDUCED_FULL':
      return 'Reduced';
    case 'CLOSED_NOW':
      return 'Closed Now';
    case 'OPEN_NOW':
      return 'Open Now';
    default:
      return 'No Change';
  }
}

function getChangeCategory(changeType: ChangeType, changeDetails: ChangeDetails): 'Opening Time' | 'End Time' | 'Full Day' | 'No Change' | 'Status Change' {
  switch (changeType) {
    case 'EXTENDED_OPEN':
    case 'REDUCED_OPEN':
      return 'Opening Time';
    case 'EXTENDED_CLOSE':
    case 'REDUCED_CLOSE':
      return 'End Time';
    case 'EXTENDED_FULL':
    case 'REDUCED_FULL':
    case 'BLANK_TO_HOURS':
      return 'Full Day';
    case 'CLOSED_NOW':
    case 'OPEN_NOW':
      return 'Status Change';
    default:
      return 'No Change';
  }
}

function generateDayRemark(
  day: string, 
  oldSlot: TimeSlot, 
  newSlot: TimeSlot, 
  changeDetails: ChangeDetails, 
  changeType: ChangeType
): string {
  const oldOpen = getDisplayTime(oldSlot, true);
  const oldClose = getDisplayTime(oldSlot, false);
  const newOpen = getDisplayTime(newSlot, true);
  const newClose = getDisplayTime(newSlot, false);
  
  switch (changeType) {
    case 'NO_CHANGE':
      return 'No Change';
      
    case 'CLOSED_NOW':
      return `${day} (Status): Now Closed (was ${oldOpen} - ${oldClose})`;
      
    case 'OPEN_NOW':
      return `${day} (Status): Now Open ${newOpen} - ${newClose} (was Closed)`;
      
    case 'BLANK_TO_HOURS':
      return `${day} (Full Day): From (Closed) to (${newOpen} - ${newClose})`;
      
    case 'EXTENDED_FULL':
    case 'REDUCED_FULL':
      return `${day} (Full Day): From (${oldOpen} - ${oldClose}) to (${newOpen} - ${newClose})`;
      
    case 'EXTENDED_OPEN':
    case 'REDUCED_OPEN':
      return `${day} (Opening Time): From ${oldOpen} to ${newOpen}`;
      
    case 'EXTENDED_CLOSE':
    case 'REDUCED_CLOSE':
      return `${day} (End Time): From ${oldClose} to ${newClose}`;
      
    default:
      return 'No Change';
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
    
    const { changeDetails, changeType } = compareTimeSlots(
      oldDayData.timeSlot, 
      newDayData.timeSlot
    );
    
    const dayRemark = generateDayRemark(
      day,
      oldDayData.timeSlot,
      newDayData.timeSlot,
      changeDetails,
      changeType
    );
    
    results.push({
      day,
      dayShort: DAY_SHORT[day] || day,
      newOpenTime: getDisplayTime(newDayData.timeSlot, true),
      newCloseTime: getDisplayTime(newDayData.timeSlot, false),
      oldOpenTime: getDisplayTime(oldDayData.timeSlot, true),
      oldCloseTime: getDisplayTime(oldDayData.timeSlot, false),
      oldHours: oldDayData.timeSlot,
      newHours: newDayData.timeSlot,
      changeType,
      changeDetails,
      status: getStatus(changeType),
      dayRemark,
      changeCategory: getChangeCategory(changeType, changeDetails),
    });
  }
  
  return results;
}

export function groupResults(results: ComparisonResult[]): GroupedChanges {
  return {
    reducedOpen: results.filter(r => r.changeType === 'REDUCED_OPEN'),
    reducedClose: results.filter(r => r.changeType === 'REDUCED_CLOSE'),
    reducedFull: results.filter(r => r.changeType === 'REDUCED_FULL'),
    extendedOpen: results.filter(r => r.changeType === 'EXTENDED_OPEN'),
    extendedClose: results.filter(r => r.changeType === 'EXTENDED_CLOSE'),
    extendedFull: results.filter(r => r.changeType === 'EXTENDED_FULL' || r.changeType === 'BECAME_24_HOURS'),
    noChange: results.filter(r => r.changeType === 'NO_CHANGE'),
    closedNow: results.filter(r => r.changeType === 'CLOSED_NOW'),
    openNow: results.filter(r => r.changeType === 'OPEN_NOW'),
    blankToHours: results.filter(r => r.changeType === 'BLANK_TO_HOURS'),
  };
}

export function calculateSummary(results: ComparisonResult[]): ComparisonSummary {
  const grouped = groupResults(results);
  
  const reducedCount = grouped.reducedOpen.length + grouped.reducedClose.length + grouped.reducedFull.length + grouped.closedNow.length;
  const extendedCount = grouped.extendedOpen.length + grouped.extendedClose.length + grouped.extendedFull.length + grouped.blankToHours.length;
  
  return {
    totalDays: results.length,
    extendedDays: extendedCount,
    reducedDays: reducedCount,
    noChangeDays: grouped.noChange.length,
    closedNowDays: grouped.closedNow.length,
    openNowDays: grouped.openNow.length,
    hasReducedHours: reducedCount > 0,
    hasExtendedHours: extendedCount > 0,
    shouldUpdate: reducedCount > 0,
  };
}