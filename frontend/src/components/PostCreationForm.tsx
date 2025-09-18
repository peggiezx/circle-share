import { useState } from "react";
import { createPost } from "../services/api";

interface PostProps {
    onPostSuccess: () => void;
}

export function PostCreationForm ({onPostSuccess}: PostProps) {
    const [content, setContent] = useState<string>("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const maxLength = 280;
    const remainingChars = maxLength - content.length;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('Image size must be less than 10MB');
                return;
            }
            setPhoto(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await createPost(content, photo);
            setContent("");
            setPhoto(null);
            setPhotoPreview(null);
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

        <div className="relative">
          <textarea
            placeholder="Share a moment from your day..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={maxLength}
            rows={4}
            className="w-full p-4 pr-12 border border-gray-300 rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              minHeight: "120px",
              border: remainingChars < 20 ? "2px solid orange" : "1px solid #d1d5db",
            }}
          />
          
          {/* Photo Upload Icon - positioned inside textarea */}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="absolute bg-blue-500 hover:bg-blue-600 text-white rounded-full cursor-pointer transition-colors shadow-lg border-2 border-blue-400"
            title="Add Photo"
            style={{ 
              bottom: '12px', 
              right: '12px',
              top: 'auto',
              left: 'auto',
              zIndex: 20,
              opacity: 1,
              padding: '14px'
            }}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 9a2 2 0 012-2h.93l.82-1.23A2 2 0 018.07 5h7.86a2 2 0 011.32.77L18.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </label>
        </div>

        {/* Photo Preview Section */}
        <div className="mt-4">

          {/* Photo Preview */}
          {photoPreview && (
            <div className="mt-3 relative">
              <img
                src={photoPreview}
                alt="Photo preview"
                className="max-w-full h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

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