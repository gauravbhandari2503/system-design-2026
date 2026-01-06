<script setup lang="ts">
import { onMounted } from 'vue';
import FeedItem from './FeedItem.vue';
import InfiniteScroll from '../common/InfiniteScroll.vue';
import { useFeed } from '../../composables/useFeed';

const { posts, loading, error, hasMore, fetchFeed, toggleLike } = useFeed();

onMounted(() => {
  // Initial fetch
  fetchFeed();
});
</script>

<template>
  <div class="max-w-xl mx-auto py-8 px-4 flex flex-col gap-6">
    <!-- Error State -->
    <div 
      v-if="error" 
      class="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-between"
    >
      <span>{{ error }}</span>
      <button 
        @click="fetchFeed" 
        class="text-sm font-semibold hover:underline"
      >
        Retry
      </button>
    </div>

    <!-- Feed List with Infinite Scroll -->
    <InfiniteScroll
      :loading="loading"
      :has-more="hasMore"
      @load-more="fetchFeed"
    >
      <TransitionGroup 
        name="feed" 
        tag="div" 
        class="flex flex-col gap-6"
      >
        <FeedItem 
          v-for="post in posts" 
          :key="post.id" 
          :post="post" 
          @like="toggleLike"
        />
      </TransitionGroup>

      <!-- Custom Loading Slot (Optional, defaulting to generic) -->
      <template #loading>
        <div class="flex items-center gap-2 text-gray-500">
           <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Fetching more updates...</span>
        </div>
      </template>
      
      <!-- Custom No More Slot -->
      <template #no-more>
        <div class="text-gray-400 text-sm">
          You've reached the end of the feed!
        </div>
      </template>

    </InfiniteScroll>

    <!-- Empty State (handled outside if needed, or could be in slot) -->
    <div v-if="!loading && posts.length === 0" class="text-gray-500 text-center py-10">
      No posts found. Check back later!
    </div>
  </div>
</template>

<style scoped>
.feed-move,
.feed-enter-active,
.feed-leave-active {
  transition: all 0.5s ease;
}

.feed-enter-from,
.feed-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.feed-leave-active {
  position: absolute;
}
</style>
