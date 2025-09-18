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

    if (loading) return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        <span className="ml-3 text-gray-600">Loading invitations...</span>
      </div>
    );
    
    if (error) return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        <span className="font-medium">Error:</span> {error}
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Header - No card, just titles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Circle Invitations
          </h2>
          <p className="text-gray-600">
            {invites.length} invitation{invites.length !== 1 ? "s" : ""} waiting for your response
          </p>
        </div>

        {/* Invitations List */}
        {invites.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No pending invitations</h3>
            <p className="text-gray-500">When someone invites you to their circle, you'll see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <InviteCard
                key={invite.id}
                invitation={invite}
                onRespond={handleRespond}
              />
            ))}
          </div>
        )}
      </div>
    );
}