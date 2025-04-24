import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckToSlot } from "@fortawesome/free-solid-svg-icons";

type Props = {
  sessionId: string;
  setSessionId: (id: string) => void;
  onJoin: (e: React.FormEvent) => void;
};

export default function SessionForm({ sessionId, setSessionId, onJoin }: Props) {
  return (
    <form onSubmit={onJoin}>
      <div className="mb-3 text-start">
        <label htmlFor="sessionId" className="form-label text-secondary">
          Enter Session ID
        </label>
        <input
          type="text"
          id="sessionId"
          name="sessionId"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="form-control"
          placeholder="e.g., abc123-session-id"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-100 shadow-sm mb-4">
        <FontAwesomeIcon icon={faCheckToSlot} /> Join Session
      </button>
    </form>
  );
}
