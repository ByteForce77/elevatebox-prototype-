/**
 * Natural language time parser supporting English, Telugu, and Hindi
 * Converts spoken callback requests to Asia/Kolkata IST and UTC timestamps.
 */

export interface ParsedTimeResult {
  success: boolean;
  rawText: string;
  scheduledTimeIST: string;
  scheduledTimeUTC: string;
  formattedIST: string;
  confidence: number;
  interpretedSlot: string;
}

export function parseNaturalLanguageTime(text: string, referenceDate: Date = new Date()): ParsedTimeResult {
  const clean = text.toLowerCase().trim();
  
  // Reference in IST (UTC + 5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const targetDate = new Date(referenceDate.getTime() + istOffsetMs);
  
  let targetYear = targetDate.getUTCFullYear();
  let targetMonth = targetDate.getUTCMonth();
  let targetDay = targetDate.getUTCDate();
  
  let hour = 11; // default morning slot 11:00 AM
  let minute = 0;
  let slotName = 'Morning';
  let matched = false;

  // 1. Day resolution
  // Check for "tomorrow", "repu" (Telugu), "kal" (Hindi)
  if (clean.includes('tomorrow') || clean.includes('repu') || clean.includes('kal subah') || clean.includes('kal shaam') || clean.includes('kal dopahar') || clean.includes('kal ')) {
    targetDay += 1;
    matched = true;
  } else if (clean.includes('day after tomorrow') || clean.includes('ellundi') || clean.includes('parso') || clean.includes('parson')) {
    targetDay += 2;
    matched = true;
  } else if (clean.includes('today') || clean.includes('ee roju') || clean.includes('aaj')) {
    matched = true;
  }

  // 2. Specific Hour extraction (e.g., "11", "10am", "4pm", "5 ki", "11 gantalaki", "4 baje")
  const hourMatch = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|gantalaki|gantalu|ki|baje)?/i);
  
  if (hourMatch) {
    let parsedHour = parseInt(hourMatch[1], 10);
    const parsedMin = hourMatch[2] ? parseInt(hourMatch[2], 10) : 0;
    const modifier = (hourMatch[3] || '').toLowerCase();

    // Check am/pm or Telugu/Hindi contextual clues
    const isEvening = clean.includes('pm') || clean.includes('evening') || clean.includes('shaam') || clean.includes('sayantram') || clean.includes('night') || clean.includes('rat');
    const isMorning = clean.includes('am') || clean.includes('morning') || clean.includes('podduna') || clean.includes('subah') || clean.includes('pratahkall');
    const isAfternoon = clean.includes('afternoon') || clean.includes('dopahar') || clean.includes('madhyahnam');

    if (isEvening && parsedHour < 12) {
      parsedHour += 12;
    } else if (isAfternoon && parsedHour < 12 && parsedHour !== 12) {
      if (parsedHour <= 6) parsedHour += 12;
    } else if (isMorning && parsedHour === 12) {
      parsedHour = 0;
    } else if (modifier === 'pm' && parsedHour < 12) {
      parsedHour += 12;
    }

    if (parsedHour >= 0 && parsedHour <= 23) {
      hour = parsedHour;
      minute = parsedMin;
      matched = true;
    }
  } else {
    // Relative slot without explicit hour
    if (clean.includes('morning') || clean.includes('podduna') || clean.includes('subah')) {
      hour = 10;
      minute = 30;
      slotName = 'Morning';
      matched = true;
    } else if (clean.includes('afternoon') || clean.includes('dopahar') || clean.includes('madhyahnam')) {
      hour = 14;
      minute = 30;
      slotName = 'Afternoon';
      matched = true;
    } else if (clean.includes('evening') || clean.includes('shaam') || clean.includes('sayantram')) {
      hour = 17;
      minute = 30;
      slotName = 'Evening';
      matched = true;
    }
  }

  // Construct target Date in UTC representing that IST time
  // Target IST time is year, month, day, hour, minute.
  // To get UTC, subtract 5h 30m:
  const istDate = new Date(Date.UTC(targetYear, targetMonth, targetDay, hour, minute, 0));
  const utcDate = new Date(istDate.getTime() - istOffsetMs);

  const formattedHours = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
  const dayStr = istDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  });

  const formattedIST = `${dayStr}, ${formattedHours}:${minuteStr} ${ampm} IST`;

  return {
    success: matched,
    rawText: text,
    scheduledTimeIST: istDate.toISOString().replace('Z', '+05:30'),
    scheduledTimeUTC: utcDate.toISOString(),
    formattedIST,
    confidence: matched ? 0.94 : 0.65,
    interpretedSlot: `${slotName} (${formattedHours}:${minuteStr} ${ampm})`
  };
}
