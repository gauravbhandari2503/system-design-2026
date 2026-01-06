<script setup lang="ts">
import Navbar from './components/common/Navbar.vue';
import FeedList from './components/feed/FeedList.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <Navbar />
    
    <main class="container mx-auto px-4 sm:px-6 lg:px-8">
      <FeedList />
    </main>
  </div>
</template>
