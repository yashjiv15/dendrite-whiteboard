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
