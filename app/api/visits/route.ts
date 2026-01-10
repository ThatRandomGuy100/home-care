import { prisma } from "@/lib/prisma";
import { generateSmsSchedule } from "@/lib/smsScheduler";
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      externalVisitId,
      caregiverId,
      patientId,
      startTime,
      endTime,
    } = body;

    if (
      !externalVisitId ||
      !caregiverId ||
      !patientId ||
      !startTime ||
      !endTime
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return Response.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return Response.json(
        { error: "startTime must be before endTime" },
        { status: 400 }
      );
    }

    // 2️⃣ Idempotency check (VERY IMPORTANT)
    const existingVisit = await prisma.visit.findUnique({
      where: { externalVisitId },
    });

    if (existingVisit) {
      return Response.json({
        success: true,
        visitId: existingVisit.id,
        message: "Visit already exists (idempotent)",
      });
    }

    // 3️⃣ Generate SMS schedule
    const smsSchedule = generateSmsSchedule(start, end);

    const visit = await prisma.$transaction(async (tx) => {
      const createdVisit = await tx.visit.create({
        data: {
          externalVisitId,
          caregiverId,
          patientId,
          startTime: start,
          endTime: end,
        },
      });

      await tx.smsJob.createMany({
        data: smsSchedule.map((job) => ({
          visitId: createdVisit.id,
          type: job.type,
          sendAt: job.sendAt,
        })),
      });

      return createdVisit;
    });

    return Response.json({
      success: true,
      visitId: visit.id,
    });
  } catch (error) {
    console.error("VISIT_CREATE_ERROR", error);
    Sentry.captureException(error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = Math.max(0, parseInt(searchParams.get("skip") || "0", 10));
  const take = Math.min(100, Math.max(1, parseInt(searchParams.get("take") || "50", 10)));

  const visits = await prisma.visit.findMany({
    orderBy: { startTime: "desc" },
    skip,
    take,
    include: {
      caregiver: {
        select: { name: true },
      },
      patient: {
        select: { name: true },
      },
      smsJobs: {
        select: { status: true },
      },
    },
  });

  // 🔑 Explicit serialization (THIS FIXES TURBOPACK)
  const safeVisits = visits.map((v) => ({
    id: v.id,
    startTime: v.startTime.toISOString(),
    endTime: v.endTime.toISOString(),
    caregiver: v.caregiver,
    patient: v.patient,
    smsJobs: v.smsJobs,
  }));

  return Response.json(safeVisits);
}

