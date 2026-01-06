import { prisma } from "@/lib/prisma";

export async function GET() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [visitsToday, pendingSms, failedSms] = await Promise.all([
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
        status: "PENDING",
      },
    }),

    prisma.smsJob.count({
      where: {
        status: "FAILED",
      },
    }),
  ]);

  return Response.json({
    visitsToday,
    pendingSms,
    failedSms,
  });
}
