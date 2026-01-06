<script setup lang="ts">
import type { Email } from '../../models/Email';

defineProps<{
  email: Email | null;
}>();
</script>

<template>
  <div class="h-full bg-white flex flex-col p-8 overflow-y-auto">
    <div v-if="email" class="animate-fade-in">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <div class="flex items-center gap-4">
                <div 
                    :class="['w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg', email.avatarColor]"
                >
                    {{ email.from.charAt(0).toUpperCase() }}
                </div>
                <div>
                    <h2 class="text-xl font-bold text-gray-900">{{ email.subject }}</h2>
                     <div class="flex items-center gap-2 mt-1">
                        <span class="text-sm font-medium text-gray-900">{{ email.from }}</span>
                        <span class="text-xs text-gray-500">&lt;{{ email.from.toLowerCase().replace(' ', '.') }}@example.com&gt;</span>
                    </div>
                </div>
            </div>
            <span class="text-sm text-gray-500">{{ email.date }}</span>
        </div>

        <!-- Body -->
        <div class="prose max-w-none text-gray-800 whitespace-pre-line">
            {{ email.body }}
        </div>
        
    </div>

    <!-- Empty State -->
    <div v-else class="h-full flex flex-col items-center justify-center text-gray-300">
       <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
       <p class="mt-4 text-lg font-medium">Select an email to read</p>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
