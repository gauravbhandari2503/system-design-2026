<script setup lang="ts">
import { useCarousel } from '../../composables/useCarousel';
import CarouselControls from './CarouselControls.vue';
import { ref } from 'vue';

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

// Swipe Logic
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50;

const handleTouchStart = (e: TouchEvent) => {
  if (e.changedTouches && e.changedTouches.length > 0) {
    touchStartX.value = e.changedTouches[0].screenX;
  }
  stopAutoplay();
};

const handleTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches && e.changedTouches.length > 0) {
    touchEndX.value = e.changedTouches[0].screenX;
    handleSwipe();
  }
  startAutoplay();
};

const handleSwipe = () => {
  const distance = touchStartX.value - touchEndX.value;
  if (Math.abs(distance) < minSwipeDistance) return;

  if (distance > 0) {
    next(); // Swiped Left -> Next
  } else {
    prev(); // Swiped Right -> Prev
  }
};

// Expose state to slots
defineExpose({ next, prev, goto });
</script>

<template>
  <div 
    class="relative w-full h-full overflow-hidden group rounded-xl shadow-xl bg-gray-900 touch-pan-y"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    tabindex="0"
    @keydown.left="prev"
    @keydown.right="next"
    role="region"
    aria-roledescription="carousel"
    aria-label="Content Slides"
  >
    <!-- Slides Slot -->
    <div 
      class="relative w-full h-full"
      aria-live="polite"
    >
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
      aria-controls="carousel-items"
    />
  </div>
</template>
