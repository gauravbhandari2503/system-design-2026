# Travel Booking Website - Implementation Plan

## Goal
Create a functional Proof of Concept (POC) for a travel booking website that demonstrates **search**, **property details**, and handling of **booking concurrency (race conditions)**. This plan maps the core system design concepts to their POC implementation status.

## Core Concepts & Implementation Status

This table maps the "Basic Idea" requirements to the current "Frontend POC" reality, clearly defining what is required from a production backend.

### 1. Concurrency & Locking
*Concept: Preventing double bookings when multiple users book simultaneously.*

| Strategy | Production Backend Requirement | Frontend POC Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Optimistic Locking** | DB column `version`. `UPDATE ... WHERE version=v`. | N/A (No real DB). | ❌ Backend Only |
| **Pessimistic Locking** | SQL `SELECT ... FOR UPDATE` (Row Lock). | N/A (No real DB). | ❌ Backend Only |
| **Simulation** | N/A | `Math.random() < 0.3` in `property.ts` triggers a fake `CONFLICT` error. | ✅ Implemented |
| **Error Handling** | Return `409 Conflict` HTTP code. | Frontend catches `CONFLICT` string and shows "Someone booked this!" message. | ✅ Implemented |

### 2. Search & Availability
*Concept: efficiently finding rooms that are NOT booked.*

| Feature | Production Backend Requirement | Frontend POC Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Availability Filter** | SQL `NOT EXISTS (SELECT * FROM bookings...)` or Search Index (Elasticsearch). | `PropertyService.searchProperties` filters an in-memory array. | ✅ Simulated |
| **Geo-Search** | PostGIS `ST_DWithin(location, point, radius)`. | String match on `location` field (e.g. "San Francisco"). | ⚠️ Simplified |
| **Date Range** | Query availability table for specific dates. | Visual-only date picker; does not filter results by logic. | ⚠️ Visual Only |

### 3. System Architecture
*Concept: Scalable data structure and caching.*

| Component | Production Backend Requirement | Frontend POC Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Schema** | Tables: `Users`, `Properties`, `Bookings`, `Availability`. | TypeScript Interfaces in `models/Property.ts`. | ✅ Mapped |
| **Caching** | Redis for cached search results; NO cache for availability to prevent stale data. | N/A (Local state only). | ❌ Backend Only |
| **API** | RESTful `POST /bookings` (Transactional). | Mock async function `bookProperty` with 1.5s delay. | ✅ Simulated |

### 4. UI/UX Features
*Concept: Fast, responsive, and trustworthy user interface.*

| Feature | Requirement | Implementation Status |
| :--- | :--- | :--- |
| **Map Integration** | Interactive map re-fetching on drag. | Not Implemented. | ❌ Missing |
| **Skeleton Loaders** | Show placeholders while fetching data. | Basic loading spinner implemented during search/booking. | ⚠️ Basic |
| **Optimistic UI** | Instant feedback ("Booking...") before server response. | Implemented in `useProperties.ts` (sets loading state immediately). | ✅ Implemented |
| **Image Optimization** | `srcset` for responsive images. | Standard `<img>` tags used. | ⚠️ Standard |

## Detailed Breakdown

### Backend Requirements (For Future Production)
To upgrade this POC to a real system, the following backend components are strictly required:
1.  **Transactional Database**: Postgres/MySQL to handle ACID transactions for bookings.
2.  **Search Engine**: Elasticsearch to handle complex queries (Location + Date + Price + Amenities) at scale.
3.  **Availability Service**: A dedicated microservice or querying layer to manage the `Availability` table/index.
4.  **Payment Gateway**: Stripe/PayPal handling *after* the simulated booking holds the room.

### Frontend POC Implementation
1.  **`useProperties.ts`**: The core logic controller.
    - Manages `bookingLoading` state to mimic the network request time (1.5s).
    - Exposes `bookProperty(id)` which serves as the client-side transaction initiator.
2.  **`PropertyCard.vue`**:
    - Handles the user interaction trigger.
    - Displays the error message specifically when `bookingError` contains "Conflict".

## Conclusion
This POC successfully demonstrates the **Frontend's responsibility** in a high-concurrency system: **Graceful Error Handling**. While it cannot enforce database locks, it correctly handles the *result* of a lock failure (the 409 Conflict) by informing the user and prompting a retry, which is the ultimate goal of the "Basic Idea".
