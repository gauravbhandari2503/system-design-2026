# Core Challenge: Concurrent Editing

## The Fundamental Problem
Multiple users editing the same document simultaneously. How do you keep everyone in sync without conflicts?

## Three Main Approaches

### 1. Operational Transformation (OT)
**Used by:** Google Docs

**Concept:**
Transform operations based on concurrent changes so they can be applied in any order and produce the same result.

**Example:**
*   Initial: "Hello"
*   User A: Insert "!" at position 5 → "Hello!"
*   User B: Insert " World" at position 5 → "Hello World"

*   **Without transformation:** Conflict
*   **With OT:** Transform B's operation knowing A happened first
*   **Result:** "Hello World!"

**Pros:**
*   Mature, well-understood
*   Google Docs proves it works at scale
*   Good for rich text editing

**Cons:**
*   Complex to implement correctly
*   Transformation functions grow with operation types
*   Hard to reason about edge cases

### 2. Conflict-free Replicated Data Types (CRDTs)
**Used by:** Figma, Apple Notes

**Concept:**
Data structures that automatically resolve conflicts. Each character has a unique identifier, operations are commutative.

**Example:**
```javascript
// Each character has unique position identifier
{
  char: 'H',
  id: 'user1_timestamp_0',
  position: [0]
}

// Insertions don't conflict because IDs are unique
// Order emerges from position identifiers
```

**Pros:**
*   Mathematically proven convergence
*   Works great offline (eventual consistency)
*   Simpler mental model
*   No central authority needed

