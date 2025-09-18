import type { Post } from "../types";

interface PostEntryCardProps {
  post: Post;
  type: "my-days" | "their-days";
  onPostSelect?: (post: Post) => void;
  isSelected?: boolean;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: number) => void;
}

export default function PostEntryCard({post, type, onPostSelect, isSelected = false, onEditPost, onDeletePost}: PostEntryCardProps) {
    const formatTimestamp = (timeStamp: string) => {
      const date = new Date(timeStamp);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes / 1440 < 7)
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
      return `on ${date.toLocaleDateString("en-US")}`;
    };

    const date = new Date(post.created_at)
    const month = date.toLocaleDateString('en-US', {month:'short'})
    const day = date.toLocaleDateString('en-US', {day: 'numeric'})
    const posted_date = date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
    const authorInitials = post.author_name.split(' ').map(name => name.charAt(0).toUpperCase()).join('')
    
    // Different styling for My Days vs Their Days
    const isMyPost = type === "my-days"
    
    // Using inline styles to ensure colors show up
    const cardBorderStyle = isSelected ? "2px solid #85D1DB" : "2px solid #B3EBF2"
    const avatarBgStyle = "#B3EBF2"
    const cardBgStyle = isSelected ? "#F0FDFF" : "white"

    return (
      <div
        className={`rounded-lg shadow-sm p-4 mb-4 cursor-pointer transition-all duration-200 ${
          isSelected 
            ? "shadow-lg ring-2 ring-[#85D1DB]/30" 
            : "hover:shadow-md"
        }`}
        style={{ 
          border: cardBorderStyle,
          backgroundColor: cardBgStyle
        }}
        onClick={() => onPostSelect?.(post)}
      >
        <div className="flex gap-4">
          {/* Date Section - Left Side (only for My Days) */}
          {isMyPost && (
            <div className="flex-shrink-0 text-center">
              <div className="text-4xl font-bold text-gray-900">{month}</div>
              <div className="text-4xl font-bold text-gray-900">{day}</div>
            </div>
          )}

          {/* Content Section - Right Side */}
          <div className="flex-1">
            {/* Author Header - Only show for Their Days */}
            {!isMyPost && (
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-900 font-semibold text-sm"
                  style={{ backgroundColor: avatarBgStyle }}
                >
                  {authorInitials}
                </div>
                <span className="font-medium text-gray-700">
                  {post.author_name}
                </span>
              </div>
            )}
            
            {/* "You" indicator for My Days */}
            {isMyPost && (
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-900 font-semibold text-sm"
                  style={{ backgroundColor: avatarBgStyle }}
                >
                  {authorInitials}
                </div>
                <span className="font-medium text-blue-600">
                  You
                </span>
              </div>
            )}

            {/* Post Content */}
            <div className="text-gray-800 mb-2">{post.content}</div>

            {/* Photo Display */}
            {post.photo_url && (
              <div className="mb-3">
                <img
                  src={post.photo_url}
                  alt="Post photo"
                  className="w-full max-h-64 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent post selection when clicking photo
                    // You could add a modal or lightbox here later
                  }}
                />
              </div>
            )}

            {/* Timestamp and Actions */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Posted {formatTimestamp(post.created_at)}
              </div>
              
              {/* Edit and Delete icons - only for My Days */}
              {isMyPost && (onEditPost || onDeletePost) && (
                <div className="flex items-center gap-2">
                  {onEditPost && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPost(post);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit post"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  
                  {onDeletePost && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePost(post.post_id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete post"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}