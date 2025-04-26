import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendInvitation, createSession } from "../../services/sessionService";
import SessionForm from "../../components/SessionForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faEnvelopeOpenText, faPlus, faSpinner, faCheck } from "@fortawesome/free-solid-svg-icons";

export default function SessionLanding() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For the loading spinner
  const [isSuccess, setIsSuccess] = useState(false); // For success tick

  const handleCreate = async () => {
    try {
      const newSessionId = await createSession(); // Call backend API
      if (newSessionId) {
        navigate(`/board/${newSessionId}`);
      } else {
        toast.error("Failed to create session.");
      }
    } catch (err) {
      console.error("Error creating session:", err);
      toast.error("An error occurred while creating session.");
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId.trim()) navigate(`/board/${sessionId.trim()}`);
  };

  const handleInviteClick = async () => {
    if (!sessionId) {
      const newSessionId = await createSession(); // Ensure a real session is created
      if (newSessionId) setSessionId(newSessionId);
    }
    setShowInviteInput(true);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.warn("Please enter an email address.");
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      await sendInvitation(inviteEmail, sessionId);
      toast.success("Invitation sent!");
      setIsSuccess(true);
    } catch (err) {
      console.error("Error sending invitation:", err);
      toast.error("Failed to send invitation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient bg-light px-3">
      <div className="card shadow-lg p-4 rounded-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h1 className="text-center text-primary fw-bold mb-4">
          🎨 Collaborative Whiteboard
        </h1>

        <button 
          onClick={handleCreate} 
          className="btn btn-lg w-100 mb-4 shadow-sm" 
          style={{ backgroundColor: '#1652EF', color: '#FFFFFF' }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
          Create New Session
        </button>

        <SessionForm sessionId={sessionId} setSessionId={setSessionId} onJoin={handleJoin} />

        {!showInviteInput ? (
          <button onClick={handleInviteClick} className="btn btn-secondary w-100 shadow-sm mt-4">
            <FontAwesomeIcon icon={faEnvelopeOpenText} style={{ marginRight: '8px' }} />
            Invite Someone
          </button>
        ) : (
          <div className="mt-4">
            <label htmlFor="inviteEmail" className="form-label text-secondary">Invite via Email</label>
            <input
              type="email"
              id="inviteEmail"
              className="form-control mb-2"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <button
              onClick={handleSendInvite}
              className="btn btn-success w-100 shadow-sm"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
              ) : isSuccess ? (
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: '8px' }} />
              ) : (
                "Send Invite"
              )}
            </button>

            {sessionId && (
              <div className="text-center mt-3 text-muted">
                Share this session ID: <strong>{sessionId}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
}
