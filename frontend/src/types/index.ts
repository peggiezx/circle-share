// Auth types
export interface LoginResponse {
  access_token: string;
  token_type: string;
}
// Post types
export interface Post {
  post_id: number;
  circle_id: number;
  author_id: number;
  content: string;
  photo_url?: string;
  created_at: string;
  author_name: string;
  like_count: number;
  user_liked: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  hashed_password: string;
  first_access: string;
}

export interface CircleMember {
  id: number;
  name: string;
  email: string;
}


export interface Invitation {
    id: number,
    from_user_name: string;
    from_user_email: string;
    status: string;
    created_at: string
}

export interface InvitationAction{
    action: string
}

// Comment types
export interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    content: string;
    created_at: string;
    author_name: string;
}

export interface CommentCreate {
    content: string;
}