import { SmsType } from "@prisma/client";
import dayjs from "dayjs";

export function generateSmsSchedule(
  startTime: Date,
  endTime: Date
) {
  return [
    {
      type: SmsType.CLOCK_IN_BEFORE,
      sendAt: dayjs(startTime).subtract(5, "minute").toDate(),
    },
    {
      type: SmsType.CLOCK_IN_AFTER,
      sendAt: dayjs(startTime).add(5, "minute").toDate(),
    },
    {
      type: SmsType.CLOCK_OUT_BEFORE,
      sendAt: dayjs(endTime).subtract(5, "minute").toDate(),
    },
    {
      type: SmsType.CLOCK_OUT_AFTER,
      sendAt: dayjs(endTime).add(5, "minute").toDate(),
    },
  ];
}
