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
  <div class="flex flex-col gap-4">
      <VideoCard 
        v-for="video in videos" 
        :key="video.id" 
        :video="video"
        compact
        @click="emit('select', video.id)"
      />
  </div>
</template>
