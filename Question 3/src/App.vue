<script setup lang="ts">
import Navbar from './components/common/Navbar.vue';
import PollWidget from './components/poll/PollWidget.vue';

// We use the ID from the mock service
const POLL_ID = 'poll-1';
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <Navbar />
    
    <main class="container mx-auto px-4 py-20 flex flex-col items-center">
      <div class="text-center mb-12 max-w-2xl">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-4">
          Interactive Polls
        </h1>
        <p class="text-gray-500 text-lg">
          Engage your audience with real-time, embeddable polls. Cast your vote below to see it in action.
        </p>
      </div>

      <!-- Poll Widget Demo -->
      <PollWidget :pollId="POLL_ID" />
      
      <div class="mt-12 text-sm text-gray-400">
        Demo ID: {{ POLL_ID }}
      </div>
    </main>
  </div>
</template>
