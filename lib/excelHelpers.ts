import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// US Eastern timezone - handles DST automatically
const US_TIMEZONE = "America/New_York";

export function normalizePhone(phone: any): string {
  if (!phone) {
    throw new Error("Phone number missing");
  }

  const raw = phone.toString().trim();
  const cleaned = raw.replace(/\D/g, "");

  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }

  throw new Error(
    `Invalid US phone number. Expected +1XXXXXXXXXX: ${phone}`
  );
}

export function parseTimeRange(
  visitDate: string,
  scheduled: string
): { start: Date; end: Date } {
  // visitDate: MM/DD/YYYY
  // scheduled: "1300-1800"

  const [startStr, endStr] = scheduled.split("-");

  if (!startStr || !endStr) {
    throw new Error(`Invalid scheduled time format: ${scheduled}`);
  }

  const [month, day, year] = visitDate.split("/");

  if (!month || !day || !year) {
    throw new Error(`Invalid visit date format (MM/DD/YYYY expected): ${visitDate}`);
  }

  const baseDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const startTimeStr = `${startStr.slice(0, 2)}:${startStr.slice(2)}:00`;
  const endTimeStr = `${endStr.slice(0, 2)}:${endStr.slice(2)}:00`;

  // Parse times in US Eastern timezone (handles DST automatically)
  const start = dayjs.tz(`${baseDate} ${startTimeStr}`, US_TIMEZONE).toDate();
  const end = dayjs.tz(`${baseDate} ${endTimeStr}`, US_TIMEZONE).toDate();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error(`Failed to parse time range: ${visitDate} ${scheduled}`);
  }

  if (start >= end) {
    throw new Error(`Start time must be before end time: ${scheduled}`);
  }

  return { start, end };
}

/**
 * Get current time in US Eastern timezone
 */
export function getNowInUS(): Date {
  return dayjs().tz(US_TIMEZONE).toDate();
}

/**
 * Format a date to US Eastern timezone for logging
 */
export function formatUSDateTime(date: Date): string {
  return dayjs(date).tz(US_TIMEZONE).format("YYYY-MM-DD hh:mm:ss A z");
}

  