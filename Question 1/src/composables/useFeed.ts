import { ref } from 'vue';
import { FeedService } from '../api/feed';
import type { Post } from '../models/Post';

export function useFeed() {
  const posts = ref<Post[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const page = ref(1);
  const hasMore = ref(true);

  // Load cached posts on init
  const initCache = () => {
    const cached = localStorage.getItem('feed_posts');
    if (cached) {
      try {
        posts.value = JSON.parse(cached);
        // If we have cached posts, we can start fetching page 2 or just refresh page 1 in background
        // For simplicity, let's keep page 1 content visible and fetch "next" pages as user scrolls
        // Or re-fetch page 1 silently to update engagement counts
      } catch (e) {
        console.error('Cache parse error', e);
      }
    }
  };

  initCache();

  const fetchFeed = async () => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    error.value = null;

    try {
      const newPosts = await FeedService.getFeed(page.value);
      
      if (newPosts.length === 0) {
        hasMore.value = false;
      } else {
        // If page 1, replace cache entirely (refresh)
        // If page > 1, append
        if (page.value === 1) {
            posts.value = newPosts;
        } else {
            posts.value = [...posts.value, ...newPosts];
        }
        
        // Update Cache
        localStorage.setItem('feed_posts', JSON.stringify(posts.value));
        
        page.value++;
      }
    } catch (err) {
      error.value = 'Failed to load feed. Please try again.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const toggleLike = (postId: string) => {
    const post = posts.value.find(p => p.id === postId);
    if (post) {
      if (post.hasLiked) {
        post.likes--;
        post.hasLiked = false;
      } else {
        post.likes++;
        post.hasLiked = true;
      }
      // Update cache immediately for optimistic UI persistence
      localStorage.setItem('feed_posts', JSON.stringify(posts.value));
    }
  };

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchFeed,
    toggleLike
  };
}
