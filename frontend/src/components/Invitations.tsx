import { useEffect, useState } from "react";
import type { Invitation } from "../types";
import { fetchInvitation, respondInvitation } from "../services/api";
import { InviteCard } from "./InviteCard";

export function Invitations() {
    const [invites, setInvites] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadInvitations = async() => {
        try {
            setLoading(true);
            const data = await fetchInvitation();
            setInvites(data);
            setError(null);
        } catch (err) {
            setError("Failed to load the invitations")
        } finally {
            setLoading(false)
        }
    };

    const handleRespond = async (invitationId: number, action: string) => {
        try {
            // animation for removing invites
            await respondInvitation(invitationId, action);
            //remove the ones that already responded
            setInvites(prev => prev.filter(inv => inv.id != invitationId));
        } catch (err) {
            setError(`Failed to ${action} invitation`);
        }
    };

    useEffect(() => {
        loadInvitations();
    }, []);

    if (loading) return <div>Loading invitations...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
      <div className="invitation-list">
        <p className="invitation-count">
          {invites.length} invitation{invites.length != 1 ? "s" : ""} waiting
          for your response
        </p>
        {invites.length === 0 ? (
          <div className="no-invitations">
            <p>No pending invitations</p>
          </div>
        ) : (
          invites.map((invite) => (
            <InviteCard
              key={invite.id}
              invitation={invite}
              onRespond={handleRespond}
            />
          ))
        )}
      </div>
    );
}