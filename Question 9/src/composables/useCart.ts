import { ref, computed, watch } from 'vue';
import type { Product } from '../models/Product';
import type { CartItem } from '../models/CartItem';

// State is outside function for global persistence
const cartItems = ref<CartItem[]>([]);
const isCartOpen = ref(false);

// Load from local storage
const loadCart = () => {
    const saved = localStorage.getItem('ecommerce_cart');
    if (saved) {
        try {
            cartItems.value = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse cart', e);
        }
    }
};

loadCart();

// Save on change
watch(cartItems, (newItems) => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(newItems));
}, { deep: true });

export function useCart() {
  const cartCount = computed(() => cartItems.value.reduce((acc, item) => acc + item.quantity, 0));
  const cartTotal = computed(() => cartItems.value.reduce((acc, item) => acc + (item.product.price * item.quantity), 0));

  const addToCart = (product: Product) => {
    const existing = cartItems.value.find(item => item.product.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        cartItems.value.push({ product, quantity: 1 });
    }
    isCartOpen.value = true; // Open cart for feedback
  };

  const removeFromCart = (productId: string) => {
      cartItems.value = cartItems.value.filter(item => item.product.id !== productId);
  };

  const updateQuantity = (productId: string, delta: number) => {
      const item = cartItems.value.find(item => item.product.id === productId);
      if (item) {
          item.quantity += delta;
          if (item.quantity <= 0) {
              removeFromCart(productId);
          }
      }
  };

  const clearCart = () => {
      cartItems.value = [];
  };

  const toggleCart = () => {
      isCartOpen.value = !isCartOpen.value;
  };

  return {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart
  };
}
