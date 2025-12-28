import { ComparisonResult, GroupedChanges, FinalRemark } from '@/types';
import { formatDayRange, DAY_SHORT } from './utils';

function getShortDaysList(results: ComparisonResult[]): string {
  const days = results.map(r => r.dayShort);
  return formatDayRange(results.map(r => r.day));
}

export function generateFinalRemarks(
  results: ComparisonResult[],
  grouped: GroupedChanges
): FinalRemark[] {
  const remarks: FinalRemark[] = [];
  
  // Collect all reduced changes
  const allReduced = [
    ...grouped.reducedOpen,
    ...grouped.reducedClose,
    ...grouped.reducedFull,
    ...grouped.closedNow,
  ];
  
  // Collect all extended changes
  const allExtended = [
    ...grouped.extendedOpen,
    ...grouped.extendedClose,
    ...grouped.extendedFull,
    ...grouped.blankToHours,
  ];
  
  // Generate remarks for REDUCED hours (Action Required)
  if (allReduced.length > 0) {
    if (allReduced.length === 1) {
      const r = allReduced[0];
      let remarkText = '';
      
      if (r.changeType === 'CLOSED_NOW') {
        remarkText = `Hours Change: ${r.day} is now Closed (was ${r.oldOpenTime} - ${r.oldCloseTime})`;
      } else {
        remarkText = `Hours Change: ${r.dayRemark}`;
      }
      
      remarks.push({
        title: 'Single Hour Change (Hours Found / Reduce Hours)',
        remark: remarkText,
        type: 'reduced',
        actionRequired: true,
        priority: 1,
      });
    } else {
      const remarkLines = allReduced.map(r => {
        if (r.changeType === 'CLOSED_NOW') {
          return `\t${r.day} is now Closed (was ${r.oldOpenTime} - ${r.oldCloseTime})`;
        }
        return `\t${r.dayRemark}`;
      });
      
      remarks.push({
        title: 'Multiple Hours Change (Hours Found / Reduce Hours)',
        remark: `Hours Change:\n${remarkLines.join('\n')}`,
        type: 'reduced',
        actionRequired: true,
        priority: 1,
      });
    }
  }
  
  // Generate remarks for EXTENDED hours (No Action Required)
  if (grouped.extendedClose.length > 0) {
    const daysStr = getShortDaysList(grouped.extendedClose);
    const sample = grouped.extendedClose[0];
    
    remarks.push({
      title: 'Extended Hours END Time',
      remark: `Differing Hours (Not Changing): GMB shows that ${daysStr} end time is ${sample.newCloseTime} (we have ${sample.oldCloseTime}). Not changing, as this would extend store hours.`,
      type: 'extended',
      actionRequired: false,
      priority: 2,
    });
  }
  
  if (grouped.extendedOpen.length > 0) {
    const daysStr = getShortDaysList(grouped.extendedOpen);
    const sample = grouped.extendedOpen[0];
    
    remarks.push({
      title: 'Extended Hours Open Time',
      remark: `Differing Hours (Not Changing): GMB shows that ${daysStr} open time is ${sample.newOpenTime} (we have ${sample.oldOpenTime}). Not changing, as this would extend store hours.`,
      type: 'extended',
      actionRequired: false,
      priority: 2,
    });
  }
  
  if (grouped.extendedFull.length > 0) {
    const daysStr = getShortDaysList(grouped.extendedFull);
    const sample = grouped.extendedFull[0];
    
    let newTimeStr = sample.newHours.is24Hours 
      ? 'Open 24 Hours' 
      : `${sample.newOpenTime}-${sample.newCloseTime}`;
    
    remarks.push({
      title: 'Extended Hours FULL Time',
      remark: `Differing Hours (Not Changing): GMB shows that ${daysStr} full time is ${newTimeStr} (we have ${sample.oldOpenTime}-${sample.oldCloseTime}). Not changing, as this would extend store hours.`,
      type: 'extended',
      actionRequired: false,
      priority: 2,
    });
  }
  
  // Handle blank to hours (For Blank MINT)
  if (grouped.blankToHours.length > 0) {
    const daysStr = getShortDaysList(grouped.blankToHours);
    const sample = grouped.blankToHours[0];
    
    remarks.push({
      title: 'For Blank MINT / If no Hours given on MINT',
      remark: `Differing Hours (Not Changing): GMB shows that ${daysStr} full time is ${sample.newOpenTime}-${sample.newCloseTime} (we have Closed). Not changing, as this would extend store hours.`,
      type: 'blank',
      actionRequired: false,
      priority: 3,
    });
  }
  
  // No changes
  if (allReduced.length === 0 && allExtended.length === 0) {
    remarks.push({
      title: 'Hours Found No Change',
      remark: 'No change in hours.',
      type: 'noChange',
      actionRequired: false,
      priority: 4,
    });
  }
  
  // Sort by priority
  return remarks.sort((a, b) => a.priority - b.priority);
}

export function generateCopyableRemark(remarks: FinalRemark[]): string {
  if (remarks.length === 0) {
    return 'No change in hours.';
  }
  
  const lines: string[] = [];
  
  remarks.forEach((r, index) => {
    if (index > 0) lines.push('');
    lines.push(`${r.title}:`);
    lines.push(`Remark: ${r.remark}`);
  });
  
  return lines.join('\n');
}

export function generateQuickRemark(remarks: FinalRemark[]): string {
  // Generate just the action-oriented remark
  const actionRequired = remarks.filter(r => r.actionRequired);
  
  if (actionRequired.length > 0) {
    return actionRequired.map(r => r.remark).join('\n\n');
  }
  
  const noAction = remarks.filter(r => !r.actionRequired);
  if (noAction.length > 0) {
    return noAction[0].remark;
  }
  
  return 'No change in hours.';
}