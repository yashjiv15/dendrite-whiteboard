// services/api.ts
const BASE_URL = "http://localhost:8081"; // Replace with your actual backend URL

export async function sendInvite(email: string, sessionId: string): Promise<Response> {
  const response = await fetch(`${BASE_URL}/api/send-invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, sessionId }),
  });

  return response;
}
export async function createWhiteboard(sessionId: string, initialCanvasState: object): Promise<Response> {
  const response = await fetch(`${BASE_URL}/api/whiteboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session_id: sessionId, drawing_assets : initialCanvasState }),
  });

  return response;
}

export async function updateWhiteboard(whiteboardId: number, drawingAssets: object): Promise<Response> {
  const response = await fetch(`${BASE_URL}/api/whiteboard/${whiteboardId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ drawing_assets: drawingAssets }),
  });

  return response;
}
export async function getWhiteboardBySessionId(sessionId: string): Promise<Response> {
  const response = await fetch(`${BASE_URL}/api/whiteboard/session/${sessionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}