# Concurrency Handling: Booking Race Conditions

## The Problem
In high-demand booking systems (like travel, concerts), multiple users may attempt to book the same limited inventory (e.g., a specific room for specific dates) simultaneously.

**Scenario:**
1. User A (slow internet) clicks "Book" on Room 101.
2. User B (fast internet) clicks "Book" on Room 101 one second later.
3. Without protection, both might proceed to payment, leading to a **Double Booking**.

## The Solution: Two-Phase Booking with Distributed Locks

We implement a **Pessimistic Locking** strategy to prevent this.

### Phase 1: Reservation (Temporary Lock)
*   User initiates booking request.
*   System checks availability.
*   If available, system acquires a **Distributed Lock** (e.g., via Redis) on the resource `room_101_2024-10-23`.
*   Lock has a **Time-To-Live (TTL)** (e.g., 15 minutes).
*   During this time, the room status is `TEMPORARILY_HELD`.
*   Any other user trying to book receives a `409 Conflict` or "Room Unavailable" error immediately.

### Phase 2: Confirmation or Release
*   **Success**: User completes payment within the TTL. Lock is converted to a permanent `CONFIRMED` booking.
*   **Expiration**: User fails to pay in time. Lock expires (TTL), room becomes `AVAILABLE` again.

## Implementation in this Project
Since this is a frontend demo, we simulate this backend behavior in our Mock API (`src/api/property.ts`).

1.  **Mock State**: Properties track a `lockedUntil` timestamp.
2.  **Conflict Simulation**: We randomly simulate that a property is "locked" by another user to demonstrate the UI handling of the `409` error state.
3.  **UI Feedback**: Users see a clear message if the room was snatched while they were viewing it.
