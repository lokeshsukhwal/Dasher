import { ComparisonResult, GroupedRemarks, FinalRemark } from '@/types';
import { formatTimeForDisplay } from './utils';

function formatDaysList(days: string[]): string {
  if (days.length === 0) return '';
  if (days.length === 1) return days[0];
  if (days.length === 2) return days.join(' and ');

  // Check for consecutive days
  const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const indices = days.map(d => allDays.indexOf(d)).sort((a, b) => a - b);

  let isConsecutive = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] - indices[i - 1] !== 1) {
      isConsecutive = false;
      break;
    }
  }

  if (isConsecutive && days.length >= 3) {
    return `${days[0]}-${days[days.length - 1]}`;
  }

  if (days.length === 7) {
    return 'Mon-Sun';
  }

  return days.slice(0, -1).join(', ') + ' and ' + days[days.length - 1];
}

function getShortDay(day: string): string {
  const map: Record<string, string> = {
    'Sunday': 'Sun',
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
  };
  return map[day] || day;
}

export function generateFinalRemarks(
  results: ComparisonResult[],
  grouped: GroupedRemarks
): FinalRemark[] {
  const remarks: FinalRemark[] = [];

  // Handle reduced hours (these should be updated)
  if (grouped.reduced.length > 0) {
    if (grouped.reduced.length === 1) {
      const r = grouped.reduced[0];
      remarks.push({
        title: `Single Hours Change [Hours Found / Reduce Hours]`,
        remark: `Hours change: ${r.dayRemark}`,
        type: 'reduced',
        actionRequired: true,
      });
    } else {
      const remarkLines = grouped.reduced.map((r: any) => `         ${r.dayRemark}`);
      remarks.push({
        title: `Multiple Hours Change [Hours Found / Reduce]`,
        remark: `Hours change:\n${remarkLines.join('\n')}`,
        type: 'reduced',
        actionRequired: true,
      });
    }
  }

  // Handle closed now
  if (grouped.closedNow.length > 0) {
    const days = grouped.closedNow.map((r: any) => r.day);
    const daysStr = formatDaysList(days);

    remarks.push({
      title: `Store Now Closed [${days.length} day(s)]`,
      remark: `Hours change: ${daysStr} is now Closed.\n` +
        grouped.closedNow.map((r: any) =>
          `         ${r.day}: was ${formatTimeForDisplay(r.oldHours.open)} - ${formatTimeForDisplay(r.oldHours.close)}, now Closed`
        ).join('\n'),
      type: 'reduced',
      actionRequired: true,
    });
  }

  // Handle extended hours (NOT changing)
  if (grouped.extended.length > 0) {
    const days = grouped.extended.map((r: any) => r.day);
    const daysStr = formatDaysList(days.map(getShortDay));

    // Group by change type
    const openTimeExtended = grouped.extended.filter((r: any) => r.changeDetails.openTimeExtended && !r.changeDetails.closeTimeExtended);
    const closeTimeExtended = grouped.extended.filter((r: any) => r.changeDetails.closeTimeExtended && !r.changeDetails.openTimeExtended);
    const fullTimeExtended = grouped.extended.filter((r: any) => r.changeDetails.openTimeExtended && r.changeDetails.closeTimeExtended);

    if (fullTimeExtended.length > 0) {
      const sample = fullTimeExtended[0];
      const fullDays = formatDaysList(fullTimeExtended.map((r: any) => getShortDay(r.day)));
      remarks.push({
        title: `Extended Hours - Full Time [Not Changing]`,
        remark: `Differing Hours [Not changing]: GMB shows that ${fullDays} fulltime is ` +
          `${formatTimeForDisplay(sample.newHours.open)}-${formatTimeForDisplay(sample.newHours.close)} ` +
          `[we have ${formatTimeForDisplay(sample.oldHours.open)} - ${formatTimeForDisplay(sample.oldHours.close)}]. ` +
          `Not changing, as this would extend store hours.`,
        type: 'extended',
        actionRequired: false,
      });
    }

    if (openTimeExtended.length > 0) {
      const sample = openTimeExtended[0];
      const openDays = formatDaysList(openTimeExtended.map((r: any) => getShortDay(r.day)));
      remarks.push({
        title: `Extended Hours - Open Time [Not Changing]`,
        remark: `Differing Hours [Not changing]: GMB shows that ${openDays} open time is ` +
          `${formatTimeForDisplay(sample.newHours.open)} [we have ${formatTimeForDisplay(sample.oldHours.open)}]. ` +
          `Not changing, as this would extend store hours.`,
        type: 'extended',
        actionRequired: false,
      });
    }

    if (closeTimeExtended.length > 0) {
      const sample = closeTimeExtended[0];
      const closeDays = formatDaysList(closeTimeExtended.map((r: any) => getShortDay(r.day)));
      remarks.push({
        title: `Extended Hours - End Time [Not Changing]`,
        remark: `Differing Hours [Not changing]: GMB shows that ${closeDays} end time is ` +
          `${formatTimeForDisplay(sample.newHours.close)} [we have ${formatTimeForDisplay(sample.oldHours.close)}]. ` +
          `Not changing, as this would extend store hours.`,
        type: 'extended',
        actionRequired: false,
      });
    }
  }

  // Handle became 24 hours
  if (grouped.became24Hours.length > 0) {
    const days = grouped.became24Hours.map((r: any) => r.day);
    const daysStr = formatDaysList(days.map(getShortDay));

    remarks.push({
      title: `Extended to 24 Hours [Not Changing]`,
      remark: `Differing Hours [Not changing]: GMB shows that ${daysStr} is now Open 24 hours. ` +
        `Not changing, as this would extend store hours.`,
      type: 'extended',
      actionRequired: false,
    });
  }

  // Handle no changes
  if (grouped.noChange.length > 0 && grouped.reduced.length === 0 && grouped.extended.length === 0 && grouped.closedNow.length === 0) {
    remarks.push({
      title: `Hours Found - No Change`,
      remark: `No change in hours.`,
      type: 'noChange',
      actionRequired: false,
    });
  }

  // If only extended and no change
  if (remarks.length === 0 && grouped.extended.length === 0 && grouped.noChange.length > 0) {
    remarks.push({
      title: `Hours Found - No Change`,
      remark: `No change in hours.`,
      type: 'noChange',
      actionRequired: false,
    });
  }

  return remarks;
}

export function generateCopyableRemark(remarks: FinalRemark[]): string {
  if (remarks.length === 0) {
    return 'No change in hours.';
  }

  const actionRequired = remarks.filter(r => r.actionRequired);
  const noAction = remarks.filter(r => !r.actionRequired);

  let output = '';

  if (actionRequired.length > 0) {
    output += '=== ACTION REQUIRED ===\n\n';
    actionRequired.forEach(r => {
      output += `${r.title}\n`;
      output += `Remark: ${r.remark}\n\n`;
    });
  }

  if (noAction.length > 0) {
    if (actionRequired.length > 0) {
      output += '=== NO ACTION NEEDED ===\n\n';
    }
    noAction.forEach(r => {
      output += `${r.title}\n`;
      output += `Remark: ${r.remark}\n\n`;
    });
  }

  return output.trim();
}