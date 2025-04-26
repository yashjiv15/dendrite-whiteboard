import { Pool } from 'pg';
import { pool } from '../config/db'; // Import the connection pool

export interface WhiteBoard {
  white_board_id?: string;
  session_id: string;
  drawing_assets: object; // Use appropriate type if you have a specific structure
  created_at?: Date;
  created_by?: string; // Ensure this is a string
  updated_at?: Date;
  updated_by?: string; // Ensure this is a string
}

export class WhiteBoardModel {
  async create(whiteBoard: WhiteBoard): Promise<WhiteBoard> {
    const result = await pool.query(
      `INSERT INTO white_board (session_id, drawing_assets, created_by, updated_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [whiteBoard.session_id, whiteBoard.drawing_assets, whiteBoard.created_by, whiteBoard.updated_by]
    );
    return result.rows[0];
  }

  async update(whiteBoardId: number, drawingAssets: object): Promise<WhiteBoard> {
    const result = await pool.query(
      `UPDATE white_board SET drawing_assets = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2 WHERE white_board_id = $3 RETURNING *`,
      [drawingAssets, "Test", whiteBoardId] // Automatically set updated_by to "Test"
    );
    return result.rows[0];
  }

  async delete(whiteBoardId: number): Promise<void> {
    await pool.query(`DELETE FROM white_board WHERE white_board_id = $1`, [whiteBoardId]);
  }

  async findBySessionId(sessionId: string): Promise<WhiteBoard[]> {
    const result = await pool.query(`SELECT * FROM white_board WHERE session_id = $1`, [sessionId]);
    return result.rows;
  }
}