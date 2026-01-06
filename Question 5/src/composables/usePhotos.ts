import { ref } from 'vue';
import { PhotoService } from '../api/photo';
import type { Photo } from '../models/Photo';

export function usePhotos() {
  const photos = ref<Photo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const nextCursor = ref<string | null>(null);
  const hasMore = ref(true);

  const fetchFeed = async (reset = false) => {
    if (loading.value || (!hasMore.value && !reset)) return;
    
    loading.value = true;
    error.value = null;

    if (reset) {
        photos.value = [];
        nextCursor.value = null;
        hasMore.value = true;
    }

    try {
      const response = await PhotoService.getFeed(nextCursor.value);
      photos.value = [...photos.value, ...response.photos];
      nextCursor.value = response.nextCursor;
      hasMore.value = !!response.nextCursor;
    } catch (err) {
      error.value = 'Failed to load feed.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const toggleLike = async (photoId: string) => {
    // Optimistic Update
    const photo = photos.value.find(p => p.id === photoId);
    if (photo) {
        const wasLiked = photo.isLiked;
        photo.isLiked = !wasLiked;
        photo.likes += wasLiked ? -1 : 1;

        try {
            await PhotoService.likePhoto(photoId);
        } catch (err) {
            // Revert
            photo.isLiked = wasLiked;
            photo.likes += wasLiked ? 1 : -1;
            console.error('Failed to like photo', err);
        }
    }
  };

  return {
    photos,
    loading,
    error,
    hasMore,
    fetchFeed,
    toggleLike
  };
}
