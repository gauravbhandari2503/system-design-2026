<script setup lang="ts">
import { ref } from 'vue';

const location = ref('');
const dates = ref('');
const guests = ref(1);

const emit = defineEmits<{
  (e: 'search', criteria: { location: string }): void;
}>();

const handleSearch = () => {
  emit('search', { location: location.value });
};
</script>

<template>
  <div class="bg-white rounded-full shadow-lg border border-gray-200 p-2 flex items-center max-w-4xl mx-auto divide-x divide-gray-200">
    <!-- Location -->
    <label class="px-6 flex-1 cursor-text hover:bg-gray-100/50 rounded-full py-2 transition-colors block relative">
      <div class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Where</div>
      <input 
        v-model="location"
        type="text" 
        placeholder="Search destinations" 
        class="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-sm truncate font-medium"
        @keyup.enter="handleSearch"
      >
    </label>

    <!-- Check In -->
    <label class="px-6 flex-1 cursor-pointer hover:bg-gray-100/50 rounded-full py-2 transition-colors block relative">
      <div class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Check in</div>
      <input 
        v-model="dates"
        type="date" 
        class="w-full bg-transparent border-none outline-none text-gray-900 text-sm font-medium"
      >
    </label>

    <!-- Check Out -->
    <label class="px-6 flex-1 cursor-pointer hover:bg-gray-100/50 rounded-full py-2 transition-colors block relative">
      <div class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Check out</div>
      <input 
        type="date" 
        class="w-full bg-transparent border-none outline-none text-gray-900 text-sm font-medium"
      >
    </label>

    <!-- Guests & Button -->
    <div class="pl-6 pr-2 flex-[0.8] flex items-center justify-between">
      <label class="flex-1 cursor-pointer hover:bg-gray-100/50 rounded-full py-2 transition-colors block relative">
        <div class="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Who</div>
        <input 
          v-model="guests"
          type="number" 
          min="1"
          class="w-full bg-transparent border-none outline-none text-gray-900 text-sm font-medium"
          placeholder="Add guests"
        >
      </label>
      
      <!-- Search Button -->
      <button 
        type="button"
        @click.stop="handleSearch"
        class="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 ml-2 cursor-pointer z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
    </div>
  </div>
</template>
