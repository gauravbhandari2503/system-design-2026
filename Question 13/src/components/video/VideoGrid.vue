<script setup lang="ts">
import type { Video } from '../../api/videos';
import VideoCard from './VideoCard.vue';

defineProps<{
  videos: Video[];
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      <VideoCard 
        v-for="video in videos" 
        :key="video.id" 
        :video="video"
        @click="emit('select', video.id)"
      />
  </div>
</template>
