export interface Property {
  id: string;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  dates: string;
  images: string[];
  isSuperhost: boolean;
  isLocked?: boolean; // For simulation
}

export interface BookingResult {
  success: boolean;
  error?: 'CONFLICT' | 'NETWORK_ERROR';
  bookingId?: string;
}
