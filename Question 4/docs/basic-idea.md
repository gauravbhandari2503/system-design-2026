# Travel Booking Website - Basic Idea

## Core Challenges
The unique challenge of a travel booking site (like Airbnb or Booking.com) is **Inventory Management under Concurrency**. Unlike e-commerce where you have thousands of identical items (SKUs), travel bookings often involve unique items (a specific date range for a specific room).

## Concurrency & Double Bookings
### The Problem
User A and User B view the same room. Both click "Book" at the exact same second. If not handled, both might get a confirmation, but only one can actually stay.

### Solutions
1.  **Optimistic Locking (Versioning)**:
    - Add a `version` column to the `availability` table.
    - When updating: `UPDATE availability SET status='booked', version=version+1 WHERE id=123 AND version=5`
    - If User A succeeds, the version becomes 6. User B's update fails (db returns 0 rows affected) because it tries to match version 5.
    - **Pros**: Better performance, no database locks. **Cons**: User B fails late in the flow.

2.  **Pessimistic Locking (Row Lock)**:
    - `SELECT * FROM availability WHERE id=123 FOR UPDATE`
    - Locks the row so no one else can read/write it until the transaction commits.
    - **Pros**: Guarantees simple integrity. **Cons**: Can reduce throughput if transactions are long.

3.  **Temporary Hold**:
    - When User A clicks "Book", create a temporary "hold" record that expires in 10 minutes.
    - This reserves the room while they enter payment details.

## Search & Availability
### Efficient Querying
Searching for "Hotels in Paris available Dec 25-30" is complex because "Availability" is the *absence* of a booking.
- **Approach A (Naive)**: Find all rooms in Paris, then `JOIN` bookings to exclude those with overlapping dates. Slow at scale.
- **Approach B (Availability Table)**: Maintain a table of *available* nights. Query: `SELECT room_id FROM availability WHERE date BETWEEN '2023-12-25' AND '2023-12-30' GROUP BY room_id HAVING COUNT(*) = 5`.
- **Approach C (Search Index)**: Use Elasticsearch/Solr. Denormalize availability into the index (e.g., a list of booked date ranges). Update index asynchronously.

## System Architecture

### Database Schema (SQL)
**Users**
- `id`, `email`, `password_hash`, `role` (host/guest)

**Properties**
- `id`, `host_id`, `title`, `description`, `location` (lat/long), `price_per_night`

**Bookings**
- `id`, `property_id`, `guest_id`, `start_date`, `end_date`, `status` (pending, confirmed, cancelled), `total_price`

**Availability** (Optimization)
- `property_id`, `date`, `status` (available, booked, blocked)

### Caching Strategy
- **Search Results**: Cache search queries (e.g. "Paris, 2 guests") for a few minutes. Low consistency requirement.
- **Property Details**: Cache static details (images, description) aggressively.
- **Availability**: **Do NOT cache** availability heavily (or stick to very short TTLs). Stale availability frustrates users.

## Frontend & UI/UX

### Critical Features
1.  **Map Integration**: Search by moving the map (Mapbox/Google Maps). Re-fetch properties on `bounds_changed` (debounced).
2.  **Date Picker**: Needs to clearly show blocked dates vs available dates.
3.  **Large Image Loading**: Lazy load property images. Use responsive images (`srcset`) to serve smaller sizes to mobile.
4.  **Skeleton Loaders**: Essential for perceived performance during heavy search queries.

### Performance Optimization
- **Virtualization**: Use windowing (virtual scrolling) for long lists of property results to keep the DOM light.
- **Optimistic UI**: When bookmarking/saving a property, update the UI instantly.

## API Design (REST or GraphQL)

- `GET /properties?location={lat,long}&dates={start,end}&guests=2`
- `GET /properties/{id}` -> Returns details + unavailable dates.
- `POST /bookings` -> **Transactional endpoint**. Steps:
    1.  Start DB Transaction
    2.  Check Availability (Lock rows)
    3.  Create Booking
    4.  Update Availability
    5.  Commit
    6.  (Async) Process Payment