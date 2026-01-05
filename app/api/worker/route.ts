import { startSmsScheduler } from "@/workers/smsScheduler";

let started = false;

export async function GET() {
  if (!started) {
    startSmsScheduler();
    started = true;
  }

  return Response.json({ worker: "running" });
}
