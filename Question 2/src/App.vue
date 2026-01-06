<script setup lang="ts">
import Navbar from './components/common/Navbar.vue';
import AutocompleteInput from './components/autocomplete/AutocompleteInput.vue';
import type { SearchResult } from './models/SearchResult';
import { ref } from 'vue';

const selectedItem = ref<SearchResult | null>(null);

const onSelect = (item: SearchResult) => {
  selectedItem.value = item;
  console.log('Selected:', item);
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900">
    <Navbar />
    
    <main class="container mx-auto px-4 py-20 flex flex-col items-center">
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          What are you looking for?
        </h1>
        <p class="text-gray-500 text-lg">
          Search for people, groups, documents, or anything else.
        </p>
      </div>

      <!-- Autocomplete Component -->
      <AutocompleteInput 
        placeholder="Search users, groups, or pages..."
        :autofocus="true"
        @select="onSelect"
      />

      <!-- Selected State Demo -->
      <div v-if="selectedItem" class="mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-100 max-w-lg w-full text-center animate-fade-in">
        <span class="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2 block">You Selected</span>
        <div class="flex items-center justify-center gap-4 mb-4">
           <img 
            v-if="selectedItem.image" 
            :src="selectedItem.image" 
            class="w-16 h-16 rounded-full border-4 border-blue-50"
          />
          <div class="text-left">
            <h3 class="text-xl font-bold text-gray-900">{{ selectedItem.title }}</h3>
            <p v-if="selectedItem.subtitle" class="text-gray-500">{{ selectedItem.subtitle }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
</style>
