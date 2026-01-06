import { prisma } from "@/lib/prisma";
import { generateSmsSchedule } from "@/lib/smsScheduler";

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

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