**Cons:**
*   Memory overhead (metadata per character)
*   Tombstones for deletions (can't truly delete)
*   Complex position identifiers
*   Performance with large documents

### 3. Centralized Locking (Simple but Limited)
**Used by:** older systems

**Concept:**
Lock sections/paragraphs when someone edits them.

**Pros:**
*   Simple to implement
*   No conflict resolution needed

**Cons:**
*   Poor UX (blocks users)
*   Doesn't feel "real-time"
*   Lock management complexity
*   Not suitable for modern collaborative editing

## Most Modern Approach: CRDT or OT with WebSocket synchronization

## Real-time Synchronization

### WebSocket Architecture
**Client-Server Communication:**

```javascript
// Client connects
const ws = new WebSocket('wss://docs.example.com/document/doc_123');

// Client sends operations
ws.send(JSON.stringify({
  type: 'operation',
  op: {
    type: 'insert',
    position: 42,
    text: 'Hello',
    userId: 'user_456',
    timestamp: Date.now()
  }
}));

// Client receives operations from others
ws.onmessage = (event) => {
  const { op } = JSON.parse(event.data);
  applyOperation(op);
};
```

**Server Responsibilities:**
*   Broadcast operations to all connected clients
*   Maintain operation history
*   Handle presence (who's online)
*   Persist to database periodically
*   Handle client disconnections/reconnections

**Connection Management:**
*   Heartbeat/ping-pong to detect dead connections
*   Auto-reconnect with exponential backoff
*   Resume from last known state
*   Queue operations during disconnect

### Operational Sequencing

**Version Vectors:**
Track what each client has seen:

```javascript
{
  documentVersion: 1523,
  clientStates: {
    'user_A': 1522,
    'user_B': 1523,
    'user_C': 1520
  }
}
```

**Operation Acknowledgment:**
```text
Client → Server: Operation #1522
Server → Client: ACK #1522
Server → All others: Broadcast #1522
```

**Handling Out-of-Order Messages:**
*   Buffer operations until prerequisites met
*   Reorder based on timestamps/version vectors
*   Transform/merge as needed

## Document Data Structure

### Text Representation
**Naive Approach (Don't Use):**
```javascript
// String - terrible for collaborative editing
document = "Hello World"
// Every edit changes entire string
```

**Better: Piece Table or Rope:**
```javascript
// Rope: Binary tree of string fragments
class Rope {
  constructor(text) {
    this.left = null;
    this.right = null;
    this.text = text;
    this.length = text.length;
  }
  
  insert(position, text) {
    // Split at position, create new nodes
    // O(log n) instead of O(n)
  }
}
```

**For CRDT:**
```javascript
// Each character is a node with unique ID
[
  { id: 'A1', char: 'H', position: [1] },
  { id: 'A2', char: 'e', position: [2] },
  { id: 'B1', char: 'l', position: [2.5] }, // Inserted between
  { id: 'A3', char: 'l', position: [3] },
  { id: 'A4', char: 'o', position: [4] }
]
```

### Rich Text Formatting
**Inline vs Block-level:**
```javascript
{
  type: 'paragraph',
  children: [
    {
      text: 'Hello ',
      bold: true
    },
    {
      text: 'World',
      italic: true,
      color: '#ff0000'
    }
  ]
}
```

**Formatting Operations:**
```javascript
{
  type: 'format',
  start: 10,
  end: 15,
  attributes: {
    bold: true,
    fontSize: 14
  }
}
```

**Nested Structures:**
Handle lists, tables, nested blocks:
```javascript
{
  type: 'bulletList',
  children: [
    {
      type: 'listItem',
      children: [
        { type: 'paragraph', text: 'Item 1' },
        {
          type: 'bulletList',
          children: [
            { type: 'listItem', text: 'Nested item' }
          ]
        }
      ]
    }
  ]
}
```

## Presence & Awareness

### User Presence
**Show Who's Online:**
```javascript
{
  documentId: 'doc_123',
  activeUsers: [
    {
      userId: 'user_A',
      name: 'Alice',
      color: '#3b82f6',
      cursor: { line: 5, column: 12 },
      selection: { start: 42, end: 58 },
      lastSeen: timestamp
    },
    {
      userId: 'user_B',
      name: 'Bob',
      color: '#10b981',
      cursor: { line: 10, column: 3 },
      selection: null,
      lastSeen: timestamp
    }
  ]
}
```

### Cursor Tracking
*   Broadcast cursor position on movement (throttled to 100-200ms)
*   Show colored cursor with user name
*   Highlight selected text in user's color
*   Handle cursor position updates as operations change document

**Typing Indicators:**
```javascript
{
  userId: 'user_A',
  isTyping: true,
  position: 42
}
```

**Viewport Awareness:**
Show who's viewing which part:
```javascript
{
  userId: 'user_B',
  viewportRange: { start: line_50, end: line_100 }
}
```

### Collaborative Cursors Challenge
**Problem:** When others edit, cursor positions shift

**Solution: Position Anchoring:**
```javascript
// Store cursor relative to document structure, not absolute position
{
  cursor: {
    blockId: 'paragraph_5',
    offset: 12
  }
}

// When operations occur, adjust based on structural changes
```

## Conflict Resolution Strategies

### Text Merging

**Concurrent Inserts at Same Position:**
```text
User A: Inserts "foo" at position 10
User B: Inserts "bar" at position 10

Strategy 1: Use userId for deterministic ordering
Strategy 2: Use timestamp + userId
Strategy 3: CRDT position identifiers

Result: "foobar" or "barfoo" (consistent for all users)
```

**Concurrent Delete + Edit:**
```text
User A: Deletes characters 10-15
User B: Formats characters 12-18 as bold

Resolution: 
- Delete wins (can't format deleted text)
- Or: Keep formatting intention for remaining chars
```

**Overlapping Selections:**
```text
User A: Selects chars 10-20, types "X" (replaces)
User B: Selects chars 15-25, types "Y" (replaces)

OT: Transform B's operation given A's change
CRDT: Both operations apply, deterministic ordering
```

### Undo/Redo in Collaborative Context
**Challenge:** Can't just undo last operation—others may have edited since

**Solution 1: Selective Undo**
Only undo YOUR operations, leave others' intact:
```javascript
undoStack = [
  { userId: 'me', op: 'insert "hello"' },
  { userId: 'other', op: 'insert "world"' },
  { userId: 'me', op: 'format bold' }
];

// Undo only removes my operations
// Transforms are applied to maintain consistency
```

**Solution 2: Collaborative Undo**
Create inverse operation that undoes effect:
```javascript
// Original: Insert "hello" at position 10
// Undo: Delete 5 chars at position 10 (but position may have shifted)
// Must transform undo operation based on intervening edits
```

## Backend Architecture

### Server Design

**Stateful vs Stateless:**

1.  **Stateful (More Common for Docs):**
    *   Each document assigned to specific server
    *   Server holds document state in memory
    *   WebSocket connections pinned to that server
    *   Fast (no database roundtrip per operation)
    *   Requires session affinity/sticky sessions

2.  **Stateless:**
    *   Any server can handle any operation
    *   State stored in fast database (Redis)
    *   More scalable but higher latency
    *   Good for simple use cases

3.  **Hybrid Approach:**
    *   Active documents in memory on specific servers
    *   Inactive documents in database
    *   Move to database after X minutes of inactivity
    *   Load back to memory when users reconnect

### Data Persistence

**Periodic Snapshots:**
Don't persist every operation immediately:
```javascript
// In-memory: Full operation log
operations = [op1, op2, op3, ..., op1000]

// Periodically (every 100 ops or 30 seconds):
// 1. Compute document snapshot
// 2. Save snapshot to database
// 3. Clear old operations (keep recent for undo)

snapshot = {
  documentId: 'doc_123',
  version: 1000,
  content: computedDocumentState,
  timestamp: Date.now()
}

// Keep operations log for recent history
recentOps = [op950, op951, ..., op1000]
```

**Event Sourcing:**
Store all operations, reconstruct document by replaying:
```javascript
// Database
operations_table:
  - document_id
  - sequence_number
  - operation (JSON)
  - user_id
  - timestamp

// To load document:
ops = loadOperations('doc_123')
document = replayOperations(ops)
```

**Pros:**
*   Complete audit trail
*   Can reconstruct any historical state
*   Undo/redo easy

**Cons:**
*   Large storage
*   Slow to load old documents
*   Need periodic compaction

**Hybrid: Snapshots + Recent Operations:**
*   Store snapshot every N operations
*   Store operations since last snapshot
*   To load: Load latest snapshot + apply operations since
*   Best of both worlds

### Database Schema

**Documents Table:**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  owner_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  current_version INTEGER,
  content JSONB,  -- Latest snapshot
  is_active BOOLEAN  -- Currently being edited?
);
```

**Operations Table:**
```sql
CREATE TABLE operations (
  id BIGSERIAL PRIMARY KEY,
  document_id UUID,
  sequence_number INTEGER,
  user_id UUID,
  operation JSONB,
  timestamp TIMESTAMP,
  INDEX (document_id, sequence_number)
);
```

**Permissions Table:**
```sql
CREATE TABLE document_permissions (
  document_id UUID,
  user_id UUID,
  permission ENUM('view', 'comment', 'edit', 'admin'),
  granted_at TIMESTAMP,
  PRIMARY KEY (document_id, user_id)
);
```

**Presence Table (Redis):**
```javascript
// Redis SET with TTL
active_users:doc_123 = {
  'user_A': { cursor: {...}, lastSeen: timestamp },
  'user_B': { cursor: {...}, lastSeen: timestamp }
}
// TTL: 30 seconds (refresh on heartbeat)
```

### Scaling Considerations

**Horizontal Scaling:**
*   Shard by document ID
*   Each document on specific server
*   Use consistent hashing
*   Redis pub/sub for cross-server communication

**Handling Popular Documents:**
*   100+ simultaneous editors
*   Throttle broadcast frequency
*   Batch operations
*   Implement operation buffering
*   Consider read-only viewers vs active editors

**Geographic Distribution:**
*   Edge servers closer to users
*   Operational transform across regions
*   Higher latency challenges
*   Regional data centers

## Frontend Architecture

### Editor Component Design

**Rendering Strategy:**

**1. Virtual Scrolling:**
For large documents, don't render all content:
```javascript
// Only render visible lines + buffer
const visibleLines = calculateVisibleRange(scrollPosition, viewportHeight);
const buffer = 50; // lines

const linesToRender = lines.slice(
  Math.max(0, visibleLines.start - buffer),
  Math.min(lines.length, visibleLines.end + buffer)
);
```

**2. Incremental Rendering:**
Don't re-render entire document on every change:
```javascript
// Only re-render affected blocks
function applyOperation(op) {
  const affectedBlocks = findAffectedBlocks(op);
  affectedBlocks.forEach(block => {
    updateBlockDOM(block);
  });
}
```

**ContentEditable vs Custom Rendering:**

**ContentEditable (Easier but Limited):**
```html
<div contenteditable="true">
  User can type here
</div>
```
*   **Pros:** Browser handles input, caret, selection
*   **Cons:** Inconsistent across browsers, hard to control

**Custom Rendering (Full Control):**
```javascript
// Render as non-editable elements
// Capture keyboard/mouse events manually
// Update data model
// Re-render
```
*   **Pros:** Complete control, consistent behavior
*   **Cons:** Must implement caret, selection, IME support

> Most editors use hybrid: ContentEditable with extensive JavaScript control

### Local Changes & Optimistic Updates
**Immediate Feedback:**

```javascript
function handleTyping(char) {
  // 1. Update local state immediately (optimistic)
  localDocument.insert(cursorPosition, char);
  renderDocument(localDocument);
  
  // 2. Create operation
  const op = createInsertOperation(cursorPosition, char);
  
  // 3. Add to pending operations
  pendingOps.push(op);
  
  // 4. Send to server
  sendOperation(op);
  
  // 5. When ACK received, remove from pending
  // 6. If rejection, rollback and notify user
}
```

**Handling Server Rejection:**
```javascript
function handleRejection(op) {
  // Operation failed (conflict, permission denied, etc.)
  
  // 1. Remove from pending
  pendingOps.remove(op);
  
  // 2. Revert local change
  undoOperation(op);
  
  // 3. Show error to user
  showNotification('Edit conflict. Document refreshed.');
  
  // 4. Request full document state
  requestDocumentSync();
}
```

### State Management
**Document State:**
```javascript
{
  content: documentTree,  // Current document structure
  version: 1523,  // Last confirmed server version
  pendingOps: [],  // Operations not yet acknowledged
  localVersion: 1525,  // Version with local pending ops
  users: [],  // Online users
  cursors: {},  // User cursor positions
  history: {
    undo: [],
    redo: []
  }
}
```

**Operation Queue:**
```javascript
class OperationQueue {
  constructor() {
    this.pending = [];
    this.acknowledged = [];
  }
  
  add(op) {
    this.pending.push(op);
    this.send(op);
  }
  
  confirm(opId) {
    const op = this.pending.find(o => o.id === opId);
    this.pending = this.pending.filter(o => o.id !== opId);
    this.acknowledged.push(op);
  }
  
  async resync() {
    // If too many pending, full resync
    if (this.pending.length > 50) {
      await fullDocumentSync();
      this.pending = [];
    }
  }
}
```

## Performance Optimization

### Client-Side
**Debouncing Operations:**
```javascript
// Don't send every keystroke individually
let buffer = [];
let debounceTimer;

function handleInput(char) {
  buffer.push(char);
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // Send buffered operations as batch
    const batchOp = createBatchOperation(buffer);
    sendOperation(batchOp);
    buffer = [];
  }, 50); // 50ms debounce
}
```

**Throttling Cursor Updates:**
```javascript
// Don't broadcast cursor position on every pixel movement
let lastCursorBroadcast = 0;

