import { SmsType } from "@prisma/client";

export function buildSmsMessage(
  type: SmsType,
  patientName: string,
  startTime: Date,
  endTime: Date
): string {
  const start = startTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const end = endTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
