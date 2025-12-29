import { TimeSlot, DayHours, ParsedHours } from '@/types';
import { normalizeDay, DAYS_OF_WEEK } from './utils';

export function parseTimeSlot(timeString: string): TimeSlot {
  const cleaned = timeString.trim();
  const lowerCleaned = cleaned.toLowerCase();
  
  // Check for blank/empty
  if (!cleaned || lowerCleaned === 'blank' || lowerCleaned === '-' || lowerCleaned === 'n/a' || lowerCleaned === '') {
    return {
      open: null,
      close: null,
      is24Hours: false,
      isClosed: false,
      isBlank: true,
      rawText: 'Blank',
    };
  }
  
  // Check for closed
  if (lowerCleaned === 'closed' || lowerCleaned.includes('closed')) {
    return {
      open: null,
      close: null,
      is24Hours: false,
      isClosed: true,
      isBlank: false,
      rawText: 'Closed',
    };
  }
  
  // Check for 24 hours
  if (lowerCleaned.includes('24 hours') || lowerCleaned === 'open 24 hours' || lowerCleaned === '24 hrs' || lowerCleaned === '24hours') {
    return {
      open: '24 Hours',
      close: '24 Hours',
      is24Hours: true,
      isClosed: false,
      isBlank: false,
      rawText: 'Open 24 Hours',
    };
  }
  
  // Parse time range formats
  // Formats: "9:00 AM – 10:00 PM", "9 AM - 10 PM", "9:00AM-10:00PM", "9AM to 10PM"
  const timeRangePattern = /(\d{1,2}):?(\d{2})?\s*(AM|PM)?\s*[-–—to]+\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i;
  const match = cleaned.match(timeRangePattern);
  
  if (match) {
    let openHour = parseInt(match[1], 10);
    const openMin = match[2] || '00';
    let openPeriod = match[3]?.toUpperCase();
    
    let closeHour = parseInt(match[4], 10);
    const closeMin = match[5] || '00';
    let closePeriod = match[6]?.toUpperCase();
    
    // Infer AM/PM if not provided
    if (!closePeriod) {
      closePeriod = 'PM'; // Default to PM for closing time
    }
    if (!openPeriod) {
      openPeriod = openHour >= 6 && openHour <= 11 ? 'AM' : (openHour === 12 ? 'PM' : 'AM');
    }
    
    const openTime = `${openHour}:${openMin} ${openPeriod}`;
    const closeTime = `${closeHour}:${closeMin} ${closePeriod}`;
    
    return {
      open: openTime,
      close: closeTime,
      is24Hours: false,
      isClosed: false,
      isBlank: false,
      rawText: cleaned,
    };
  }
  
  // Return as blank if can't parse
  return {
    open: null,
    close: null,
    is24Hours: false,
    isClosed: false,
    isBlank: true,
    rawText: cleaned,
  };
}

export function parseNewBusinessHours(input: string): ParsedHours {
  const result: ParsedHours = {};
  const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
  
  let currentDay = '';
  let pendingNotes: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip header lines
    if (line.toLowerCase() === 'hours:' || 
        line.toLowerCase().includes('suggest new hours') ||
        line.toLowerCase() === 'hours') {
      continue;
    }
    
    // Check if line starts with a day name
    const dayMatch = line.match(/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i);
    
    if (dayMatch) {
      currentDay = normalizeDay(dayMatch[1]);
      const remainingText = line.substring(dayMatch[0].length).trim();
      
      if (remainingText) {
        // Check for notes in parentheses
        const noteMatch = remainingText.match(/\(([^)]+)\)/);
        if (noteMatch) {
          pendingNotes.push(noteMatch[1]);
        }
        
        const timeText = remainingText.replace(/\([^)]+\)/g, '').trim();
        if (timeText) {
          result[currentDay] = {
            day: currentDay,
            normalizedDay: currentDay,
            timeSlot: parseTimeSlot(timeText),
            notes: [...pendingNotes],
          };
          pendingNotes = [];
          currentDay = '';
        }
      }
    } else if (currentDay) {
      // This line might be time info or notes for the current day
      if (line.startsWith('(') || line.toLowerCase().includes('might differ') || line.toLowerCase().includes('hours might')) {
        pendingNotes.push(line.replace(/[()]/g, ''));
      } else if (line.toLowerCase().includes('open') || 
                 line.toLowerCase().includes('closed') || 
                 line.match(/\d/) ||
                 line.toLowerCase() === 'closed') {
        result[currentDay] = {
          day: currentDay,
          normalizedDay: currentDay,
          timeSlot: parseTimeSlot(line),
          notes: [...pendingNotes],
        };
        pendingNotes = [];
        currentDay = '';
      }
    }
  }
  
  return result;
}

export function parseOldBusinessHours(input: string): ParsedHours {
  const result: ParsedHours = {};
  const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
  
  for (const line of lines) {
    // Format: "Wednesday: 9:00 AM – 10:00 PM" or "Wednesday 9:00 AM – 10:00 PM"
    const dayPattern = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[:\s]+(.+)$/i;
    const match = line.match(dayPattern);
    
    if (match) {
      const day = normalizeDay(match[1]);
      const timeText = match[2].trim();
      
      result[day] = {
        day: day,
        normalizedDay: day,
        timeSlot: parseTimeSlot(timeText),
        notes: [],
      };
    }
  }
  
  return result;
}

export function ensureAllDays(hours: ParsedHours): ParsedHours {
  const result = { ...hours };
  
  for (const day of DAYS_OF_WEEK) {
    if (!result[day]) {
      result[day] = {
        day: day,
        normalizedDay: day,
        timeSlot: {
          open: null,
          close: null,
          is24Hours: false,
          isClosed: false,
          isBlank: true,
          rawText: 'Blank',
        },
        notes: [],
      };
    }
  }
  
  return result;
}