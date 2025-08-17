import type { LoginResponse, Post, Token } from "../types";

export async function loginWithToken(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Login Failed");
  }

  const data: LoginResponse = await res.json();
  return data;
}

export async function loginAndStoreToken(
    email: string,
    password: string
): Promise<void> {
    const loginData = await loginWithToken(email, password);
    localStorage.setItem('authToken', loginData.access_token);
}

export const getStoredToken = (): string | null => {
    return localStorage.getItem('authToken')
}

export const clearStoredToken = (): void => {
    localStorage.removeItem('authToken')
}

export async function fetchTimeline(): Promise<Post[]> {
    const token = getStoredToken();

    if (!token) {
        throw new Error('No auth token found');
    }
    const res = await fetch("http://127.0.0.1:8000/timeline", {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("No post found");
    }
    
    const data: Post[] = await res.json();
    return data;
}

export async function createPost(content: string, circle_id: number): Promise<Post> {
    const token = getStoredToken();

    if (!token) {
    throw new Error("No auth token found");
    }
    console.log("Creating post with:", { content, circle_id }); // Debug log
    console.log("Token:", token);

    const res = await fetch("http://127.0.0.1:8000/posts/", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: content,
            circle_id: circle_id,
        }),
    });

    console.log("Response status:", res.status); // Debug log

    if (!res.ok) {
    throw new Error("Failed to create the post");
    }

    const post_data: Post = await res.json();
    return post_data;
}

export async function deletePost(postId: number): Promise<void> {
    const token = getStoredToken();
    if (!token) {
        throw new Error("No auth token found");
    }

    const res = await fetch(`http://127.0.0.1:8000/posts/${postId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error('Failed to delete post');
    }



}
