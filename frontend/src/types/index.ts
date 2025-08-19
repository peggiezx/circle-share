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
  created_at: string;
  author_name: string;
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
