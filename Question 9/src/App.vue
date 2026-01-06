<script setup lang="ts">
import { onMounted } from 'vue';
import Navbar from './components/common/Navbar.vue';
import ProductCard from './components/product/ProductCard.vue';
import CartDrawer from './components/cart/CartDrawer.vue';
import { useProducts } from './composables/useProducts';

const { products, categories, loading, error, selectedCategory, fetchProducts, fetchCategories } = useProducts();

onMounted(() => {
    fetchCategories();
    fetchProducts();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <Navbar />
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Filters -->
        <div class="flex items-center gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
            <button 
                v-for="cat in categories" 
                :key="cat"
                @click="selectedCategory = cat"
                class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border"
                :class="selectedCategory === cat 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'"
            >
                {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
            </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="i in 6" :key="i" class="bg-white rounded-xl h-[400px] animate-pulse">
                <div class="h-[200px] bg-gray-200 rounded-t-xl"></div>
                <div class="p-4 space-y-3">
                    <div class="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-20">
            <p class="text-red-500">{{ error }}</p>
            <button @click="fetchProducts" class="mt-4 text-blue-600 underline">Try Again</button>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard 
                v-for="product in products" 
                :key="product.id" 
                :product="product"
            />
        </div>
    </main>

    <CartDrawer />
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
