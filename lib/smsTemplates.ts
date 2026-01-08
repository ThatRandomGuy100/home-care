import { SmsType } from "@prisma/client";

function formatUSTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}


export function buildSmsMessage(
  type: SmsType,
  patientName: string,
  startTime: Date,
  endTime: Date
): string {
  const start = formatUSTime(startTime);
  const end = formatUSTime(endTime);

  switch (type) {
    case "CLOCK_IN_BEFORE":
      return `Please perform your ClockIN for ${patientName} at ${start}.`;

    case "CLOCK_IN_AFTER":
      return `Gentle Reminder: Please ClockIN for ${patientName}.`;

    case "CLOCK_OUT_BEFORE":
      return `Please perform your ClockOUT for ${patientName} at ${end}.`;

    case "CLOCK_OUT_AFTER":
      return `Gentle Reminder: Please ClockOUT for ${patientName}.`;

    default:
      return "";
  }
}
