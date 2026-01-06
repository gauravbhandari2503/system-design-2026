import type { User } from './User';

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string; // Optional image URL
  likes: number;
  comments: number;
  timestamp: string; // ISO string
  hasLiked?: boolean; // UI state for if current user liked it
}
