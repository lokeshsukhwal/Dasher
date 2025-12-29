import { ComparisonResult, GroupedChanges, FinalRemarks } from '@/types';
import { buildDayRange, normalizeTimeString, titleCase, SHORT_DAYS } from './utils';

type ReduceType = 'Full Time Reduced' | 'Start Time Reduced' | 'End Time Reduced' | 'Full Day Reduced';
type ExtendType = 'Full Time Extended' | 'Start Time Extended' | 'End Time Extended' | 'Full Day Extended';

function buildReduceRemarks(grouped: GroupedChanges): string[] {
  const remarks: string[] = [];
  
  const processType = (type: ReduceType, group: Record<string, string[]>) => {
    for (const key in group) {
      const days = group[key];
      if (days.length === 0) continue;
      
      // Build day range
      const dayRange = buildDayRange(days.map(d => {
        const idx = SHORT_DAYS.indexOf(d as any);
        return idx !== -1 ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx] : d;
      }));
      
      const [time1Raw, time2Raw] = key.split('|');
      const time1 = normalizeTimeString(time1Raw);
      const time2 = normalizeTimeString(time2Raw);
      
      // Format based on type
      let typeLabel = '';
      switch (type) {
        case 'Full Time Reduced':
        case 'Full Day Reduced':
          typeLabel = 'full time';
          break;
        case 'Start Time Reduced':
          typeLabel = 'start time';
          break;
        case 'End Time Reduced':
          typeLabel = 'end time';
          break;
      }
      
      if (time2.toLowerCase() === 'closed') {
        remarks.push(`${dayRange} ${typeLabel} from ${time1} to Closed`);
      } else {
        remarks.push(`${dayRange} ${typeLabel} from ${time1} to ${time2}`);
      }
    }
  };
  
  processType('Full Time Reduced', grouped.reduce['Full Time Reduced']);
  processType('Start Time Reduced', grouped.reduce['Start Time Reduced']);
  processType('End Time Reduced', grouped.reduce['End Time Reduced']);
  processType('Full Day Reduced', grouped.reduce['Full Day Reduced']);
  
  return remarks;
}

function buildExtendRemarks(grouped: GroupedChanges): string[] {
  const remarks: string[] = [];
  
  const processType = (type: ExtendType, group: Record<string, string[]>) => {
    for (const key in group) {
      const days = group[key];
      if (days.length === 0) continue;
      
      // Build day range
      const dayRange = buildDayRange(days.map(d => {
        const idx = SHORT_DAYS.indexOf(d as any);
        return idx !== -1 ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx] : d;
      }));
      
      const [time1Raw, time2Raw] = key.split('|');
      const time1 = normalizeTimeString(time1Raw);
      const time2 = normalizeTimeString(time2Raw);
      
      // Format based on type
      let typeLabel = '';
      switch (type) {
        case 'Full Time Extended':
        case 'Full Day Extended':
          typeLabel = 'full time';
          break;
        case 'Start Time Extended':
          typeLabel = 'open time';
          break;
        case 'End Time Extended':
          typeLabel = 'end time';
          break;
      }
      
      if (time2.toLowerCase() === 'closed') {
        remarks.push(`${dayRange} ${typeLabel} is ${time1} (we have Closed)`);
      } else {
        remarks.push(`${dayRange} ${typeLabel} is ${time1} (we have ${time2})`);
      }
    }
  };
  
  processType('Full Time Extended', grouped.extend['Full Time Extended']);
  processType('Start Time Extended', grouped.extend['Start Time Extended']);
  processType('End Time Extended', grouped.extend['End Time Extended']);
  processType('Full Day Extended', grouped.extend['Full Day Extended']);
  
  return remarks;
}

export function generateFinalRemarks(
  results: ComparisonResult[],
  grouped: GroupedChanges
): FinalRemarks {
  const reduceRemarks = buildReduceRemarks(grouped);
  const extendRemarks = buildExtendRemarks(grouped);
  
  let reduceRemark = '';
  let extendRemark = '';
  
  if (reduceRemarks.length > 0) {
    reduceRemark = titleCase(reduceRemarks.join('\n'), ['GMB', 'Closed', 'AM', 'PM']);
  }
  
  if (extendRemarks.length > 0) {
    const joinedRemarks = extendRemarks.join(', ');
    extendRemark = titleCase(
      `Differing Hours (Not Changing): GMB shows that ${joinedRemarks}. Not changing, as this would extend store hours.`,
      ['GMB', 'Closed', 'AM', 'PM']
    );
  }
  
  const hasReduceChanges = reduceRemarks.length > 0;
  const hasExtendChanges = extendRemarks.length > 0;
  const hasNoChanges = !hasReduceChanges && !hasExtendChanges;
  
  return {
    reduceRemark,
    extendRemark,
    hasReduceChanges,
    hasExtendChanges,
    hasNoChanges,
  };
}

export function generateCopyableRemark(finalRemarks: FinalRemarks): string {
  const lines: string[] = [];
  
  if (finalRemarks.hasNoChanges) {
    return 'No change in hours.';
  }
  
  if (finalRemarks.hasReduceChanges) {
    lines.push('Hours Change:');
    lines.push(finalRemarks.reduceRemark);
  }
  
  if (finalRemarks.hasExtendChanges) {
    if (lines.length > 0) lines.push('');
    lines.push(finalRemarks.extendRemark);
  }
  
  return lines.join('\n');
}

export function getReduceRemarkTitle(reduceRemark: string): string {
  const lines = reduceRemark.split('\n').filter(l => l.trim());
  
  if (lines.length === 0) return '';
  if (lines.length === 1) {
    return 'Single Hour Change (Hours Found / Reduce Hours)';
  }
  return 'Multiple Hours Change (Hours Found / Reduce Hours)';
}

export function getExtendRemarkTitle(): string {
  return 'Extended Hours (Not Changing)';
}