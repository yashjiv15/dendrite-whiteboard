import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import inviteRoute from './routes/inviteRoute';
import { handleConnection } from './wsHandler';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8081;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', inviteRoute);

// Start HTTP + WS server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ WebSocket server listening on ws://localhost:${PORT}`);
});

// Handle WS connections
wss.on('connection', (ws) => {
  handleConnection(ws, wss);
});
