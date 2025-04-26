import { Router } from 'express';
import { WhiteBoardController } from '../controllers/WhiteBoardController';

const router = Router();
const whiteBoardController = new WhiteBoardController();

/**
 * @swagger
 * /api/whiteboard:
 *   post:
 *     summary: Create a new whiteboard entry
 *     description: Creates a new whiteboard entry for a specific session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *               drawing_assets:
 *                 type: object
 *     responses:
 *       201:
 *         description: Whiteboard entry created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */
router.post('/', whiteBoardController.create.bind(whiteBoardController));

/**
 * @swagger
 * /api/whiteboard/{id}:
 *   put:
 *     summary: Update a whiteboard entry
 *     description: Updates the drawing assets of a specific whiteboard entry.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the whiteboard entry to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drawing_assets:
 *                 type: object
 *     responses:
 *       200:
 *         description: Whiteboard entry updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Whiteboard entry not found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', whiteBoardController.update.bind(whiteBoardController));

/**
 * @swagger
 * /api/whiteboard/{id}:
 *   delete:
 *     summary: Delete a whiteboard entry
 *     description: Deletes a specific whiteboard entry.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the whiteboard entry to delete
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Whiteboard entry deleted successfully
 *       404:
 *         description: Whiteboard entry not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', whiteBoardController.delete.bind(whiteBoardController));

/**
 * @swagger
 * /api/whiteboard/session/{sessionId}:
 *   get:
 *     summary: Get whiteboard entries by session ID
 *     description: Retrieves all whiteboard entries associated with a specific session ID.
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         description: The ID of the session to retrieve whiteboard entries for
 *         schema:
 *           type: string  # Change from integer to string
 *     responses:
 *       200:
 *         description: List of whiteboard entries
 *       404:
 *         description: No whiteboard entries found for the session
 *       500:
 *         description: Internal Server Error
 */
router.get('/session/:sessionId', whiteBoardController.getBySessionId.bind(whiteBoardController));

export default router;