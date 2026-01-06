<script setup lang="ts">
import Navbar from './components/common/Navbar.vue';
import Carousel from './components/carousel/Carousel.vue';
import CarouselSlide from './components/carousel/CarouselSlide.vue';

const slides = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80',
    title: 'Mountain Lake',
    desc: 'Reflections into the soul.'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1600&q=80',
    title: 'Forest Path',
    desc: 'A journey of a thousand miles.'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
    title: 'Misty Peaks',
    desc: 'Above the clouds.'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1501854140884-074bf86ee91c?auto=format&fit=crop&w=1600&q=80',
    title: 'Golden Sunset',
    desc: 'End of a beautiful day.'
  }
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900">
    <Navbar />
    
    <main class="max-w-4xl mx-auto px-6 py-12">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold mb-2">Image Carousel</h1>
        <p class="text-gray-500">Accessible, infinite-looping carousel with smooth transitions.</p>
      </div>

      <!-- Carousel Instance -->
      <div class="aspect-video w-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5">
        <Carousel :count="slides.length">
          <template #default="{ currentIndex, direction }">
             <CarouselSlide 
               v-for="(slide, index) in slides" 
               :key="slide.id"
               :index="index"
               :current-index="currentIndex"
               :direction="direction"
             >
                <div class="relative w-full h-full">
                  <img :src="slide.url" class="absolute inset-0 w-full h-full object-cover" :alt="slide.title" />
                  
                  <!-- Caption Overlay -->
                  <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white pt-24">
                    <h2 class="text-2xl font-bold mb-1">{{ slide.title }}</h2>
                    <p class="text-white/80">{{ slide.desc }}</p>
                  </div>
                </div>
             </CarouselSlide>
          </template>
        </Carousel>
      </div>

    </main>
  </div>
</template>
