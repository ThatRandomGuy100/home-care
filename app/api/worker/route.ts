import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { buildSmsMessage } from "@/lib/smsTemplates";
import { SmsStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";


export async function GET() {
  try {
    console.log("🕒 Worker tick", new Date().toISOString());
    const now = new Date();
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

    for (const job of jobs) {
      try {
        const message = buildSmsMessage(
          job.type,
          job.visit.patient.name,
          job.visit.startTime,
          job.visit.endTime
        );

        await sendSms(job.visit.caregiver.phone, message);

        // 2️⃣ Mark SENT immediately (no ambiguity)
        await prisma.smsJob.update({
          where: { id: job.id },
          data: {
            status: SmsStatus.SENT,
            lastError: null,
          },
        });

        console.log("✅ SENT", job.type, job.id);
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
      now: now.toISOString(),
      processed: jobs.length,
      sent,
      failed,
    });
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: "Worker failed" }, { status: 500 });
  }
}
