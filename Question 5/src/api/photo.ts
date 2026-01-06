import type { Photo, FeedResponse } from '../models/Photo';

// Mock Data Generators
const AVATARS = [
  'https://ui-avatars.com/api/?name=Alex&background=random',
  'https://ui-avatars.com/api/?name=Sam&background=random',
  'https://ui-avatars.com/api/?name=Jordan&background=random',
];

const IMAGES = [
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1682687221038-404670e01d46?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1682686581854-5e71f58e7e3f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1682685797661-9e0c8c1848bc?auto=format&fit=crop&w=800&q=80',
];

const generateMockPhotos = (count: number, startId: number): Photo[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `photo-${startId + i}`,
    url: IMAGES[(startId + i) % IMAGES.length],
    author: {
      id: `user-${(startId + i) % 3}`,
      username: ['alex_travels', 'sam.eats', 'jordan.dev'][(startId + i) % 3],
      avatar: AVATARS[(startId + i) % 3],
    },
    caption: 'Beautiful moment captured! #photography #life',
    likes: Math.floor(Math.random() * 500),
    comments: [
      { id: 'c1', username: 'fan_1', text: 'Amazing shot! 🔥' },
      { id: 'c2', username: 'observer', text: 'Where is this?' },
    ],
    isLiked: false,
    timestamp: new Date().toISOString(),
  }));
};

export const PhotoService = {
  async getFeed(cursor: string | null = null, limit: number = 5): Promise<FeedResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const startId = cursor ? parseInt(cursor.split('-')[1]) + 1 : 0;
        const photos = generateMockPhotos(limit, startId);
        
        // Simulate end of feed at 50 photos
        const nextStartId = startId + limit;
        const nextCursor = nextStartId < 50 ? `cursor-${nextStartId - 1}` : null;

        resolve({
            photos,
            nextCursor
        });
      }, 800); // Latency
    });
  },

  async likePhoto(photoId: string): Promise<boolean> {
     return new Promise((resolve) => {
        setTimeout(() => resolve(true), 200);
     });
  }
};
