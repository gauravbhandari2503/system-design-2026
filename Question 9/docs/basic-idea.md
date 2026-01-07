# E-commerce Website - Basic Idea

## Inventory Management & Concurrency
**The Core Challenge: Race Conditions**
Multiple users trying to buy the last item simultaneously. This is THE fundamental problem in e-commerce.

### Pessimistic Locking (Reserve on Add-to-Cart)
When user adds item to cart, temporarily reserve inventory:
```javascript
// Reserve inventory for 10-15 minutes
{
  productId: "prod_123",
  quantity: 2,
  reservedBy: "user_456",
  reservedAt: timestamp,
  expiresAt: timestamp + 15min
}
```
**Pros:**
*   Prevents overselling
*   User feels item is "theirs"
*   Simpler checkout flow

**Cons:**
*   Inventory locked even if user abandons cart
*   Reduces available inventory display
*   Complex timeout/cleanup logic
*   Cart abandonment locks valuable inventory

### Optimistic Locking (Reserve at Checkout)
Don't reserve until payment:
1.  Show "X items available" in real-time.
2.  At checkout, validate inventory still available.
3.  If not available, show error and remove from cart.

**Pros:**
*   Maximum inventory availability
*   No timeout management
*   Better inventory utilization

**Cons:**
*   Users frustrated when item unavailable at checkout
*   Race condition handling at critical moment
*   Need robust error messages and alternatives

### Hybrid Approach (Most Common)
*   Light reservation on add-to-cart (5-10 min).
*   Short timer visible to user ("Reserved for 9:45").
*   Firm lock during checkout/payment (1-2 min).
*   Release immediately if payment fails.
*   Queue system for high-demand items.

### Distributed Locking
For multi-server deployments:
*   Use Redis with TTL for distributed locks.
*   Database row-level locking with `SELECT FOR UPDATE`.
*   Message queue for serializing inventory updates.
*   Optimistic locking with version numbers.

```sql
-- Optimistic locking example
UPDATE inventory 
SET quantity = quantity - 1, version = version + 1
WHERE product_id = 'prod_123' 
  AND version = :expected_version 
  AND quantity >= 1;
-- If 0 rows affected, someone else got there first
```

## Product Catalog Architecture

### Product Data Structure
Complex hierarchy with variants:
```javascript
{
  productId: "shoe_001",
  name: "Running Shoes",
  brand: "Nike",
  category: ["Sports", "Footwear", "Running"],
  basePrice: 89.99,
  
  // Variants (SKUs)
  variants: [
    {
      sku: "shoe_001_red_10",
      attributes: { color: "Red", size: "10" },
      price: 89.99,
      inventory: 15,
      images: ["red_front.jpg", "red_side.jpg"]
    },
    {
      sku: "shoe_001_blue_9",
      attributes: { color: "Blue", size: "9" },
      price: 94.99,
      inventory: 3,
      images: ["blue_front.jpg"]
    }
  ],
  
  // SEO & Discovery
  description: "...",
  tags: ["running", "athletic", "comfortable"],
  searchKeywords: ["running shoes", "sport shoes"],
  
  // Rich content
  images: ["main.jpg", "detail1.jpg", ...],
  videos: ["demo.mp4"],
  specifications: {...},
  reviews: [...],
  
  // Business logic
  shipping: { weight: 1.2, dimensions: {...} },
  returnable: true,
  taxable: true
}
```

### Inventory Tracking Levels
*   **SKU-level** (most granular): Track each variant separately.
*   **Product-level**: Aggregate across variants.
*   **Warehouse-level**: Track location of inventory.
*   **Reserved vs Available**: `Available = Total - Reserved - Sold`.

### Multi-warehouse Inventory
Products stored in multiple locations:
*   Show inventory closest to user.
*   Route order to nearest warehouse.
*   Transfer between warehouses.
*   Handle split shipments.

### Real-time Inventory Updates
*   WebSocket connections for live stock counts.
*   Cache with short TTL (30-60 seconds).
*   Event-driven updates (Kafka, RabbitMQ).
*   Optimistic UI (show update immediately, reconcile later).

## Shopping Cart Design

### Cart Persistence
Where to store cart data:
*   **Guest Carts (Anonymous Users)**:
    *   Store in browser `localStorage`/`sessionStorage`.
    *   Or server-side with session ID.
    *   Merge with user cart on login.
*   **Authenticated Carts**:
    *   Store in database.
    *   Sync across devices.
    *   Persist long-term (30-90 days).

### Cart Schema
```javascript
{
  cartId: "cart_789",
  userId: "user_456",
  items: [
    {
      sku: "shoe_001_red_10",
      quantity: 2,
      priceAtAdd: 89.99,  // Lock price when added
      addedAt: timestamp,
      reservationExpiry: timestamp
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
  expiresAt: timestamp
}
```

