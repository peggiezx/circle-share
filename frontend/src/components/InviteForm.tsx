import { useState } from "react";
import { sendInvitation } from "../services/api";

interface InviteFormProps {
    onClose: () => void;
    onInviteSuccess: () => void;
}

export function InviteForm({ onClose, onInviteSuccess }: InviteFormProps) {
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
            await sendInvitation(email);
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

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                </label>
                <input
                    id="email"
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoFocus
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ minHeight: '28px' }}
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div 
                className="flex gap-3"
                style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '12px' 
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-800 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        loading 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {loading ? "Sending..." : "Send"}
                </button>
            </div>
        </form>
    );
}