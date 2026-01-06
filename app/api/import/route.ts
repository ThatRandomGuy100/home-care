import { prisma } from "@/lib/prisma";
import { normalizePhone, parseTimeRange } from "@/lib/excelHelpers";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ error: "Excel file missing" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        const caregiver = await prisma.caregiver.upsert({
          where: { externalCode: row["Code"] },
          update: {
            name: row["Caregiver"],
            phone: normalizePhone(row["Mobile Number"]),
          },
          create: {
            name: row["Caregiver"],
            phone: normalizePhone(row["Mobile Number"]),
            externalCode: row["Code"],
          },
        });

        const patient = await prisma.patient.upsert({
          where: { admissionId: row["Admission ID"] },
          update: {
            name: row["Patient"],
          },
          create: {
            name: row["Patient"],
            admissionId: row["Admission ID"],
          },
        });

        const { start, end } = parseTimeRange(
          row["Visit Date"],
          row["Scheduled"]
        );

        const existingVisit = await prisma.visit.findUnique({
          where: { externalVisitId: row["Visit ID"] },
        });

        if (existingVisit) {
          skipped++;
          continue;
        }

        await prisma.$transaction(async (tx) => {
          const visit = await tx.visit.create({
            data: {
              externalVisitId: row["Visit ID"],
              caregiverId: caregiver.id,
              patientId: patient.id,
              startTime: start,
              endTime: end,
            },
          });

          await tx.smsJob.createMany({
            data: [
              { visitId: visit.id, type: "CLOCK_IN_BEFORE", sendAt: new Date(start.getTime() - 5 * 60000) },
              { visitId: visit.id, type: "CLOCK_IN_AFTER", sendAt: new Date(start.getTime() + 5 * 60000) },
              { visitId: visit.id, type: "CLOCK_OUT_BEFORE", sendAt: new Date(end.getTime() - 5 * 60000) },
              { visitId: visit.id, type: "CLOCK_OUT_AFTER", sendAt: new Date(end.getTime() + 5 * 60000) },
            ],
          });
        });

        created++;
      } catch (rowError) {
        console.error("ROW_FAILED", row, rowError);
      }
    }

    return Response.json({
      success: true,
      created,
      skipped,
      total: rows.length,
    });
  } catch (error) {
    console.error("EXCEL_IMPORT_ERROR", error);
    return Response.json({ error: "Import failed" }, { status: 500 });
  }
}
