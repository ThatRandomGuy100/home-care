import { prisma } from "@/lib/prisma";
import { SmsStatus } from "@prisma/client";

export async function GET() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [visitsToday, pendingSms, failedSms, skippedSms] = await Promise.all([
      prisma.visit.count({
        where: {
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      prisma.smsJob.count({
        where: {
          status: SmsStatus.PENDING,
        },
      }),

      prisma.smsJob.count({
        where: {
          status: SmsStatus.FAILED,
        },
      }),

      prisma.smsJob.count({
        where: {
          status: SmsStatus.SKIPPED,
        },
      }),
    ]);

    return Response.json({
      visitsToday,
      pendingSms,
      failedSms,
      skippedSms,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
