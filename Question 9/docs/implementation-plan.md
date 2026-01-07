# E-commerce Website (Question 9) Implementation Plan

## Goal
Implement a responsive e-commerce storefront with cart management, filtering, and simulated checkout, while documenting the complex backend systems required for a production-grade platform.

## Proposed Changes (Gap Analysis)
We track what is implemented in the Frontend POC vs what a Real Production System requires.

| Feature | Frontend POC (Current) | Production Backend Requirement |
| :--- | :--- | :--- |
| **Inventory** | Infinite supply. No stock checks. | **Concurrency Control**: Optimistic/Pessimistic locking to prevent overselling. **Real-time Sync**: WebSockets for stock updates. |
| **Cart** | `localStorage` persistence. | **Server-side Cart**: Sync across devices (app/web). **Price Locking**: Holding reservations for X minutes. |
| **Checkout** | Browser `alert()` only. No steps. | **Multi-Step Checkout**: Shipping -> Billing -> Review. **Tax Calculation**: Real-time tax (Avalara/Vertex). **Shipping Rates**: Carrier APIs (FedEx/UPS). |
| **Payments** | Not implemented. | **PCI Compliance**: Tokenization (Stripe/PayPal). **Idempotency**: Preventing double charges. **Fraud Detection**: Velocity checks, AVS. |
| **Search** | Filter Array (Category/Price). | **Elasticsearch**: Fuzzy matching, faceted search, relevance ranking. |
| **Security** | None. | **Rate Limiting** (DDoS), **Bot Detection** (Scalper bots), **Input Sanitization**. |

## Architecture

### Components
- **ProductList.vue**: Grid of products with responsive layout.
- **ProductFilters.vue**: Sidebar for filtering by Category/Price.
- **CartDrawer.vue**: Slide-over cart view with quantity management.
- **Navbar.vue**: Global navigation with animated Cart Badge.

### Logic (`useCart.ts`)
- **Persistence**: automatically syncs `cartItems` to `localStorage` via Vue `watch`.
- **State**: `cartItems`, `cartTotal`, `isCartOpen`.
- **Validation**: Basic negative quantity prevention.

### Logic (`useProducts.ts`)
- **Fetching**: Simulates API call to `ProductService`.
- **Filtering**: Client-side filtering logic for Categories.

## Implemented Features
- [x] **Product Browsing**: Responsive grid with "Quick Add" buttons.
- [x] **Filtering**: Filter by "Category" (Electronics, Clothing, etc.).
- [x] **Persistent Cart**: Items survive page reload.
- [x] **Cart Management**: Add/Remove, Increment/Decrement, Subtotal calc.

## Missing / Future Backend Requirements (Not in POC)
1.  **Concurrency Handling**: The "Race Condition" problem (selling the last item to 2 people) is critical. POC assumes infinite stock.
2.  **Order Management**: No concept of "Orders" or "History" after checkout.
3.  **Promotions**: No coupon code logic (`applyCoupon` endpoint).
4.  **Analytics**: Tracking conversion funnels (Add to Cart -> Checkout).
