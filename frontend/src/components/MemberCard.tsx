import type { CircleMember } from "../types";

interface MemberCardProps {
  member: CircleMember;
  onRemove: (memberId: number, memberName: string) => void;
}

export function MemberCard({ member, onRemove }: MemberCardProps) {
  const memberInitials = member.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        {/* Member Info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
            {memberInitials}
          </div>
          
          {/* Name and Status */}
          <div>
            <h3 className="font-medium text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500">Circle member</p>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(member.id, member.name)}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}