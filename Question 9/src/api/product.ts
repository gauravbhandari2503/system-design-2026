import type { Product } from '../models/Product';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Wireless Noise Cancelling Headphones',
    price: 299.99,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    rating: 4.8,
    description: 'Premium wireless headphones with industry-leading noise cancellation.'
  },
  {
    id: '2',
    title: 'Minimalist Wristwatch',
    price: 129.50,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    rating: 4.5,
    description: 'Elegant minimalist design perfect for any occasion.'
  },
  {
    id: '3',
    title: 'Ergonomic Office Chair',
    price: 499.00,
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80',
    rating: 4.7,
    description: 'Designed for comfort and productivity during long work hours.'
  },
  {
    id: '4',
    title: 'Smart Home Speaker',
    price: 99.99,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&q=80',
    rating: 4.3,
    description: 'Voice-controlled speaker with high-fidelity sound.'
  },
  {
    id: '5',
    title: 'Leather Messenger Bag',
    price: 185.00,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    rating: 4.9,
    description: 'Handcrafted leather bag with spacious compartments.'
  },
  {
    id: '6',
    title: 'Mechanical Keyboard',
    price: 159.00,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=500&q=80',
    rating: 4.6,
    description: 'High-performance mechanical keyboard with RGB backlighting.'
  }
];

export const ProductService = {
  getProducts(category?: string): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (category && category !== 'all') {
            resolve(MOCK_PRODUCTS.filter(p => p.category === category));
        } else {
            resolve(MOCK_PRODUCTS);
        }
      }, 500);
    });
  },

  getCategories(): Promise<string[]> {
      return new Promise((resolve) => {
          setTimeout(() => {
              const categories = Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)));
              resolve(['all', ...categories]);
          }, 200);
      });
  }
};
