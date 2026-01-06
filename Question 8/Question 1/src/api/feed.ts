import type { Post } from '../models/Post';
import type { User } from '../models/User';

// Mock Users
const USERS: User[] = [
  { id: '1', name: 'Gaurav Gupta', handle: '@gaurav', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Alice Smith', handle: '@alice', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Bob Johnson', handle: '@bob_j', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Sarah Lee', handle: '@sarahalee', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Mike Chen', handle: '@mikec', avatar: 'https://i.pravatar.cc/150?u=5' },
];

const IMAGES = [
  'https://picsum.photos/seed/1/600/400',
  'https://picsum.photos/seed/2/600/400',
  'https://picsum.photos/seed/3/600/400',
  'https://picsum.photos/seed/4/600/400',
  'https://picsum.photos/seed/5/600/400',
  undefined, // Some posts without images
  undefined,
];

// Helper to generate a random post
function generatePost(id: string): Post {
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  const image = IMAGES[Math.floor(Math.random() * IMAGES.length)];
  
  return {
    id,
    author: user,
    content: `This is a simulated post content for post #${id}. It contains some random text to mimic a real social media feed. #systemdesign #frontend`,
    image,
    likes: Math.floor(Math.random() * 500),
    comments: Math.floor(Math.random() * 50),
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString(),
    hasLiked: Math.random() > 0.8,
  };
}

// Service class
export const FeedService = {
  async getFeed(page: number = 1, limit: number = 10): Promise<Post[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const posts: Post[] = [];
        const startId = (page - 1) * limit + 1;
        
        for (let i = 0; i < limit; i++) {
          posts.push(generatePost((startId + i).toString()));
        }
        
        resolve(posts);
      }, 800); // Simulate network latency
    });
  }
};