### Cart Validation on Checkout
Critical checks before payment:
*   Inventory still available?
*   Prices changed? (inform user).
*   Product discontinued?
*   Shipping restrictions?
*   Minimum order requirements?
*   Coupon still valid?

### Cart Abandonment Recovery
*   Save cart state.
*   Email reminders (1 hour, 24 hours, 3 days).
*   Show saved cart on return.
*   Offer discounts to recover sale.

### Price Locking
Should cart prices update dynamically?
*   **Option A: Dynamic Pricing** (Always current price).
*   **Option B: Price Locking** (Honor for X hours).
*   **Option C: Hybrid** (Notify if changes).

## Checkout Flow Optimization

### Single-Page vs Multi-Step Checkout
*   **Single-Page**: Faster for pros, can be overwhelming.
*   **Multi-Step**: Progressive disclosure, better mobile UX. (Shipping -> Method -> Payment -> Review).

### Guest Checkout
Critical for conversion:
*   Don't force account creation.
*   Collect minimal info.
*   Offer to create account **after** purchase.

### Address Validation
*   Real-time validation (Google Places API).
*   Detect incomplete addresses.
*   Suggest corrections.

### Shipping Calculation
Complex real-time calculation:
*   Weight/Dimensions.
*   Origin/Destination.
*   Carrier rates (USPS, FedEx APIs).
*   Free shipping thresholds.

## Payment Processing

### Payment Gateway Integration
Stripe, PayPal, Square:
*   **Never store raw credit card numbers** (PCI compliance).
*   Use tokenization.
*   Handle 3D Secure / SCA.
*   Support multiple methods.

### Payment Flow
1.  Collect payment info (client-side, encrypted).
2.  Send to payment gateway → receive token.
3.  Create order in database (`status: pending`).
4.  Charge payment gateway with token.
5.  If success: update order (`status: paid`).
6.  If failure: show error, allow retry.

### Idempotency
Prevent duplicate charges:
*   Use idempotency keys with payment gateway.
*   Database unique constraints on order IDs.

### Payment States
`pending` → `processing` → `succeeded` / `failed` / `requires_action` / `canceled`.

### Failed Payment Handling
*   Clear error messages.
*   Suggest alternatives.
*   **Don't** lose cart data.

## Pricing & Promotions

### Pricing Rules Engine
*   Base price / Sale price.
*   Bulk discounts (Buy X get Y).
*   Customer-tier pricing (VIP).

### Coupon System
```javascript
{
  code: "SAVE20",
  type: "percentage", // or "fixed_amount"
  value: 20,
  minOrderValue: 50,
  usageLimit: 1000,
  applicableProducts: ["cat_123"],
  validUntil: timestamp
}
```

## Search & Discovery

### Product Search
*   Full-text search (Elasticsearch).
*   Fuzzy matching (typos).
*   Synonyms.
*   Ranking algorithms (relevance, margin).

### Faceted Navigation
*   Filters (Brand, Price, Color).
*   Multi-select (AND/OR).
*   Fast application (AJAX).

## Order Management System (OMS)

### Order Lifecycle
`Created` → `Paid` → `Processing` → `Shipped` → `Delivered` → `Completed` (or `Returned`/`Canceled`).

### Order Schema
```javascript
{
  orderId: "ORD_12345",
  userId: "user_456",
  items: [...],
  pricing: { subtotal, shipping, tax, discount, total },
  shipping: { address, trackingNumber },
  payment: { transactionId, status },
  status: "shipped",
  timeline: [{ status: "created", time: ... }]
}
```

## Scalability Challenges

### Read-Heavy Workload
Thousands browse for every purchase:
*   Aggressive caching (Redis, CDN).
*   Read replicas for DB.
*   Image CDN (Cloudinary).

### Flash Sales / Black Friday
*   Auto-scaling infrastructure.
*   Queue systems for checkout.
*   Circuit breakers.
*   Rate limiting.

### Microservices Architecture
Separate services for:
*   Catalog, Inventory, Cart, Orders, Payment, User.

### Event-Driven Architecture
Async communication:
*   Order placed → Inventory service updates stock.
*   Order placed → Email service sends confirmation.

## Security Considerations
*   **PCI DSS**: Compliance for payments.
*   **Fraud Detection**: Velocity checks, AVS, IP mismatch.
*   **Account Security**: 2FA, OAuth2.
*   **Data Privacy**: GDPR/CCPA.

---

**The Hardest Problems in E-commerce**:
1.  **Inventory Accuracy**: The last item problem.
2.  **Cart Abandonment**: Recovering sales.
3.  **Fraud vs Friction**: Balancing security and UX.
4.  **Performance at Scale**: Handling traffic spikes.