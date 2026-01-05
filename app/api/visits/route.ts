import { prisma } from "@/lib/prisma";
import { generateSmsSchedule } from "@/lib/smsScheduler";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { caregiverId, patientId, startTime, endTime } = body;

    if (!caregiverId || !patientId || !startTime || !endTime) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return Response.json(
        { error: "startTime must be before endTime" },
        { status: 400 }
      );
    }

    const smsSchedule = generateSmsSchedule(start, end);

    const visit = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create Visit
      const createdVisit = await tx.visit.create({
        data: {
          caregiverId,
          patientId,
          startTime: start,
          endTime: end,
        },
      });

      // 2️⃣ Create SMS Jobs
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
