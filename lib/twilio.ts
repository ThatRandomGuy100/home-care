import twilio from "twilio";
import * as Sentry from "@sentry/nextjs";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSms(to: string, body: string) {
  try{
    if (!process.env.TWILIO_FROM_NUMBER) {
      throw new Error("TWILIO_FROM_NUMBER not set");
    }
  
    return twilioClient.messages.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER,
      body,
    });
  }catch(error){
    console.error("Error sending SMS", error);
    Sentry.captureException(error);
    throw error;
  }
 
}
