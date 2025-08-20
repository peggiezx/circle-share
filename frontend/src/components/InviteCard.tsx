import type { Invitation } from "../types";

interface InviteActionProps {
    invitation: Invitation;
    onRespond: (invitationId: number, action: string) => void;
}

export function InviteCard( {invitation, onRespond} : InviteActionProps) {
    return (
        <div className="invite-card">
            <div className="invite-info">
                <p>{invitation.from_user_name} invited you to join their circle</p>
                <small>Sent: {new Date(invitation.created_at).toLocaleDateString()}</small>
            </div>
            <div className="invite-actions">
                <button
                    onClick={()=> onRespond(invitation.id, 'accept')}
                >
                    Accept
                </button>
                <button
                    onClick={() => onRespond(invitation.id, 'decline')}
                >
                    Decline
                </button>
            </div>
        </div>
    ); 
}