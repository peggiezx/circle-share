import type { Post } from "../types";

interface PostEntryCardProps {
  post: Post;
  type: "my-days" | "their-days";
  onPostSelect?: (post: Post) => void;
}

export default function PostEntryCard({post, type, onPostSelect}: PostEntryCardProps) {
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



    return (
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onPostSelect?.(post)}
      >
        <div className="flex gap-4">
          {/* Date Section - Left Side */}
          <div className="flex-shrink-0 text-center">
            <div className="text-4xl font-bold text-gray-900">{month}</div>
            <div className="text-4xl font-bold text-gray-900">{day}</div>
          </div>

          {/* Content Section - Right Side */}
          <div className="flex-1">
            {/* Author Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {authorInitials}
              </div>
              <span className="font-medium text-gray-700">
                {post.author_name}
              </span>
            </div>

            {/* Post Content */}
            <div className="text-gray-800 mb-2">{post.content}</div>

            {/* Timestamp */}
            <div className="text-sm text-gray-500">
              Posted {formatTimestamp(post.created_at)}
            </div>
          </div>
        </div>
      </div>
    );
}