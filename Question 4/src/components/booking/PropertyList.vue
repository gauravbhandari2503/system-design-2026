<script setup lang="ts">
import { ref } from 'vue';
import { useProperties } from '../../composables/useProperties';
import PropertyCard from './PropertyCard.vue';

// Use the composable ONLY for booking actions
const { 
  bookingLoading,
  bookingError,
  bookingSuccessId,
  bookProperty,
  resetBookingState
} = useProperties();

const props = defineProps<{
  properties: any[]; 
  loading: boolean;
  error: string | null;
}>();

// Track which property is currently being acted upon to show error/success on the correct card
const activePropertyId = ref<string | null>(null);

const handleBook = async (id: string) => {
  if (activePropertyId.value !== id) {
     resetBookingState();
     activePropertyId.value = id;
  }
  await bookProperty(id);
};
</script>

<template>
  <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <!-- Skeleton Loaders -->
    <div v-for="i in 8" :key="i" class="flex flex-col gap-2">
      <div class="aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
      <div class="h-4 bg-gray-200 rounded w-3/4 animate-pulse mt-2"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </div>
  </div>

  <div v-else-if="error" class="text-center py-20">
    <p class="text-red-500 text-lg">{{ error }}</p>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
    <PropertyCard 
      v-for="property in properties" 
      :key="property.id" 
      :property="property"
      :loading="bookingLoading && activePropertyId === property.id"
      :booking-error="activePropertyId === property.id ? bookingError : null"
      :booking-success-id="activePropertyId === property.id ? bookingSuccessId : null"
      @book="handleBook"
    />
  </div>
</template>
