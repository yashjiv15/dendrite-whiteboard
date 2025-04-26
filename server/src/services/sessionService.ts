// src/services/sessionService.ts
import Session from "../models/Session";

export async function createSession(sessionId: string, userId: number, sessionExpiry: Date, email: string) {
  let session = await Session.findOne({ sessionId });

  if (!session) {
    session = new Session({ sessionId, userId, sessionExpiry, invitedEmails: [email] });
  } else {
    if (!session.invitedEmails.includes(email)) {
      session.invitedEmails.push(email);
    }
  }

  await session.save();
  return session;
}