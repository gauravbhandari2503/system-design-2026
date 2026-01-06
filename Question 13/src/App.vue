<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { VideoService, type Video } from './api/videos';
import Navbar from './components/common/Navbar.vue';
import VideoGrid from './components/video/VideoGrid.vue';
import VideoPlayer from './components/video/VideoPlayer.vue';
import RelatedVideos from './components/video/RelatedVideos.vue';
import VideoCard from './components/video/VideoCard.vue';

const videos = ref<Video[]>([]);
const currentVideoId = ref<string | null>(null);

const currentVideo = computed(() => videos.value.find(v => v.id === currentVideoId.value));
const relatedVideos = computed(() => videos.value.filter(v => v.id !== currentVideoId.value));

const selectVideo = (id: string) => {
    currentVideoId.value = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(async () => {
    videos.value = await VideoService.getVideos();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <Navbar />
    
    <main class="max-w-screen-2xl mx-auto px-4 py-6">
        <!-- Video View -->
        <div v-if="currentVideo" class="flex flex-col lg:flex-row gap-6">
            <div class="flex-1 min-w-0">
                <VideoPlayer :video="currentVideo" />
                
                <div class="mt-4 pb-4 border-b border-gray-200">
                    <h1 class="text-xl font-bold text-gray-900 mb-2">{{ currentVideo.title }}</h1>
                    
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <img :src="currentVideo.author.avatar" class="w-10 h-10 rounded-full">
                            <div>
                                <h3 class="font-bold text-gray-900">{{ currentVideo.author.name }}</h3>
                                <p class="text-xs text-gray-500">{{ currentVideo.author.subscribers }} subscribers</p>
                            </div>
                            <button class="bg-black text-white px-4 py-2 rounded-full text-sm font-medium ml-4 hover:bg-gray-800">Subscribe</button>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <button class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-sm font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                12K
                            </button>
                            <button class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 text-sm font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                                Share
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 bg-gray-100 p-4 rounded-xl text-sm whitespace-pre-line text-gray-800">
                    <p><span class="font-bold">{{ currentVideo.views }} views • {{ currentVideo.uploadedAt }}</span></p>
                    <p class="mt-2">{{ currentVideo.description }}</p>
                </div>
            </div>
            
            <div class="lg:w-[400px] flex-shrink-0">
                <RelatedVideos :videos="relatedVideos" @select="selectVideo" />
            </div>
        </div>

        <!-- Browse View -->
        <div v-else>
            <h2 class="text-xl font-bold mb-6">Recommended</h2>
            <VideoGrid :videos="videos" @select="selectVideo" />
        </div>
    </main>
  </div>
</template>
