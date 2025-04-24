import { Request, Response } from 'express';
import { sendInviteMail } from '../services/mailService';

export const handleInvite = async (req: Request, res: Response) => {
  const { email, sessionId } = req.body;

  try {
    await sendInviteMail(email, sessionId);
    res.json({ message: 'Invite sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send invite' });
  }
};
