import { ref, onMounted, onUnmounted } from 'vue';

export function useVideoPlayer(videoRef: any) {
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(1);
  const isMuted = ref(false);
  const isFullscreen = ref(false);

  const togglePlay = () => {
    if (!videoRef.value) return;
    if (videoRef.value.paused) {
      videoRef.value.play();
      isPlaying.value = true;
    } else {
      videoRef.value.pause();
      isPlaying.value = false;
    }
  };

  const seek = (time: number) => {
    if (!videoRef.value) return;
    videoRef.value.currentTime = time;
    currentTime.value = time;
  };

  const setVolume = (val: number) => {
    if (!videoRef.value) return;
    videoRef.value.volume = val;
    volume.value = val;
    isMuted.value = val === 0;
  };

  const toggleMute = () => {
    if (!videoRef.value) return;
    if (isMuted.value) {
        videoRef.value.volume = volume.value || 1;
        isMuted.value = false;
    } else {
        videoRef.value.volume = 0;
        isMuted.value = true;
    }
  };

  const toggleFullscreen = () => {
      const container = videoRef.value?.parentElement;
      if (!container) return;

      if (!document.fullscreenElement) {
          container.requestFullscreen();
          isFullscreen.value = true;
      } else {
          document.exitFullscreen();
          isFullscreen.value = false;
      }
  };

  // Event Listeners
  const onTimeUpdate = () => {
      if (videoRef.value) currentTime.value = videoRef.value.currentTime;
  };
  
  const onLoadedMetadata = () => {
      if (videoRef.value) duration.value = videoRef.value.duration;
  };

  const onEnded = () => {
      isPlaying.value = false;
  };

  onMounted(() => {
    if (videoRef.value) {
        videoRef.value.addEventListener('timeupdate', onTimeUpdate);
        videoRef.value.addEventListener('loadedmetadata', onLoadedMetadata);
        videoRef.value.addEventListener('ended', onEnded);
    }
  });

  onUnmounted(() => {
      if (videoRef.value) {
          videoRef.value.removeEventListener('timeupdate', onTimeUpdate);
          videoRef.value.removeEventListener('loadedmetadata', onLoadedMetadata);
          videoRef.value.removeEventListener('ended', onEnded);
      }
  });

  return {
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isFullscreen,
      togglePlay,
      seek,
      setVolume,
      toggleMute,
      toggleFullscreen
  };
}
