import { useEffect, useState } from "react";
import type { CircleMember } from "../types";
import { getMyCircleMembers, removeMemberFromCircle } from "../services/api";
import { InviteModal } from "./InviteModal";

export function MyCircle () {
    const [members, setMembers] = useState<CircleMember[]>([]);
    const [loading, setloading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState<boolean>(false);

    const loadMembers = async() => {
        try {
            setloading(true);
            const members_data = await getMyCircleMembers();
            setMembers(members_data);
            setError(null);
        } catch (err) {
            setError("Failed to get your member list")
        } finally {
            setloading(false)
        }
    };

    useEffect(()=>{
        loadMembers();
    }, []);

    const handleInviteSuccess = () => {
        loadMembers();
        console.log("Invite sent successfully!")
    };

    const handleRemoveMember = async (memberId: number, memberName: string) => {
        if (!confirm(`Remove ${memberName} from your circle?`)) return;

        try {
            console.log(`Attempting to remove member ${memberId}`)
            await removeMemberFromCircle(memberId);
            loadMembers();
            console.log("Member removed successfully");

        } catch(err) {
            console.error("Failed to remove member:", err);
        }
    };

    if (loading) {
        return (
            <div>
                <h2>My Circle</h2>
                <p>Loading your circle memebers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-circle-container">
                <h2>My Circle</h2>
                <p className="error">{error}</p>
                <button onClick={loadMembers}>Try Again</button>
            </div>
        )
    }

    return (
        <div className="my-circle-container">
            <div className="header">
                <h2>My Circle</h2>
                <button onClick={() => setShowInviteModal(true)}>
                    + invite
                </button>
            </div>

            {members.length === 0 ? (
                <div className="empty-state">
                    <p>Your circle is just you right now</p>
                    <p>Invite others to start sharing your days!</p>
                </div>
            ):(
                <div className="members-list">
                    <p className="member-count">{members.length} member{members.length !== 1 ? "s":"" }</p>
                    {members.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-info">
                                <h3>{member.name}</h3>
                                <h3>{member.email}</h3>
                            </div>
                            <button
                                onClick={() => handleRemoveMember(member.id, member.name)}
                                className="remove-button"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showInviteModal && (
                <InviteModal 
                    onClose={() => setShowInviteModal(false)}
                    onInviteSuccess={handleInviteSuccess}
                />
            )}
            
        </div>
    )

}