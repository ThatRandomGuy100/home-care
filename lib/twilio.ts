import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSms(to: string, body: string) {
  if (!process.env.TWILIO_FROM_NUMBER) {
    throw new Error("TWILIO_FROM_NUMBER not set");
  }

  return twilioClient.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER,
    body,
  });
}
