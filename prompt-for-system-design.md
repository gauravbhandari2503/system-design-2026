# Universal System Design Analysis Prompt

Use this prompt to get detailed system design analysis for any application or system:

---

## THE PROMPT:

```
Provide a comprehensive system design analysis for: [SYSTEM NAME]

Analyze both backend and frontend architecture with the following structure:

## 1. CORE ARCHITECTURE OVERVIEW
- Fundamental challenge/problem this system solves
- High-level architecture diagram explanation
- Key system characteristics (read-heavy, write-heavy, real-time, etc.)
- Main user flows and interactions

## 2. DATA MODELING & STORAGE
- Database schema design (tables, collections, relationships)
- Data structures and their rationale
- Primary key strategies
- Indexing strategies
- Sharding/partitioning approaches
- Data consistency requirements (strong vs eventual)
- Sample database queries for common operations

## 3. BACKEND ARCHITECTURE
- Microservices breakdown (or monolith justification)
- API design (REST, GraphQL, gRPC)
- Service responsibilities and boundaries
- Inter-service communication patterns
- Message queues and event-driven architecture
- Background job processing
- Caching strategies (multi-layer caching)
- Session management
- Authentication & authorization patterns

## 4. FRONTEND ARCHITECTURE
- Component structure and hierarchy
- State management approach
- UI/UX interaction patterns
- Client-side rendering strategy
- Real-time update mechanisms
- Optimistic UI updates
- Error handling and retry logic
- Offline capabilities (if applicable)

## 5. PERFORMANCE OPTIMIZATION
### Backend:
- Database query optimization
- Connection pooling
- Caching layers (application, database, CDN)
- Asynchronous processing
- Load balancing strategies
- Rate limiting and throttling

### Frontend:
- Lazy loading strategies
- Code splitting
- Asset optimization
- Virtual scrolling (if applicable)
- Debouncing/throttling user inputs
- Progressive rendering
- Service workers and PWA features

## 6. SCALABILITY CONSIDERATIONS
- Horizontal vs vertical scaling strategies
- Database scaling (read replicas, sharding)
- Stateless vs stateful services
- CDN usage and edge computing
- Auto-scaling triggers and metrics
- Handling traffic spikes
- Geographic distribution

## 7. REAL-TIME FEATURES (if applicable)
- WebSocket architecture
- Server-Sent Events (SSE)
- Polling strategies
- Presence and awareness
- Conflict resolution (OT, CRDT, locking)
- Synchronization mechanisms

## 8. CRITICAL USER FLOWS
Detail the complete flow for 3-5 most important user actions:
- Step-by-step technical implementation
- API calls involved
- State changes
- Error scenarios
- Performance considerations

## 9. CONCURRENCY & RACE CONDITIONS
- Potential race conditions
- Locking mechanisms (optimistic, pessimistic)
- Transaction handling
- Idempotency strategies
- Distributed transaction patterns (Saga, 2PC)

## 10. SECURITY CONSIDERATIONS
- Authentication mechanisms
- Authorization patterns
- Data encryption (at rest, in transit)
- Input validation and sanitization
- Rate limiting and DDoS protection
- Sensitive data handling
- Compliance requirements (GDPR, HIPAA, etc.)

## 11. THIRD-PARTY INTEGRATIONS
- Payment gateways
- Cloud services (AWS, GCP, Azure)
- Analytics and monitoring
- Email/SMS services
- Social login providers
- APIs consumed

## 12. MONITORING & OBSERVABILITY
- Key metrics to track
- Logging strategy
- Distributed tracing
- Error tracking and alerting
- Performance monitoring
- User analytics
- A/B testing infrastructure

## 13. EDGE CASES & ERROR HANDLING
- Network failures
- Service timeouts
- Data inconsistencies
- User input edge cases
- System overload scenarios
- Graceful degradation strategies

## 14. MOBILE CONSIDERATIONS
- Mobile-specific optimizations
- Offline-first architecture
- Push notifications
- Deep linking
- App-specific features
- Battery and data usage optimization

## 15. COST OPTIMIZATION
- Major cost drivers
- Optimization strategies
- Resource allocation
- Serverless vs traditional hosting trade-offs

## 16. TECHNICAL CHALLENGES & SOLUTIONS
- The 5 hardest problems in this system
- How industry leaders solve them
- Trade-offs in different approaches

## 17. DEVELOPMENT & DEPLOYMENT
- CI/CD pipeline
- Testing strategies (unit, integration, E2E)
- Blue-green or canary deployments
- Feature flags
- Database migrations
- Rollback procedures

## 18. COMPARISON WITH REAL-WORLD EXAMPLES
- How [Industry Leader 1] implements this
- How [Industry Leader 2] implements this
- Key differences in approaches
- Lessons learned from their architectures

## 19. ANTI-PATTERNS TO AVOID
- Common mistakes in this system type
- What NOT to do
- Why certain approaches fail at scale

## 20. IMPLEMENTATION ROADMAP
- MVP features and architecture
- Phase 2 enhancements
- Scale considerations for each phase
- When to refactor/rebuild

---

Provide detailed explanations with:
- Code snippets for critical components
- Concrete examples
- Specific technology recommendations
- Trade-off analysis for different approaches
- Performance metrics and benchmarks
- Real-world analogies to existing systems

Use clear headings, bullet points where appropriate, and code blocks for technical details.
```

