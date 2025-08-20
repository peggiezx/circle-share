import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { fetchTimeline, deletePost } from "../services/api";
import type { Post } from "../types";


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

export const Timeline = forwardRef<TimelineRef>((props, ref) => {
    // state
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadTimeline = async() => {
            try {
                setLoading(true);
                const data = await fetchTimeline();
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
        }, []);

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
           {loading && <p>Your timeline is loading</p>}
           {error && <p>Error: {error}</p>}
           {posts.map(post => (
                <div key={post.post_id} style={{ border: '1px solid #eee', padding: '16px', margin: '8px 0'}}>
                    <h3>{post.author_name}</h3>
                    <p>{post.content}</p>
                    <div>
                        <button 
                            onClick={() => handleDeletePost(post.post_id)}>Delete</button>
                    </div>
                    <small>Posted {formatTimestamp(post.created_at)}</small>
                </div>
           ))}  
        </div>
    )
});

