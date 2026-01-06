import { ref } from 'vue';
import { PropertyService } from '../api/property';
import type { Property } from '../models/Property';

export function useProperties() {
  const properties = ref<Property[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Booking State
  const bookingLoading = ref(false);
  const bookingError = ref<string | null>(null);
  const bookingSuccessId = ref<string | null>(null);

  const search = async (location: string = '') => {
    loading.value = true;
    error.value = null;
    try {
      console.log(`[useProperties] Searching for: "${location}"`);
      properties.value = await PropertyService.searchProperties(location);
      console.log(`[useProperties] Results: ${properties.value.length}`);
    } catch (err) {
      error.value = 'Failed to load properties.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const bookProperty = async (propertyId: string) => {
    bookingLoading.value = true;
    bookingError.value = null;
    bookingSuccessId.value = null;

    try {
      const res = await PropertyService.bookProperty(propertyId);
      if (res.success) {
        bookingSuccessId.value = res.bookingId || 'bk-default';
      } else {
        if (res.error === 'CONFLICT') {
          // This matches the "Race Condition" requirement
          bookingError.value = 'Someone just booked this property! Please try another dates.';
        } else {
          bookingError.value = 'Failed to process booking. Please try again.';
        }
      }
    } catch (err) {
       bookingError.value = 'Network error. Please check your connection.';
       console.error(err);
    } finally {
      bookingLoading.value = false;
    }
  };

  return {
    properties,
    loading,
    error,
    search,
    // Booking
    bookingLoading,
    bookingError,
    bookingSuccessId,
    bookProperty,
    resetBookingState: () => {
      bookingError.value = null;
      bookingSuccessId.value = null;
    }
  };
}
