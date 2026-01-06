import type { Property, BookingResult } from '../models/Property';

// Mock Data
const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Modern Loft in Downtown',
    location: 'San Francisco, CA',
    rating: 4.8,
    reviewCount: 124,
    pricePerNight: 250,
    dates: 'Oct 23-28',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    isSuperhost: true,
  },
  {
    id: 'prop-2',
    title: 'Cozy Cabin in the Woods',
    location: 'Lake Tahoe, CA',
    rating: 4.9,
    reviewCount: 85,
    pricePerNight: 180,
    dates: 'Nov 10-15',
    images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80'],
    isSuperhost: false,
  },
   {
    id: 'prop-3',
    title: 'Beachfront Villa',
    location: 'Malibu, CA',
    rating: 4.95,
    reviewCount: 200,
    pricePerNight: 850,
    dates: 'Sep 15-20',
    images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80'],
    isSuperhost: true,
  },
  {
    id: 'prop-4',
    title: 'Urban Apartment',
    location: 'New York, NY',
    rating: 4.6,
    reviewCount: 310,
    pricePerNight: 195,
    dates: 'Dec 01-05',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    isSuperhost: false,
  },
];

export const PropertyService = {
  async searchProperties(location: string): Promise<Property[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!location) resolve(MOCK_PROPERTIES);
        const filtered = MOCK_PROPERTIES.filter(p => 
          p.location.toLowerCase().includes(location.toLowerCase()) ||
          p.title.toLowerCase().includes(location.toLowerCase())
        );
        console.log(`[PropertyService] Search: "${location}", Found: ${filtered.length}`);
        resolve(filtered);
      }, 600);
    });
  },

  /**
   * Simulates a booking attempt.
   * 30% chance of a "CONFLICT" error to simulate a race condition (Double Booking).
   */
  async bookProperty(propertyId: string): Promise<BookingResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // SIMULATE DISTRIBUTED LOCK CONFLICT
        const isConflict = Math.random() < 0.3; // 30% chance collision

        if (isConflict) {
          resolve({ 
            success: false, 
            error: 'CONFLICT' 
          });
        } else {
          resolve({ 
            success: true, 
            bookingId: `bk-${Math.random().toString(36).substr(2, 9)}` 
          });
        }
      }, 1500); // Simulate processing time
    });
  }
};
