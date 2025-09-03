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
        {loading && <p className="text-blue-600 mb-3">Creating your post...</p>}
        {success && (
          <p className="text-green-600 mb-3">Post created successfully!</p>
        )}

        <textarea
          placeholder="Share a moment from your day..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={maxLength}
          rows={4}
          className="w-full p-4 border border-gray-300 rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{
            minHeight: "120px",
            border: remainingChars < 20 ? "2px solid orange" : "1px solid #d1d5db",
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
                {remainingChars} characters remaining
            </span>

            <button 
                type="submit" 
                disabled={loading || !content.trim() || content.length > maxLength}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    (!content.trim() || loading) 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                }`}
                >
                {loading ? 'Posting...' : 'Post'}
            </button>
        </div>

        {error && <p className="text-red-600 mt-3">Error: {error}</p>}
      </form>
    );

}