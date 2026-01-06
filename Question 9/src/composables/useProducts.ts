import { ref, watch } from 'vue';
import type { Product } from '../models/Product';
import { ProductService } from '../api/product';

const products = ref<Product[]>([]);
const categories = ref<string[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedCategory = ref('all');

export function useProducts() {
  const fetchProducts = async () => {
    loading.value = true;
    error.value = null;
    try {
      products.value = await ProductService.getProducts(selectedCategory.value);
    } catch (e: any) {
      error.value = e.message || 'Failed to load products';
    } finally {
      loading.value = false;
    }
  };

  const fetchCategories = async () => {
      categories.value = await ProductService.getCategories();
  };

  watch(selectedCategory, () => {
      fetchProducts();
  });

  return {
    products,
    categories,
    loading,
    error,
    selectedCategory,
    fetchProducts,
    fetchCategories
  };
}
