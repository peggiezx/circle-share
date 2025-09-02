import type { Post } from "../types";

interface PostEntryCardProps {
  post: Post;
  type: "my-days" | "their-days";
  onPostSelect?: (post: Post) => void;
}

export default function PostEntryCard({post, type, onPostSelect}: PostEntryCardProps) {
    const formatTimestamp = (timeStamp: string) => {
      const date = new Date(timeStamp);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes / 1440 < 7)
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
      return `on ${date.toLocaleDateString("en-US")}`;
    };

    const date = new Date(post.created_at)
    const posted_date = date.toLocaleDateString('en-US', {month: 'long', day: 'numeric'})



    return (
      <div className="max-w-sm w-full lg:max-w-full lg:flex">
        <div key={post.post_id} onClick={() => onPostSelect?.(post)}>
          <div className="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t">
            {posted_date}
          </div>
          <div>
            <span>{post.author_name}</span>
          </div>
          <div>
            <span>{post.content}</span>
          </div>
          <div>
            <small>Posted {formatTimestamp(post.created_at)} </small>
          </div>
        </div>
      </div>
    );
}