// src/controllers/sessionController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db'; // PostgreSQL connection pool

// Controller to create a new session
export const createSession = async (req: Request, res: Response) => {
  try {
    const sessionId = uuidv4();  // Generate a new session ID
    const username = 'Test'; // Fixed username
    const sessionExpiry = new Date();
    sessionExpiry.setHours(sessionExpiry.getHours() + 24); // Set session expiry to 24 hours from creation

    const query = `
      INSERT INTO sessions (session_id, username, session_expiry, created_at, created_by, updated_at, updated_by)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, CURRENT_TIMESTAMP, $5)
      RETURNING session_id
    `;

    // Use a fixed user ID for created_by and updated_by (you can adjust this as needed)
    const userId = 1; // Example user ID
    const values = [sessionId, username, sessionExpiry, userId, userId];

    const result = await pool.query(query, values);
    const createdSessionId = result.rows[0].session_id;

    res.status(201).json({
      message: 'Session created successfully',
      sessionId: createdSessionId, // Return the session ID
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};