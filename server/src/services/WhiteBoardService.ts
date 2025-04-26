import { WhiteBoard, WhiteBoardModel } from '../models/Whiteboard';

const whiteBoardModel = new WhiteBoardModel();

export class WhiteBoardService {
  async createWhiteBoard(whiteBoard: WhiteBoard): Promise<WhiteBoard> {
    return await whiteBoardModel.create(whiteBoard);
  }

  async updateWhiteBoard(whiteBoardId: number, drawingAssets: object): Promise<WhiteBoard> {
    return await whiteBoardModel.update(whiteBoardId, drawingAssets);
  }

  async deleteWhiteBoard(whiteBoardId: number): Promise<void> {
    await whiteBoardModel.delete(whiteBoardId);
  }

 async getWhiteBoardsBySessionId(sessionId: string): Promise<WhiteBoard[]> {
    return await whiteBoardModel.findBySessionId(sessionId); // Ensure this method can handle string sessionId
}
}
