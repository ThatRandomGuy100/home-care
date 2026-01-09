import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { buildSmsMessage } from "@/lib/smsTemplates";
import { formatUSDateTime } from "@/lib/excelHelpers";
import { SmsStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

// Skip SMS jobs that are more than 30 minutes past their scheduled time
// These are considered "stale" - sending them late would be counterproductivexce
const ALLOWED_DRIFT_MS = 2 * 60 * 1000; // ±2 minutes


export async function GET() {
  try {
    const now = new Date();
    console.log("🕒 Worker tick (UTC):", now.toISOString());
    console.log("🕒 Worker tick (US Eastern):", formatUSDateTime(now));

    // 1️⃣ Pull ALL pending jobs that should have been sent already
    const jobs = await prisma.smsJob.findMany({
      where: {
        status: SmsStatus.PENDING,
        sendAt: {
          lte: now,
        },
        retryCount: {
          lt: 3,
        },
      },
      orderBy: { sendAt: "asc" },
      include: {
        visit: {
          include: {
            caregiver: true,
            patient: true,
          },
        },
      },
    });

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const job of jobs) {
      const timeSinceScheduled = now.getTime() - job.sendAt.getTime();

      // 2️⃣ Skip stale jobs (more than ±2 minutes past scheduled time)
      if (timeSinceScheduled > ALLOWED_DRIFT_MS) {
        await prisma.smsJob.update({
          where: { id: job.id },
          data: {
            status: SmsStatus.SKIPPED,
            lastError: `Skipped: ${Math.round(timeSinceScheduled / 60000)} minutes past scheduled time`,
          },
        });

        console.warn(
          `⏭️ SKIPPED (stale)`,
          job.type,
          job.id,
          `scheduled: ${formatUSDateTime(job.sendAt)}`,
          `now: ${formatUSDateTime(now)}`
        );
        skipped++;
        continue;
      }

      try {
        const message = buildSmsMessage(
          job.type,
          job.visit.patient.name,
          job.visit.startTime,
          job.visit.endTime
        );

        await sendSms(job.visit.caregiver.phone, message);

        // 3️⃣ Mark SENT immediately (no ambiguity)
        await prisma.smsJob.update({
          where: { id: job.id },
          data: {
            status: SmsStatus.SENT,
            lastError: null,
          },
        });

        console.log("✅ SENT", job.type, job.id, `scheduled: ${formatUSDateTime(job.sendAt)}`);
        sent++;
      } catch (err: any) {
        const retries = job.retryCount + 1;

        Sentry.captureMessage("SMS_SEND_FAILED", {
          level: "error",
          extra: {
            smsJobId: job.id,
            visitId: job.visitId,
            smsType: job.type,
            phone: job.visit.caregiver.phone,
            retryCount: retries,
            error: err?.message ?? "Unknown error",
          },
        });

        await prisma.smsJob.update({
          where: { id: job.id },
          data: {
            retryCount: retries,
            status: retries >= 3 ? SmsStatus.FAILED : SmsStatus.PENDING,
            lastError: err?.message ?? "Unknown error",
          },
        });

        console.error("❌ FAILED", job.type, job.id, err?.message);
        failed++;
      }
    }

    return Response.json({
      worker: "executed",
      now_utc: now.toISOString(),
      now_us_eastern: formatUSDateTime(now),
      processed: jobs.length,
      sent,
      failed,
      skipped,
    });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: "Worker failed" }, { status: 500 });
  }
}
