// components/InviteForm.tsx
import { useState } from "react";
import { sendInvitation } from "../services/sessionService"; // Import the service

type Props = {
  sessionId: string;
};

export default function InviteForm({ sessionId }: Props) {
  const [email, setEmail] = useState("");

  const handleInvite = async () => {
    try {
      const data = await sendInvitation(email, sessionId); // Use the service method
      if (data) {
        // Handle success (e.g., update state or show success message)
      }
    } catch (err) {
      console.error("Failed to send invite", err);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email to invite"
        className="form-control mb-2"
      />
      <button onClick={handleInvite} className="btn btn-secondary w-100 shadow-sm">
        📧 Send Invite
      </button>
    </div>
  );
}
