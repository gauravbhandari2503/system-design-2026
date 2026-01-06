import { onUnmounted } from 'vue';

export function useScrollLock() {
  const lock = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'; // Prevent shift
  };

  const unlock = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };

  onUnmounted(() => {
    unlock();
  });

  return {
    lock,
    unlock
  };
}