---

## HOW TO USE:

Simply replace `[SYSTEM NAME]` with any system you want to analyze:

### Examples:

**Example 1:**
```
Provide a comprehensive system design analysis for: Ride-sharing application like Uber
```

**Example 2:**
```
Provide a comprehensive system design analysis for: Food delivery platform like DoorDash
```

**Example 3:**
```
Provide a comprehensive system design analysis for: URL shortener like bit.ly
```

**Example 4:**
```
Provide a comprehensive system design analysis for: Social media messaging system like WhatsApp
```

**Example 5:**
```
Provide a comprehensive system design analysis for: Stock trading platform like Robinhood
```

**Example 6:**
```
Provide a comprehensive system design analysis for: Online code editor like CodePen
```

**Example 7:**
```
Provide a comprehensive system design analysis for: Hotel booking system like Booking.com
```

**Example 8:**
```
Provide a comprehensive system design analysis for: Fitness tracking app like Strava
```

---

## CUSTOMIZATION OPTIONS:

You can add modifiers to focus on specific aspects:

### Focus on Scale:
```
Provide a comprehensive system design analysis for: [SYSTEM NAME]
Focus especially on handling 100 million+ users and massive scale challenges.
```

### Focus on Real-time:
```
Provide a comprehensive system design analysis for: [SYSTEM NAME]
Focus especially on real-time features, WebSocket architecture, and low-latency requirements.
```

### Focus on Mobile:
```
Provide a comprehensive system design analysis for: [SYSTEM NAME]
Focus especially on mobile-first architecture, offline capabilities, and native app considerations.
```

### Focus on Cost:
```
Provide a comprehensive system design analysis for: [SYSTEM NAME]
Focus especially on cost optimization, resource efficiency, and budget-conscious architecture.
```

### Focus on Specific Technology:
```
Provide a comprehensive system design analysis for: [SYSTEM NAME]
Use React for frontend, Node.js for backend, PostgreSQL for database, and AWS for infrastructure.
```

### Startup MVP Focus:
```
Provide a comprehensive system design analysis for: [SYSTEM NAME]
Focus on MVP architecture for a startup with limited resources, with clear evolution path to scale.
```

---

## ADVANCED USAGE:

### Compare Multiple Approaches:
```
Provide a comprehensive system design analysis for: [SYSTEM NAME]
Compare and contrast two architectural approaches:
1. Microservices with event-driven architecture
2. Monolithic with modular design
Explain trade-offs and when to choose each.
```

### Include Migration Strategy:
```
Provide a comprehensive system design analysis for: [SYSTEM NAME]
Include migration strategy from a legacy monolithic PHP application to modern architecture.
```

### Industry-Specific Requirements:
```
Provide a comprehensive system design analysis for: Healthcare appointment scheduling system
Include HIPAA compliance, data privacy, and healthcare-specific regulations.
```

---

## TIPS FOR BEST RESULTS:

1. **Be Specific**: Instead of "social media app", say "Twitter-like microblogging platform"

2. **Add Context**: Mention scale expectations
   - "for 1000 users" vs "for 100 million users"

3. **Specify Constraints**: 
   - "with real-time collaboration"
   - "with offline-first approach"
   - "with strong consistency requirements"

4. **Target Audience**: 
   - "Explain for senior engineers preparing for interviews"
   - "Explain for junior developers learning system design"

5. **Request Diagrams**: 
   - "Include ASCII diagrams for architecture"
   - "Describe component relationships visually"

---

## SAMPLE COMPLETE PROMPT:

```
Provide a comprehensive system design analysis for: Real-time multiplayer game like Among Us

Context: 
- 10 players per game session
- Real-time position updates (60 times per second)
- Game state synchronization
- Chat functionality
- Mobile-first (iOS and Android)
- Need to support 100,000 concurrent games

Focus especially on:
- Low-latency real-time synchronization
- Handling unreliable mobile networks
- Cheat prevention and validation
- Matchmaking algorithm
- Server-authoritative vs client-side prediction trade-offs

Compare approaches used by similar games and recommend best architecture for this use case.
```

---

## WHY THIS PROMPT WORKS:

✅ **Comprehensive**: Covers all aspects of system design
✅ **Structured**: Clear sections make information digestible
✅ **Practical**: Includes real-world examples and code
✅ **Comparative**: Shows different approaches and trade-offs
✅ **Actionable**: Provides implementation guidance
✅ **Scalable**: Works for systems of any size
✅ **Educational**: Explains WHY, not just WHAT

---

## WHAT YOU'LL GET:

- Complete backend architecture
- Frontend implementation details
- Database schemas and queries
- API design and endpoints
- Performance optimization techniques
- Security best practices
- Scalability strategies
- Real-world comparisons
- Edge case handling
- Cost analysis
- Implementation roadmap

Perfect for:
- Interview preparation
- Learning system design
- Planning new projects
- Reviewing existing architectures
- Technical documentation
- Team discussions
- Architecture decision records (ADRs)