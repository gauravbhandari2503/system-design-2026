<script setup lang="ts">
import { onMounted } from 'vue';
import FeedItem from './FeedItem.vue';
import FeedItemSkeleton from './FeedItemSkeleton.vue';
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

      <!-- Skeleton Loading for Initial Load or Loading More -->
      <div v-if="loading" class="flex flex-col gap-6 mt-6">
           <FeedItemSkeleton v-for="n in 2" :key="n" />
      </div>

      <!-- Custom Loading Slot (Optional, defaulting to generic) -->
      <template #loading>
        <!-- Replaced by external skeleton -->
        <span></span> 
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
