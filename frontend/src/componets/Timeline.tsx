import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { fetchTimeline } from "../services/api";
import type { Post } from "../types";

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

    return (
        <div>
           {loading && <p>Your timeline is loading</p>}
           {error && <p>Error: {error}</p>}
           {posts.map(post => (
                <div key={post.post_id}>
                    <h3>{post.author_name}</h3>
                    <p>{post.content}</p>
                    <small>{post.created_at}</small>
                </div>
           ))}  
        </div>
    )
});

