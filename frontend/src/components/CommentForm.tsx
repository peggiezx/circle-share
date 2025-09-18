import { useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full px-3 py-2 border border-[#B3EBF2]/50 bg-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#85D1DB]/50 focus:border-[#85D1DB] transition-all duration-200"
          rows={3}
          maxLength={500}
          disabled={isSubmitting}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/500
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Press Enter + Cmd/Ctrl to submit quickly
        </div>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-[#B3EBF2] hover:bg-[#85D1DB] disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-sm"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-700"></div>
              Posting...
            </div>
          ) : (
            "Post Comment"
          )}
        </button>
      </div>
    </form>
  );
}