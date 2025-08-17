import { useState } from "react";
import { createPost } from "../services/api";

interface PostProps {
    onPostSuccess: () => void;
}

export function PostCreationForm ({onPostSuccess}: PostProps) {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const maxLength = 280;
    const remainingChars = maxLength - content.length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await createPost(content, 3);
            setContent("");
            setSuccess(true);
            onPostSuccess();

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError("Failed to create post")
        }
        setLoading(false);
    };

    return (
      <form onSubmit={handleSubmit}>
        {loading && <p>Creating your post...</p>}
        {success && (
          <p style={{ color: "green" }}>Post created successfully!</p>
        )}

        <textarea
          placeholder="Share a moment from your day..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={maxLength}
          rows={3}
          style={{
            width: "100%",
            resize: "vertical",
            border: remainingChars < 20 ? "2px solid organe" : "1px solid #ccc",
          }}
        />

        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px'
        }}>
            <span style={{
                color: remainingChars < 20 ? 'orange' : remainingChars < 0 ? 'red': '#666',
                fontSize: '14px'
            }}>
            </span>

            <button 
                type="submit" 
                disabled={loading || !content.trim() || content.length > maxLength}
                style={{
                    backgroundColor: (!content.trim() || loading) ? '#ccc' : '#1da1f2',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    cursor: (!content.trim() || loading) ? 'not-allowed':'pointer'
                }}
                >
                {loading ? 'Posting...' : 'Share Post'}
            </button>
        </div>

        {error && <p>Error: {error}</p>}
      </form>
    );

}