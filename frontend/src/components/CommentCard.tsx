import type { Comment } from "../types";

interface CommentCardProps {
  comment: Comment;
  onDelete: (commentId: number) => void;
}

export function CommentCard({ comment, onDelete }: CommentCardProps) {
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

  const authorInitials = comment.author_name
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="flex gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700"
          style={{ backgroundColor: "#E0F2FE" }}
        >
          {authorInitials}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {comment.author_name}
          </span>
          <span className="text-xs text-gray-500">
            {formatTimestamp(comment.created_at)}
          </span>
        </div>
        
        <p className="text-sm text-gray-800 leading-relaxed">
          {comment.content}
        </p>
      </div>

      {/* Delete Button - Only show for comment author */}
      <div className="flex-shrink-0">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this comment?')) {
              onDelete(comment.id);
            }
          }}
          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          title="Delete comment"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}