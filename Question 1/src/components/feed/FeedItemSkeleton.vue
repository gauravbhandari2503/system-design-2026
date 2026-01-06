<script setup lang="ts">
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 animate-pulse">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        <div class="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>

    <!-- Image -->
    <div class="w-full aspect-square bg-gray-200 rounded-lg mb-4"></div>

    <!-- Actions -->
    <div class="flex items-center gap-4 mb-3">
      <div class="w-6 h-6 bg-gray-200 rounded"></div>
      <div class="w-6 h-6 bg-gray-200 rounded"></div>
      <div class="w-6 h-6 bg-gray-200 rounded"></div>
    </div>

    <!-- Content -->
    <div class="space-y-2">
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
</template>
