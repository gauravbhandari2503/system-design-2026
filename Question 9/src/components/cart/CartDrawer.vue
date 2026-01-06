<script setup lang="ts">
import { useCart } from '../../composables/useCart';

const { cartItems, isCartOpen, cartTotal, toggleCart, removeFromCart, updateQuantity, clearCart } = useCart();

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

const checkout = () => {
    alert('Thank you for your purchase! (Demo)');
    clearCart();
    toggleCart();
};
</script>

<template>
  <div>
    <!-- Backdrop -->
    <div 
      v-if="isCartOpen" 
      class="fixed inset-0 bg-black/50 z-40 transition-opacity"
      @click="toggleCart"
    ></div>

    <!-- Drawer -->
    <div 
        class="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
        :class="isCartOpen ? 'translate-x-0' : 'translate-x-full'"
    >
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">Shopping Cart</h2>
            <button @click="toggleCart" class="p-2 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <p>Your cart is empty</p>
                <button @click="toggleCart" class="text-blue-600 font-medium hover:underline">Start Shopping</button>
            </div>

            <div v-for="item in cartItems" :key="item.product.id" class="flex gap-4 border-b border-gray-50 pb-4">
                <img :src="item.product.image" :alt="item.product.title" class="w-16 h-16 object-cover rounded-md bg-gray-100">
                <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900 line-clamp-2">{{ item.product.title }}</h3>
                    <p class="text-sm text-gray-500 mt-1">{{ formatPrice(item.product.price) }}</p>
                    <div class="flex items-center justify-between mt-2">
                         <div class="flex items-center border rounded-md">
                             <button @click="updateQuantity(item.product.id, -1)" class="px-2 py-1 hover:bg-gray-50 text-gray-600">-</button>
                             <span class="px-2 text-sm text-gray-900">{{ item.quantity }}</span>
                             <button @click="updateQuantity(item.product.id, 1)" class="px-2 py-1 hover:bg-gray-50 text-gray-600">+</button>
                         </div>
                         <button @click="removeFromCart(item.product.id)" class="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="cartItems.length > 0" class="p-4 border-t border-gray-100 bg-gray-50">
            <div class="flex justify-between items-center mb-4">
                <span class="text-gray-600">Subtotal</span>
                <span class="text-lg font-bold text-gray-900">{{ formatPrice(cartTotal) }}</span>
            </div>
            <button 
                @click="checkout"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <span>Checkout</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
        </div>
    </div>
  </div>
</template>
