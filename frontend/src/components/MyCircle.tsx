import { useEffect, useState } from "react";
import type { CircleMember } from "../types";
import { getMyCircleMembers, removeMemberFromCircle } from "../services/api";
import { InviteForm } from "./InviteForm";
import { MemberCard } from "./MemberCard";
import Modal from "./Modal";

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
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Circle</h2>
                    <p className="text-gray-600 mt-1">Manage your circle members</p>
                </div>
                <button 
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <span>+</span>
                    <span>Invite</span>
                </button>
            </div>

            {/* Members List */}
            {members.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">👤</div>
                    <h3 className="font-medium text-gray-700 mb-2">Your circle is just you right now</h3>
                    <p className="text-gray-500 mb-6">Invite others to start sharing your days!</p>
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Send First Invite
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-600 mb-4">
                        {members.length} member{members.length !== 1 ? "s" : ""} in your circle
                    </p>
                    <div className="space-y-3">
                        {members.map(member => (
                            <MemberCard 
                                key={member.id} 
                                member={member} 
                                onRemove={handleRemoveMember}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            <Modal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title="Invite to Your Circle"
            >
                <InviteForm 
                    onClose={() => setShowInviteModal(false)}
                    onInviteSuccess={handleInviteSuccess}
                />
            </Modal>
        </div>
    )

}