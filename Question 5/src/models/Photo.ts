export interface Comment {
  id: string;
  username: string;
  text: string;
}

export interface Photo {
  id: string;
  url: string;
  author: {
    id: string;
    username: string;
    avatar: string; // URL
  };
  caption: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean; // Current user like status
  timestamp: string; // ISO String
}

export interface FeedResponse {
  photos: Photo[];
  nextCursor: string | null;
}
