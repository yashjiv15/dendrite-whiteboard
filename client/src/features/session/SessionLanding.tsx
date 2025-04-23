// src/features/session/SessionLanding.tsx
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function SessionLanding() {
  const navigate = useNavigate();

  const createSession = () => {
    const sessionId = uuidv4();
    navigate(`/board/${sessionId}`);
  };

  const joinSession = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionId = (e.target as any).elements.sessionId.value;
    if (sessionId) navigate(`/board/${sessionId}`);
  };

  return (
    <div className="container mt-5 text-center">
      <h1>Collaborative Whiteboard</h1>
      <button className="btn btn-primary m-3" onClick={createSession}>
        🎨 Create New Session
      </button>

      <form onSubmit={joinSession} className="d-inline-block">
        <input
          type="text"
          name="sessionId"
          className="form-control d-inline-block w-50"
          placeholder="Enter Session ID"
          required
        />
        <button type="submit" className="btn btn-success m-2">
          Join Session
        </button>
      </form>
    </div>
  );
}
