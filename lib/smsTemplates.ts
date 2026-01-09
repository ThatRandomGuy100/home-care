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
      return `Caregiver Pro Reminder: You are scheduled for ${patientName} at ${start}. Please remember to Clock In.`;

    case "CLOCK_IN_AFTER":
      return `Gentle Reminder: Please Clock In  for ${patientName}.`;

    case "CLOCK_OUT_BEFORE":
      return `Caregiver Pro Reminder: Your schedule ends at ${end}. Please remember to Clock Out.`;

    case "CLOCK_OUT_AFTER":
      return `Gentle Reminder: Please Clock Out for ${patientName}.`;

    default:
      return "";
  }
}
