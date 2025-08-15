import { useState } from "react";
import { createPost } from "../services/api";

interface PostProps {
    onPostSuccess: () => void;
}

export function PostCreationForm ({onPostSuccess}: PostProps) {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPost(content, 3);
            onPostSuccess();
        } catch (err) {
            setError("Failed to create post")
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {loading && <p>Creating post</p>}
            <textarea 
                placeholder="Write something about your day..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <button type="submit">Post</button>
            {error && <p>Error: {error}</p>}
        </form>
    );

}