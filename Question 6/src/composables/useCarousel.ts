import { ref, watch, onMounted, onUnmounted } from 'vue';

export function useCarousel(totalItems: number, interval = 3000, autoplay = true) {
  const currentIndex = ref(0);
  const direction = ref<'left' | 'right'>('right');
  let intervalId: any = null;

  const next = () => {
    direction.value = 'right';
    currentIndex.value = (currentIndex.value + 1) % totalItems;
  };

  const prev = () => {
    direction.value = 'left';
    currentIndex.value = (currentIndex.value - 1 + totalItems) % totalItems;
  };

  const goto = (index: number) => {
    direction.value = index > currentIndex.value ? 'right' : 'left';
    currentIndex.value = index;
  };

  const startAutoplay = () => {
    if (autoplay && !intervalId) {
      intervalId = setInterval(next, interval);
    }
  };

  const stopAutoplay = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  // Lifecycle
  onMounted(() => startAutoplay());
  onUnmounted(() => stopAutoplay());

  return {
    currentIndex,
    direction,
    next,
    prev,
    goto,
    startAutoplay,
    stopAutoplay
  };
}
