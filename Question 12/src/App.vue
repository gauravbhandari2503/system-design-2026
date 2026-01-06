<script setup lang="ts">
import Navbar from './components/common/Navbar.vue';
import EditorCanvas from './components/collab/EditorCanvas.vue';
import CursorOverlay from './components/collab/CursorOverlay.vue';
import { useCollaboration } from './composables/useCollaboration';

const { content, users, cursors } = useCollaboration();
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col font-sans">
    <Navbar :users="users" />
    
    <main class="flex-1 overflow-y-auto p-8 flex justify-center">
        <div class="relative w-full max-w-[850px]">
            <!-- Cursors Layer -->
            <CursorOverlay :cursors="cursors" :users="users" />
            
            <!-- Document Layer -->
            <EditorCanvas v-model="content" />
        </div>
    </main>
  </div>
</template>