function onCursorMove(position) {
  const now = Date.now();
  if (now - lastCursorBroadcast > 100) { // Max 10 updates/second
    broadcastCursor(position);
    lastCursorBroadcast = now;
  }
}
```

**Efficient DOM Updates:**
```javascript
// Use DocumentFragment for batch updates
const fragment = document.createDocumentFragment();
updatedNodes.forEach(node => {
  fragment.appendChild(node);
});
container.appendChild(fragment); // Single reflow
```

**Memoization:**
```javascript
// Cache rendered blocks
const blockCache = new Map();

function renderBlock(block) {
  const cacheKey = computeBlockHash(block);
  
  if (blockCache.has(cacheKey)) {
    return blockCache.get(cacheKey);
  }
  
  const rendered = expensiveRender(block);
  blockCache.set(cacheKey, rendered);
  return rendered;
}
```

### Server-Side
**Operation Batching:**
```javascript
// Buffer operations, broadcast in batches
let operationBuffer = [];
let broadcastTimer;

function receiveOperation(op) {
  operationBuffer.push(op);
  
  if (operationBuffer.length >= 10) {
    broadcastBatch();
  } else if (!broadcastTimer) {
    broadcastTimer = setTimeout(broadcastBatch, 50);
  }
}

function broadcastBatch() {
  if (operationBuffer.length > 0) {
    broadcast({ type: 'batch', ops: operationBuffer });
    operationBuffer = [];
  }
  broadcastTimer = null;
}
```

**Connection Pooling:**
```javascript
// Reuse database connections
const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000
});
```

**Caching:**
```javascript
// Cache document snapshots in Redis
async function loadDocument(docId) {
  // Check cache first
  const cached = await redis.get(`doc:${docId}`);
  if (cached) return JSON.parse(cached);
  
  // Load from database
  const doc = await db.loadDocument(docId);
  
  // Cache for 5 minutes
  await redis.setex(`doc:${docId}`, 300, JSON.stringify(doc));
  
  return doc;
}
```

## Offline Support

### Local Storage
```javascript
// Save document to IndexedDB
function saveLocalCopy(document) {
  const db = await openDB('documents', 1);
  await db.put('docs', {
    id: document.id,
    content: document.content,
    lastSync: Date.now(),
    pendingOps: document.pendingOps
  });
}
```

**Sync on Reconnect:**
```javascript
websocket.onopen = async () => {
  // Load local changes
  const localDoc = await loadLocalCopy(docId);
  
  // Request server version
  const serverVersion = await requestVersion(docId);
  
  if (localDoc.version < serverVersion) {
    // Server has newer changes
    const ops = await fetchOperationsSince(localDoc.version);
    applyOperations(ops);
  }
  
  // Send pending local operations
  localDoc.pendingOps.forEach(op => {
    sendOperation(op);
  });
};
```

**Conflict Resolution:**
```javascript
// If both local and server have changes
async function resolveConflicts(localOps, serverOps) {
  // Transform local operations to account for server changes
  const transformed = transformOperations(localOps, serverOps);
  
  // Apply transformed operations
  applyOperations(transformed);
  
  // Send to server
  transformed.forEach(op => sendOperation(op));
}
```

## Permissions & Access Control

### Permission Levels
```javascript
{
  view: ['user_A', 'user_B'],  // Can only read
  comment: ['user_C'],  // Can add comments
  edit: ['user_D', 'user_E'],  // Can edit content
  admin: ['user_F']  // Can manage permissions
}
```

**Real-time Permission Updates:**
```javascript
// When permissions change, notify affected users
function updatePermissions(docId, userId, newPermission) {
  // Update database
  db.updatePermission(docId, userId, newPermission);
  
  // Notify user via WebSocket
  sendToUser(userId, {
    type: 'permission_changed',
    docId: docId,
    permission: newPermission
  });
  
  // If downgraded to view-only, make their editor read-only
  // If upgraded to edit, enable editing
}
```

**Operation Validation:**
```javascript
function validateOperation(op, userId, docId) {
  const permission = getPermission(userId, docId);
  
  if (op.type === 'edit' && permission < 'edit') {
    throw new Error('Insufficient permissions');
  }
  
  if (op.type === 'share' && permission < 'admin') {
    throw new Error('Only admins can share');
  }
  
  return true;
}
```

## Comments & Suggestions

### Comment System
```javascript
{
  commentId: 'comment_123',
  documentId: 'doc_456',
  range: { start: 42, end: 58 },  // Text selection
  thread: [
    {
      userId: 'user_A',
      text: 'Should we rephrase this?',
      timestamp: Date.now()
    },
    {
      userId: 'user_B',
      text: 'Good idea!',
      timestamp: Date.now()
    }
  ],
  resolved: false
}
```

**Anchoring Comments:**
When text changes, comments must move with content:
```javascript
// Store comment position relative to block + offset
{
  anchor: {
    blockId: 'paragraph_5',
    startOffset: 10,
    endOffset: 25
  }
}

