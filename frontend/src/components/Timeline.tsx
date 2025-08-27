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
      <div>
        {loading && (
          <div>
            <div></div>
          </div>
        )}
        {error && (
          <div>
            <p>Error: {error}</p>
          </div>
        )}
        {posts.map((post) => (
          <div
            key={post.post_id}
            onClick={() => onPostSelect?.(post)}
          >
            <div>
              {/* Author Header */}
              <div>
                <div>
                  <div>
                    <span>
                      {post.author_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3>{post.author_name}</h3>
                    <p>Posted {formatTimestamp(post.created_at)}</p>
                  </div>
                </div>
                {type === "my-days" && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.post_id);
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Post Content */}
              <div>
                <p>{post.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {!loading && posts.length === 0 && (
          <div>
            <div>📝</div>
            <h3>No posts yet</h3>
            <p>
              {type === "my-days" ? "Start sharing your thoughts!" : "Waiting for posts from your circle."}
            </p>
          </div>
        )}
      </div>
    );
});

