import { Request, Response } from 'express';
import { WhiteBoardService } from '../services/WhiteBoardService';
import { WhiteBoard } from '../models/Whiteboard';

const whiteBoardService = new WhiteBoardService();

export class WhiteBoardController {
  async create(req: Request, res: Response) {
    try {
      const whiteBoard: WhiteBoard = {
        ...req.body,
        created_by: "Test",  // Automatically set created_by to "Test"
        updated_by: "Test",  // Automatically set updated_by to "Test"
      };
      const createdWhiteBoard = await whiteBoardService.createWhiteBoard(whiteBoard);
      res.status(201).json(createdWhiteBoard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const whiteBoardId = parseInt(req.params.id);
      const { drawing_assets } = req.body;
      const updatedWhiteBoard = await whiteBoardService.updateWhiteBoard(whiteBoardId, {
        drawing_assets,
        updated_by: "Test",  // Automatically set updated_by to "Test"
      });
      res.status(200).json(updatedWhiteBoard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const whiteBoardId = parseInt(req.params.id);
      await whiteBoardService.deleteWhiteBoard(whiteBoardId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getBySessionId(req: Request, res: Response) {
    try {
        const sessionId = req.params.sessionId; // No need to parse as integer
        const whiteBoards = await whiteBoardService.getWhiteBoardsBySessionId(sessionId); // Pass sessionId as string
        res.status(200).json(whiteBoards);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
}