// When operations change document, update anchor positions
```

### Suggestion Mode (Track Changes)
```javascript
{
  type: 'suggestion',
  userId: 'user_A',
  operation: {
    type: 'delete',
    range: { start: 10, end: 20 }
  },
  status: 'pending',  // or 'accepted', 'rejected'
  timestamp: Date.now()
}

// Render with strikethrough (delete) or underline (insert)
// Accept/reject buttons
```

## Version History

### Snapshot Strategy
```javascript
// Create snapshot every N operations or X minutes
const SNAPSHOT_INTERVAL = 100; // operations

if (operationCount % SNAPSHOT_INTERVAL === 0) {
  const snapshot = {
    documentId: docId,
    version: currentVersion,
    content: documentState,
    timestamp: Date.now(),
    author: lastEditUserId
  };
  
  saveSnapshot(snapshot);
}
```

### Timeline View
```javascript
// Show document history
{
  snapshots: [
    { version: 1000, timestamp: '2h ago', author: 'Alice' },
    { version: 900, timestamp: '5h ago', author: 'Bob' },
    { version: 800, timestamp: '1 day ago', author: 'Alice' }
  ]
}

// Load specific version
async function loadVersion(version) {
  const snapshot = await loadSnapshot(version);
  const ops = await loadOperationsSince(version);
  return replayOperations(snapshot, ops);
}
```

### Diff View
```javascript
// Show what changed between versions
function computeDiff(v1, v2) {
  return {
    added: findAdditions(v1, v2),
    removed: findDeletions(v1, v2),
    modified: findModifications(v1, v2)
  };
}
```

## Edge Cases & Error Handling

**Network Interruptions:**
*   Queue operations locally
*   Show "Offline" indicator
*   Auto-reconnect with exponential backoff
*   Sync when connection restored

**Server Crashes:**
*   Load last snapshot + operations from database
*   Notify connected clients to resync
*   Minimal data loss (only in-flight operations)

**Conflicting Simultaneous Edits:**
*   OT/CRDT handles most cases
*   For unresolvable conflicts, show both versions
*   Let user manually merge

**Very Large Documents:**
*   Lazy load sections
*   Pagination
*   Warn users about performance
*   Consider document splitting

**Malicious Users:**
*   Rate limit operations per user
*   Validate all operations server-side
*   Detect spam/abuse patterns
*   Permission checks on every operation

**Browser Tab Conflicts:**
*   Detect multiple tabs with same document
*   Coordinate between tabs (Broadcast Channel API)
*   Or warn user and sync from server

## Advanced Features

### Rich Media Embeds
```javascript
// Embed images, videos, links with previews
{
  type: 'embed',
  embedType: 'image',
  url: 'https://example.com/image.jpg',
  metadata: {
    width: 800,
    height: 600,
    altText: 'Description'
  }
}
```

### Code Blocks with Syntax Highlighting
```javascript
{
  type: 'code',
  language: 'javascript',
  content: 'const x = 10;'
}
// Render with syntax highlighting (Prism.js, Highlight.js)
```

### Tables
```javascript
{
  type: 'table',
  rows: [
    {
      cells: [
        { content: 'Header 1' },
        { content: 'Header 2' }
      ]
    },
    {
      cells: [
        { content: 'Cell 1' },
        { content: 'Cell 2' }
      ]
    }
  ]
}
// Collaborative table editing is especially complex
```

### Drawing/Sketching
```javascript
// Canvas-based drawing
{
  type: 'drawing',
  strokes: [
    {
      userId: 'user_A',
      points: [[x1, y1], [x2, y2], ...],
      color: '#000',
      width: 2
    }
  ]
}
// Each stroke is an operation, CRDT works well here
```

### Mentions & Notifications
```javascript
// @mention users
{
  type: 'mention',
  userId: 'user_B',
  position: 42
}

