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
        // ✅ Normalize & trim Excel values
        const caregiverName = row["Caregiver "]?.toString().trim();
        const caregiverCode = row["Code"]?.toString().trim();
        const caregiverPhone = normalizePhone(row["Mobile Number"]);
    
        const patientName = row["Patient "]?.toString().trim();
        const admissionId = row["Admission ID"]?.toString().trim();
    
        const visitId = row["Visit ID"]?.toString().trim();
        const visitDate = row["Visit Date"];
        const scheduled = row["Scheduled"];
    
        // 🚨 Hard validation (VERY IMPORTANT)
        if (!caregiverName || !caregiverCode || !caregiverPhone) {
          throw new Error("Invalid caregiver data");
        }
    
        if (!patientName || !admissionId) {
          throw new Error("Invalid patient data");
        }
    
        if (!visitId || !visitDate || !scheduled) {
          throw new Error("Invalid visit data");
        }
    
        // ✅ Caregiver upsert
        const caregiver = await prisma.caregiver.upsert({
          where: { externalCode: caregiverCode },
          update: {
            name: caregiverName,
            phone: caregiverPhone,
          },
          create: {
            name: caregiverName,
            phone: caregiverPhone,
            externalCode: caregiverCode,
          },
        });
    
        // ✅ Patient upsert
        const patient = await prisma.patient.upsert({
          where: { admissionId },
          update: {
            name: patientName,
          },
          create: {
            name: patientName,
            admissionId,
          },
        });
    
        // ✅ Time parsing
        const { start, end } = parseTimeRange(visitDate, scheduled);
    
        // ✅ Idempotency
        const existingVisit = await prisma.visit.findUnique({
          where: { externalVisitId: visitId },
        });
    
        if (existingVisit) {
          skipped++;
          continue;
        }
    
        // ✅ Transaction
        await prisma.$transaction(async (tx) => {
          const visit = await tx.visit.create({
            data: {
              externalVisitId: visitId,
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
        skipped++;
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
