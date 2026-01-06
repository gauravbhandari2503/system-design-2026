import { ref, reactive } from 'vue';
import { FeedService } from '../api/feed';
import type { Post } from '../models/Post';

export function useFeed() {
  const posts = ref<Post[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const page = ref(1);
  const hasMore = ref(true);

  const fetchFeed = async () => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    error.value = null;

    try {
      const newPosts = await FeedService.getFeed(page.value);
      if (newPosts.length === 0) {
        hasMore.value = false;
      } else {
        posts.value = [...posts.value, ...newPosts];
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
