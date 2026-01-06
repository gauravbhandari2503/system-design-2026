<script setup lang="ts">
import { useCarousel } from '../../composables/useCarousel';
import CarouselControls from './CarouselControls.vue';

const props = withDefaults(defineProps<{
  count: number;
  interval?: number;
  autoplay?: boolean;
}>(), {
  interval: 5000,
  autoplay: true,
});

const { 
  currentIndex, 
  direction, 
  next, 
  prev, 
  goto, 
  startAutoplay, 
  stopAutoplay 
} = useCarousel(props.count, props.interval, props.autoplay);

// Expose state to slots
defineExpose({ next, prev, goto });
</script>

<template>
  <div 
    class="relative w-full h-full overflow-hidden group rounded-xl shadow-xl bg-gray-900"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
    tabindex="0"
    @keydown.left="prev"
    @keydown.right="next"
  >
    <!-- Slides Slot -->
    <div class="relative w-full h-full">
       <slot 
         :current-index="currentIndex"
         :direction="direction"
       />
    </div>

    <!-- Controls -->
    <CarouselControls 
      :total="count"
      :current="currentIndex"
      @prev="prev"
      @next="next"
      @goto="goto"
    />
  </div>
</template>
