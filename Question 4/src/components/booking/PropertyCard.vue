<script setup lang="ts">
import { ref } from 'vue';
import type { Property } from '../../models/Property';

const props = defineProps<{
  property: Property;
  loading: boolean;
  bookingError: string | null;
  bookingSuccessId: string | null;
}>();

const emit = defineEmits<{
  (e: 'book', id: string): void;
}>();

const currentImageIndex = ref(0);

const nextImage = (e: Event) => {
  e.stopPropagation();
  currentImageIndex.value = (currentImageIndex.value + 1) % props.property.images.length;
};

const prevImage = (e: Event) => {
  e.stopPropagation();
  currentImageIndex.value = (currentImageIndex.value - 1 + props.property.images.length) % props.property.images.length;
};
</script>

<template>
  <div class="group flex flex-col gap-2 relative">
    
    <!-- Image Carousel -->
    <div class="aspect-square w-full rounded-xl bg-gray-200 relative overflow-hidden">
      <img 
        :src="property.images[currentImageIndex]" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        alt="Property Image"
      >
      
      <!-- Carousel Controls (Hidden on mobile, visible on group hover) -->
      <!-- Simplified for POC: Just showing heart icon overlay -->
      <button class="absolute top-3 right-3 text-white/70 hover:text-white transition-colors hover:scale-110 active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="rgba(0,0,0,0.5)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>

      <div v-if="property.isSuperhost" class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold text-gray-800 uppercase tracking-wide">
        Superhost
      </div>
    </div>

    <!-- Details -->
    <div class="flex justify-between items-start mt-1">
      <h3 class="font-semibold text-gray-900 truncate pr-2">{{ property.location }}</h3>
      <div class="flex items-center gap-1 text-sm">
        <svg class="text-gray-900 w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        <span>{{ property.rating }}</span>
      </div>
    </div>
    
    <p class="text-gray-500 text-sm leading-tight">{{ property.title }}</p>
    <p class="text-gray-500 text-sm leading-tight">{{ property.dates }}</p>

    <div class="mt-1 flex items-baseline gap-1">
      <span class="font-semibold text-gray-900 text-lg">${{ property.pricePerNight }}</span>
      <span class="text-gray-900">night</span>
    </div>

    <!-- Booking Action (Simplified for inline list booking) -->
    <div class="mt-2">
      <button 
        @click="emit('book', property.id)" 
        :disabled="loading"
        class="w-full py-2 rounded-lg font-medium text-sm transition-all"
        :class="[
           loading ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow active:scale-[0.98]'
        ]"
      >
        <span v-if="loading">Checking availability...</span>
        <span v-else>Book Now</span>
      </button>

      <!-- Booking Feedback -->
       <div v-if="bookingError" class="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600 font-medium flex items-start gap-1">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          {{ bookingError }}
       </div>

       <div v-if="bookingSuccessId" class="mt-2 p-2 bg-green-50 border border-green-100 rounded text-xs text-green-700 font-medium flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Booked! ID: {{ bookingSuccessId }}
       </div>
    </div>

  </div>
</template>
