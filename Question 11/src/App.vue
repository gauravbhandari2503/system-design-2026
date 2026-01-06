<script setup lang="ts">
import Navbar from './components/common/Navbar.vue';
import RichTextEditor from './components/editor/RichTextEditor.vue';
import { useEditor } from './composables/useEditor';

// Just for view-source demo in App
const { content } = useEditor();
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans flex flex-col">
    <Navbar />
    
    <main class="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        <!-- Editor -->
        <div class="flex-1 h-[600px]">
            <RichTextEditor />
        </div>

        <!-- Debug View -->
        <!-- Note: This is separate from the internal editor state for demo purposes, 
             in a real app you'd emit the content up -->
    </main>
  </div>
</template>
