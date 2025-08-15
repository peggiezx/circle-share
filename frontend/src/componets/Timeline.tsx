import { useState, useEffect } from "react";
import { fetchTimeline } from "../services/api";
import type { Post } from "../types";

export function Timeline() {
    // state
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTimeline = async() => {
            try {
                const data = await fetchTimeline();
                setPosts(data);
                setLoading(false);
            } catch(err) {
                setError("Failed to load the timeline")
                setLoading(false)
            }
        };

        loadTimeline();

    }, []);

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
};

