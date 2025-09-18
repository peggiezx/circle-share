import type { Invitation } from "../types";

interface InviteActionProps {
    invitation: Invitation;
    onRespond: (invitationId: number, action: string) => void;
}

export function InviteCard( {invitation, onRespond} : InviteActionProps) {
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        if (diffInMinutes / 1440 < 7) return `${Math.floor(diffInMinutes / 1440)}d ago`;
        return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    };

    const authorInitials = invitation.from_user_name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('');

    return (
        <div className="bg-white rounded-xl border border-[#B3EBF2]/30 p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-gray-900 font-semibold shadow-md"
                        style={{ backgroundColor: "#B3EBF2" }}
                    >
                        {authorInitials}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="mb-3">
                        <p className="text-gray-800 font-medium mb-1">
                            <span className="text-brand-600 font-semibold">{invitation.from_user_name}</span> invited you to join their circle
                        </p>
                        <p className="text-sm text-gray-500">
                            {formatTimestamp(invitation.created_at)}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onRespond(invitation.id, 'accept')}
                            className="flex-1 px-4 py-2 bg-[#B3EBF2] hover:bg-[#85D1DB] text-gray-900 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                        >
                            ✓ Accept
                        </button>
                        <button
                            onClick={() => onRespond(invitation.id, 'decline')}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                        >
                            ✕ Decline
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ); 
}