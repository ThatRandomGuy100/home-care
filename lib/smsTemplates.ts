import { SmsType } from "@prisma/client";
import dayjs from "dayjs";

export function buildSmsMessage(
  type: SmsType,
  patientName: string,
  time: Date
) {
  const formattedTime = dayjs(time).format("hh:mm A");

  switch (type) {
    case "CLOCK_IN_BEFORE":
      return `Please perform your ClockIN for ${patientName} at ${formattedTime}.`;

    case "CLOCK_IN_AFTER":
      return `Gentle Reminder – Do not forget to ClockIN for ${patientName}.`;

    case "CLOCK_OUT_BEFORE":
      return `Please perform your ClockOUT for ${patientName} at ${formattedTime}.`;

    case "CLOCK_OUT_AFTER":
      return `Gentle Reminder – Do not forget to ClockOUT for ${patientName}.`;

    default:
      return "";
  }
}
