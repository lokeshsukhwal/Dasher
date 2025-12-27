import { 
  TimeSlot, 
  ComparisonResult, 
  ChangeDetails, 
  ChangeType,
  ParsedHours,
  GroupedRemarks,
  ComparisonSummary
} from '@/types';
import { timeToMinutes, DAYS_OF_WEEK, formatTimeForDisplay } from './utils';
import { ensureAllDays } from './parser';

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
  };
  
  // Handle closed scenarios
  if (newSlot.isClosed && !oldSlot.isClosed) {
    changeDetails.becameClosed = true;
    return { changeDetails, changeType: 'CLOSED_NOW' };
  }
  
  if (!newSlot.isClosed && oldSlot.isClosed) {
    changeDetails.wasClosedNowOpen = true;
    return { changeDetails, changeType: 'OPEN_NOW' };
  }
  
  if (newSlot.isClosed && oldSlot.isClosed) {
    return { changeDetails, changeType: 'NO_CHANGE' };
  }
  
  // Handle 24 hours scenarios
  if (newSlot.is24Hours && !oldSlot.is24Hours) {
    changeDetails.became24Hours = true;
    changeDetails.openTimeExtended = true;
    changeDetails.closeTimeExtended = true;
    return { changeDetails, changeType: 'EXTENDED' };
  }
  
  if (!newSlot.is24Hours && oldSlot.is24Hours) {
    changeDetails.openTimeReduced = true;
    changeDetails.closeTimeReduced = true;
    return { changeDetails, changeType: 'REDUCED' };
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
    const hasExtension = changeDetails.openTimeExtended || changeDetails.closeTimeExtended;
    const hasReduction = changeDetails.openTimeReduced || changeDetails.closeTimeReduced;
    
    if (hasExtension && !hasReduction) {
      changeType = 'EXTENDED';
    } else if (hasReduction && !hasExtension) {
      changeType = 'REDUCED';
    } else if (hasExtension && hasReduction) {
      // Mixed - calculate net effect
      const oldDuration = (oldCloseMins ?? 0) - (oldOpenMins ?? 0);
      const newDuration = (newCloseMins ?? 0) - (newOpenMins ?? 0);
      
      changeType = newDuration > oldDuration ? 'EXTENDED' : 'REDUCED';
    }
  }
  
  return { changeDetails, changeType };
}

function generateDayRemark(
  day: string, 
  oldSlot: TimeSlot, 
  newSlot: TimeSlot, 
  changeDetails: ChangeDetails, 
  changeType: ChangeType
): { remark: string; category: 'open' | 'close' | 'full' | 'none' | 'status' } {
  if (changeType === 'NO_CHANGE') {
    return { remark: 'No change', category: 'none' };
  }
  
  if (changeType === 'CLOSED_NOW') {
    return { 
      remark: `${day}: Now Closed (was ${formatTimeForDisplay(oldSlot.open)} - ${formatTimeForDisplay(oldSlot.close)})`,
      category: 'status'
    };
  }
  
  if (changeType === 'OPEN_NOW') {
    return { 
      remark: `${day}: Now Open ${formatTimeForDisplay(newSlot.open)} - ${formatTimeForDisplay(newSlot.close)} (was Closed)`,
      category: 'status'
    };
  }
  
  if (newSlot.is24Hours && !oldSlot.is24Hours) {
    return {
      remark: `${day}[Fullday]: from [${formatTimeForDisplay(oldSlot.open)} to ${formatTimeForDisplay(oldSlot.close)}] to [Open 24 hours]`,
      category: 'full'
    };
  }
  
  const parts: string[] = [];
  let category: 'open' | 'close' | 'full' | 'none' | 'status' = 'none';
  
  if (changeDetails.openTimeChanged && changeDetails.closeTimeChanged) {
    parts.push(
      `${day}[Fullday]: from [${formatTimeForDisplay(oldSlot.open)} to ${formatTimeForDisplay(oldSlot.close)}] to [${formatTimeForDisplay(newSlot.open)} to ${formatTimeForDisplay(newSlot.close)}]`
    );
    category = 'full';
  } else if (changeDetails.openTimeChanged) {
    parts.push(
      `${day}[Opentime]: from ${formatTimeForDisplay(oldSlot.open)} to ${formatTimeForDisplay(newSlot.open)}`
    );
    category = 'open';
  } else if (changeDetails.closeTimeChanged) {
    parts.push(
      `${day}[Endtime]: from ${formatTimeForDisplay(oldSlot.close)} to ${formatTimeForDisplay(newSlot.close)}`
    );
    category = 'close';
  }
  
  return { remark: parts.join('; '), category };
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
    
    const { remark, category } = generateDayRemark(
      day,
      oldDayData.timeSlot,
      newDayData.timeSlot,
      changeDetails,
      changeType
    );
    
    results.push({
      day,
      oldHours: oldDayData.timeSlot,
      newHours: newDayData.timeSlot,
      changeType,
      changeDetails,
      dayRemark: remark,
      changeCategory: category,
    });
  }
  
  return results;
}

export function groupResults(results: ComparisonResult[]): GroupedRemarks {
  return {
    extended: results.filter(r => r.changeType === 'EXTENDED'),
    reduced: results.filter(r => r.changeType === 'REDUCED'),
    noChange: results.filter(r => r.changeType === 'NO_CHANGE'),
    closedNow: results.filter(r => r.changeType === 'CLOSED_NOW'),
    openNow: results.filter(r => r.changeType === 'OPEN_NOW'),
    became24Hours: results.filter(r => r.changeDetails.became24Hours),
  };
}

export function calculateSummary(results: ComparisonResult[]): ComparisonSummary {
  const grouped = groupResults(results);
  
  return {
    totalDays: results.length,
    extendedDays: grouped.extended.length,
    reducedDays: grouped.reduced.length,
    noChangeDays: grouped.noChange.length,
    closedNowDays: grouped.closedNow.length,
    openNowDays: grouped.openNow.length,
    hasChanges: grouped.reduced.length > 0 || grouped.closedNow.length > 0,
    shouldUpdate: grouped.reduced.length > 0 || grouped.closedNow.length > 0,
  };
}