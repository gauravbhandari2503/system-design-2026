<script setup lang="ts">
import Navbar from './components/common/Navbar.vue';
import PhotoFeed from './components/photo/PhotoFeed.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
    <Navbar />
    <main>
      <PhotoFeed />
    </main>
  </div>
</template>
