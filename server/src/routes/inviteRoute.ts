// src/routes/inviteRoutes.js
import { Router } from 'express';
import { handleInvite } from '../controllers/inviteController';

const router = Router();

/**
 * @swagger
 * /api/send-invite:
 *   post:
 *     summary: Send an invite
 *     description: Sends an invite to a user for the whiteboard session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user to invite.
 *               sessionId:
 *                 type: string
 *                 description: The ID of the session to which the user is invited.
 *     responses:
 *       200:
 *         description: Invite sent successfully
 *       400:
 *         description: Invalid input
 */
router.post('/send-invite', handleInvite);

export default router;