// Notify mentioned user
sendNotification(userId, {
  type: 'mention',
  documentId: docId,
  mentionedBy: currentUserId,
  context: surroundingText
});
```

## Testing Strategies

### Simulation Testing
```javascript
// Simulate multiple clients editing simultaneously
async function testConcurrentEditing() {
  const clients = [
    createClient('user_A'),
    createClient('user_B'),
    createClient('user_C')
  ];
  
  // All clients perform random operations
  for (let i = 0; i < 100; i++) {
    const randomClient = clients[Math.floor(Math.random() * 3)];
    const randomOp = generateRandomOperation();
    await randomClient.performOperation(randomOp);
  }
  
  // Verify all clients converged to same state
  const states = await Promise.all(clients.map(c => c.getState()));
  assert(allEqual(states));
}
```

### Fuzz Testing
*   Random operations at random positions
*   Verify convergence
*   Check for crashes/hangs

### Network Condition Testing
*   Simulate latency, packet loss
*   Test reconnection logic
*   Verify data integrity

## The Hardest Problems
*   **Convergence:** Ensuring all clients end up with identical documents
*   **Undo/Redo:** In collaborative context with interleaved operations
*   **Performance:** With 100+ simultaneous editors
*   **Cursor Management:** Keeping cursors accurate as document changes
*   **Offline Sync:** Merging offline changes without conflicts
*   **Rich Content:** Tables, nested structures, media embeds
*   **Mobile Support:** Touch editing, keyboard handling, performance

## Key Takeaways

### For Backend:
*   Choose OT or CRDT carefully (both have tradeoffs)
*   WebSocket for real-time communication
*   Snapshot + operations for persistence
*   Handle reconnection gracefully
*   Scale by document sharding

### For Frontend:
*   Optimistic updates for responsiveness
*   Virtual scrolling for large documents
*   Efficient DOM updates (minimize reflows)
*   Clear visual feedback (cursors, presence)
*   Robust offline support

### The Golden Rule:
Every client must converge to the same final state, regardless of operation order, network delays, or disconnections. This is mathematically proven with CRDTs, or carefully implemented with OT.

> The best collaborative editors feel instantaneous and conflict-free. Google Docs, Figma, and Notion each represent different approaches to these challenges, but all share these core principles. Building one from scratch is a multi-year engineering effort—the complexity is genuinely enormous.