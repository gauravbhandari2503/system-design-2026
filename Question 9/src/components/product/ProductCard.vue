<script setup lang="ts">
import type { Product } from '../../models/Product';
import { useCart } from '../../composables/useCart';

defineProps<{
  product: Product;
}>();

const { addToCart } = useCart();
const formatPrice = (price: number) => `$${price.toFixed(2)}`;
</script>

<template>
  <div class="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden flex flex-col h-full">
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden bg-gray-100">
        <img 
            :src="product.image" 
            :alt="product.title" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
        >
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
    </div>

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">{{ product.category }}</span>
            <div class="flex items-center gap-1 text-yellow-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span class="font-bold text-gray-900">{{ product.rating }}</span>
            </div>
        </div>
        
        <h3 class="font-bold text-gray-900 mb-1 line-clamp-2" :title="product.title">{{ product.title }}</h3>
        <p class="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{{ product.description }}</p>

        <div class="flex items-center justify-between mt-auto">
            <span class="text-lg font-bold text-blue-900">{{ formatPrice(product.price) }}</span>
            <button 
                @click="addToCart(product)"
                class="bg-gray-900 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                aria-label="Add to cart"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </button>
        </div>
    </div>
  </div>
</template>
