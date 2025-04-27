// services/sessionService.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8088";

export const sendInvitation = async (email: string, sessionId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/send-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, sessionId }),
    });

    if (!response.ok) {
      throw new Error("Failed to send invitation");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error sending invitation:", err);
    alert("Failed to send invite");
  }
};
export const createSession = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    const data = await response.json();
    return data.sessionId; // Return the generated session ID
  } catch (err) {
    console.error("Error creating session:", err);
    alert("Failed to create session");
  }
};