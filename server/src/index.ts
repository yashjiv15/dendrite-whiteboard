import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import inviteRoute from './routes/inviteRoute';
import { handleConnection } from './wsHandler';
import cors from 'cors';
import dotenv from 'dotenv';
import sessionRoutes from './routes/sessionRoutes';
import whiteBoardRoutes from './routes/WhiteBoardRoutes';
import { swaggerDocs, swaggerUi } from './swagger'; // Import Swagger

dotenv.config();

const PORT = process.env.PORT || 8081;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true }); // Create WebSocket server without binding to a port

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', inviteRoute);
app.use('/api', sessionRoutes); // API route for sessions
app.use('/api/whiteboard', whiteBoardRoutes);
// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Upgrade HTTP server to WebSocket server
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws/whiteboard') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy(); // Close the socket if the path does not match
  }
});

// Start HTTP + WS server
server.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` WebSocket server listening on ws://localhost:${PORT}/ws/whiteboard`);
});

// Handle WS connections
wss.on('connection', (ws) => {
  handleConnection(ws, wss);
});