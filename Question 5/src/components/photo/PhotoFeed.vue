<script setup lang="ts">
import { onMounted } from 'vue';
import { usePhotos } from '../../composables/usePhotos';
import PhotoCard from './PhotoCard.vue';
import InfiniteScroll from '../common/InfiniteScroll.vue';

const { photos, loading, hasMore, fetchFeed, toggleLike } = usePhotos();

onMounted(() => {
  fetchFeed();
});

const loadMore = () => {
  fetchFeed();
};
</script>

<template>
  <div class="max-w-md mx-auto py-6">
    <!-- Feed Items -->
    <div v-for="photo in photos" :key="photo.id">
      <PhotoCard 
        :photo="photo" 
        @like="toggleLike"
      />
    </div>

    <!-- Infinite Scroll Trigger -->
    <InfiniteScroll 
      :loading="loading" 
      :has-more="hasMore" 
      @load-more="loadMore"
    />
  </div>
</template>
