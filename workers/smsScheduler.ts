import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { twilioClient } from "@/lib/twilio";
import { buildSmsMessage } from "@/lib/smsTemplates";

const MAX_RETRIES = 3;

export function startSmsScheduler() {
  cron.schedule("*/30 * * * * *", async () => {
    const now = new Date();

    const jobs = await prisma.smsJob.findMany({
      where: {
        status: "PENDING",
        sendAt: { lte: now },
        retryCount: { lt: MAX_RETRIES },
      },
      include: {
        visit: {
          include: {
            caregiver: true,
            patient: true,
          },
        },
      },
      take: 10, // batch size (safe)
    });

    for (const job of jobs) {
      try {
        const message = buildSmsMessage(
          job.type,
          job.visit.patient.name,
          job.visit.startTime,
  job.visit.endTime,
        );

        await twilioClient.messages.create({
          to: job.visit.caregiver.phone,
          from: process.env.TWILIO_FROM_NUMBER!,
          body: message,
        });

        await prisma.smsJob.update({
          where: { id: job.id },
          data: {
            status: "SENT",
          },
        });

        console.log(`✅ SMS SENT → ${job.type}`);
      } catch (error: any) {
        console.error("❌ SMS FAILED", error.message);

        await prisma.smsJob.update({
          where: { id: job.id },
          data: {
            retryCount: { increment: 1 },
            lastError: error.message,
            status:
              job.retryCount + 1 >= MAX_RETRIES ? "FAILED" : "PENDING",
          },
        });
      }
    }
  });
}
