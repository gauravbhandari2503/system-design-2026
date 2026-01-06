<script setup lang="ts">
import { useCart } from '../../composables/useCart';

const { cartCount, toggleCart } = useCart();
</script>

<template>
  <nav class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <div class="bg-blue-600 p-1.5 rounded-lg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight">ShopMaster</h1>
        </div>

        <button 
            @click="toggleCart"
            class="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span 
                v-if="cartCount > 0"
                class="absolute -top-0 -right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce-in"
            >
                {{ cartCount }}
            </span>
        </button>
    </div>
  </nav>
</template>

<style scoped>
@keyframes bounce-in {
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}
.animate-bounce-in {
    animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
