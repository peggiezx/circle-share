import { useState } from "react";
import { inviteToCircle } from "../services/api";

interface InviteModalProps {
    onClose: () => void;
    onInviteSuccess: () => void;

}
export function InviteModal({onClose, onInviteSuccess} : InviteModalProps) {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);

        if (!email.trim()) {
            setError("Please enter an email address");
            return;
        }
        setLoading(true);
        try {
            await inviteToCircle(email);
            setEmail("");
            onInviteSuccess();
            onClose();
        } catch (err: any) {
            if(err.message?.includes("not found")) {
                setError(`${email} isn't on CircleShare yet. They'll need to sign up first!`)
            } else if (err.message?.includes("already")) {
                setError(`${email} is already in your circle`)
            } else if (err.message?.includes("No auth token")) {
                setError(err.message || "You need to log in again")
            } else {
                setError(err.message || "Failed to send invite");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-content">
          <div className="modal-header">
            <h3>Invite to Your Circle</h3>
            <button className="close-button" onClick={onClose} type="button">
              x
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                required
              />
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="modal-actions">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button>
                    {loading ? "Sending..." : "Send Invite"}
                </button>
            </div> 
          </form>
        </div>
      </div>
    );

}