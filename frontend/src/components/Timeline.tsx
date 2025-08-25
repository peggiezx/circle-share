import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { fetchTimeline, deletePost, fetchMyTimeline } from "../services/api";
import type { Post } from "../types";

interface TimelineProps {
    type: 'my-days' | 'their-days';
    title?: string;
    onPostSelect?: (post: Post) => void;
}

const formatTimestamp = (timeStamp: string) => {
    const date = new Date(timeStamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if ((diffInMinutes / 1440) < 7)  return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return `on ${date.toLocaleDateString("en-US")}`;
};

export interface TimelineRef {
    refreshTimeline: () => void;
}

export const Timeline = forwardRef<TimelineRef, TimelineProps>(({ type, onPostSelect }, ref) => {
    // state
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadTimeline = async() => {
            try {
                setLoading(true);
                const data = type === 'my-days' ? await fetchMyTimeline() : await fetchTimeline();
                setPosts(data);
                setError(null);
            } catch(err) {
                setError("Failed to load the timeline")
            } finally {
                setLoading(false)
            }
    };


    useEffect(() => {
        loadTimeline();
        }, [type]);

    useImperativeHandle(ref, () => ({
        refreshTimeline: loadTimeline
    }));

    const handleDeletePost = async (postId : number) => {
        const confirmDelete = confirm('Are you sure you want to delete this post?')

        if (!confirmDelete) {
            return;
        }

        try {
            await deletePost(postId);
            loadTimeline();
        } catch(error) {
            alert('Delete faield. Please try again.');
        }
    };


    return (
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B3EBF2]"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">Error: {error}</p>
          </div>
        )}
        {posts.map((post) => (
          <div
            key={post.post_id}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#B3EBF2]/30 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-[#B3EBF2]/50"
            onClick={() => onPostSelect?.(post)}
          >
            <div className="p-6">
              {/* Author Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#B3EBF2] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {post.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author_name}</h3>
                    <p className="text-sm text-gray-500">Posted {formatTimestamp(post.created_at)}</p>
                  </div>
                </div>
                {type === "my-days" && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.post_id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Post Content */}
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="font-medium text-gray-700 mb-2">No posts yet</h3>
            <p className="text-sm text-gray-500">
              {type === "my-days" ? "Start sharing your thoughts!" : "Waiting for posts from your circle."}
            </p>
          </div>
        )}
      </div>
    );
});

