export function normalizePhone(phone: string): string {
  // Excel may give scientific notation or spaces
  const raw = phone.toString().trim();

  if (!raw.startsWith("+1")) {
    throw new Error(
      `Phone number must be US E.164 format (+1XXXXXXXXXX): ${phone}`
    );
  }

  const cleaned = raw.replace(/\D/g, "");

  // +1 + 10 digits = 11 digits total
  if (cleaned.length !== 11) {
    throw new Error(`Invalid US phone number length: ${phone}`);
  }

  return `+${cleaned}`;
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

  // US Eastern Time offset
  // NOTE: -05:00 works for now; DST handling can be added later if needed
  const start = new Date(
    `${baseDate}T${startStr.slice(0, 2)}:${startStr.slice(2)}:00-05:00`
  );

  const end = new Date(
    `${baseDate}T${endStr.slice(0, 2)}:${endStr.slice(2)}:00-05:00`
  );

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error(`Failed to parse time range: ${visitDate} ${scheduled}`);
  }

  if (start >= end) {
    throw new Error(`Start time must be before end time: ${scheduled}`);
  }

  return { start, end };
}

  