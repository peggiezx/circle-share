import { useState, useEffect } from "react";
import type { Comment } from "../types";
import { fetchComments, createComment, deleteComment } from "../services/api";
import { CommentCard } from "./CommentCard";
import { CommentForm } from "./CommentForm";

interface CommentSectionProps {
  postId: number;
  isVisible: boolean;
}

export function CommentSection({ postId, isVisible }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    if (!isVisible) return;
    
    try {
      setLoading(true);
      const data = await fetchComments(postId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (content: string) => {
    try {
      const newComment = await createComment(postId, content);
      setComments(prev => [...prev, newComment]);
    } catch (err) {
      setError("Failed to create comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError("Failed to delete comment");
    }
  };

  useEffect(() => {
    loadComments();
  }, [isVisible, postId]);

  if (!isVisible) return null;

  return (
    <div className="mt-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Comment Form - Always at the top */}
      <div className="mb-6">
        <CommentForm onSubmit={handleCreateComment} />
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No comments yet.</p>
            <p className="text-xs">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}