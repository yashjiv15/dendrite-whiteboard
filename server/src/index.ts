import WebSocket, { WebSocketServer } from 'ws';
import { handleConnection } from './wsHandler';

const PORT = process.env.PORT || 8081;
const wss = new WebSocketServer({ port: Number(PORT) });

console.log(`✅ WebSocket server is running on ws://localhost:${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  handleConnection(ws, wss);
});
