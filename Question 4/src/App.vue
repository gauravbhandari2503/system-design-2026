<script setup lang="ts">
import { onMounted } from 'vue';
import Navbar from './components/common/Navbar.vue';
import SearchBar from './components/booking/SearchBar.vue';
import PropertyList from './components/booking/PropertyList.vue';
import { useProperties } from './composables/useProperties';

const { properties, loading, error, search } = useProperties();

const handleSearch = (criteria: { location: string }) => {
  search(criteria.location);
};

onMounted(() => {
  // Initial fetch
  search();
});
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 font-sans">
    
    <!-- Combined Sticky Header -->
    <header class="sticky top-0 z-50 bg-white shadow-sm">
      <Navbar />
      <div class="border-b border-gray-100 py-4">
         <SearchBar @search="handleSearch" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <PropertyList 
        :properties="properties" 
        :loading="loading" 
        :error="error"
      />
    </main>
  </div>
</template>
