export function normalizePhone(phone: string): string {
    // Excel sometimes gives numbers like 9.172877e+09
    const cleaned = phone.toString().replace(/\D/g, "");
  
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
  
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      return `+${cleaned}`;
    }
  
    throw new Error(`Invalid phone number: ${phone}`);
  }
  
  export function parseTimeRange(
    visitDate: string,
    scheduled: string
  ): { start: Date; end: Date } {
    // scheduled: "1000-1600"
    const [startStr, endStr] = scheduled.split("-");
  
    const yearMonthDay = new Date(visitDate)
      .toISOString()
      .split("T")[0];
  
    const start = new Date(
      `${yearMonthDay}T${startStr.slice(0, 2)}:${startStr.slice(2)}:00+05:30`
    );
  
    const end = new Date(
      `${yearMonthDay}T${endStr.slice(0, 2)}:${endStr.slice(2)}:00+05:30`
    );
  
    return { start, end };
  }
  