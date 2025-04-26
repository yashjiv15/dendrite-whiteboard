// src/routes/sessionRoutes.js
import express from 'express';
import { createSession } from '../controllers/sessionController';

const router = express.Router();

/**
 * @swagger
 * /api/create-session:
 *   post:
 *     summary: Create a new session
 *     description: Creates a new session for the whiteboard.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: {}
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */
router.post('/create-session', createSession);

export default router;