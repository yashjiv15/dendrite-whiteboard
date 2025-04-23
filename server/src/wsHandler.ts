import WebSocket, { WebSocketServer } from 'ws';

export function handleConnection(ws: WebSocket, wss: WebSocketServer) {
  console.log("🟢 Client connected");

  ws.on('message', (data) => {
    console.log("📨 Received:", data.toString());

    // Broadcast message to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log("🔴 Client disconnected");
  });

  ws.on('error', (err) => {
    console.error("❌ WebSocket error:", err);
  });
}
