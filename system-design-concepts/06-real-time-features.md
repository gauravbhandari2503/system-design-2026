# Real-Time Features - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Communication Protocols](#communication-protocols)
3. [WebSocket Implementation](#websocket-implementation)
4. [Server-Sent Events (SSE)](#server-sent-events-sse)
5. [Long Polling](#long-polling)
6. [Feed Architecture (Twitter-Style)](#feed-architecture-twitter-style)
7. [Real-Time Notifications](#real-time-notifications)
8. [Collaborative Features](#collaborative-features)
9. [Connection Management](#connection-management)
10. [Real-World Examples](#real-world-examples)
11. [Best Practices](#best-practices)

---

## Introduction

Real-time features enable instant updates without page refreshes, creating dynamic, engaging user experiences similar to Twitter feeds, chat applications, and collaborative editing tools. Modern users expect responsiveness—waiting 30 seconds to see a new message is no longer acceptable.

### Use Cases

- **Social Media Feeds**: New posts, likes, comments appearing instantly
- **Chat Applications**: Message delivery and typing indicators
- **Notifications**: Alert systems for user actions
- **Collaborative Editing**: Google Docs-style simultaneous editing
- **Live Updates**: Sports scores, stock prices, live tracking
- **Gaming**: Multiplayer interactions and state sync

---

## Communication Protocols

Choosing the right transport mechanism is the single most important decision in real-time system design. There is no "one size fits all."

### Protocol Comparison

| Feature                 | WebSocket     | SSE                  | Long Polling    | Short Polling  |
| ----------------------- | ------------- | -------------------- | --------------- | -------------- |
| **Direction**           | Bidirectional | Server→Client        | Bidirectional   | Bidirectional  |
| **Connection**          | Persistent    | Persistent           | Semi-persistent | Multiple       |
| **Overhead**            | Low           | Low                  | Medium          | High           |
| **Browser Support**     | Excellent     | Good (no IE)         | Universal       | Universal      |
| **Automatic Reconnect** | No            | Yes                  | N/A             | N/A            |
| **HTTP/2 Compatible**   | Yes           | Yes                  | Yes             | Yes            |
| **Best For**            | Chat, Gaming  | Notifications, Feeds | Fallback        | Legacy systems |

### When to Use What

**WebSockets** are the gold standard for high-frequency, two-way communication. If you need 50 updates per second or need to send data _to_ the server as fast as you receive it (like a multiplayer game), use WebSockets.

**Server-Sent Events (SSE)** are excellent for unidirectional feeds like stock tickers or news updates. They are simpler than WebSockets because they use standard HTTP and have built-in reconnection logic.

**Long Polling** is a robust fallback technique where the client opens a request, and the server holds it open until it has data to send. It works everywhere but has higher overhead.

```javascript
/**
 * WEBSOCKET
 * - Bidirectional communication needed
 * - Low latency required (gaming, trading)
 * - High-frequency updates (chat, collaboration)
 */
const ws = new WebSocket("wss://api.example.com");

/**
 * SERVER-SENT EVENTS (SSE)
 * - Server-to-client updates only
 * - Automatic reconnection desired
 * - Simple to implement
 */
const eventSource = new EventSource("/api/events");

/**
 * LONG POLLING
 * - Fallback for older browsers
 * - Firewall/proxy issues with WebSocket
 * - Moderate update frequency
 */
async function longPoll() {
  const response = await fetch("/api/poll");
  // Process and repeat
}

/**
 * SHORT POLLING
 * - Very simple requirements
 * - Infrequent updates
 * - Last resort
 */
setInterval(() => fetch("/api/data"), 30000);
```

---

## WebSocket Implementation

WebSockets provide a full-duplex communication channel over a single TCP connection.

### 1. Basic WebSocket Client

**Concept:**
A production-ready WebSocket client needs to handle more than just `new WebSocket()`. It must handle:

- **Reconnection:** Automatically retry when the internet cuts out.
- **Heartbeats:** Send "pings" to keep the connection alive through firewalls.
- **State management:** Track if we are CONNECTING, OPEN, or CLOSED.

```javascript
// composables/useWebSocket.js
import { ref, onMounted, onUnmounted } from "vue";

export function useWebSocket(url, options = {}) {
  const ws = ref(null);
  const data = ref(null);
  const status = ref("CONNECTING"); // CONNECTING, OPEN, CLOSING, CLOSED
  const error = ref(null);

  const {
    protocols = [],
    reconnect = true,
    reconnectInterval = 3000,
    heartbeatInterval = 30000,
    onOpen = () => {},
    onMessage = () => {},
    onError = () => {},
    onClose = () => {},
  } = options;

  let reconnectTimer = null;
  let heartbeatTimer = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  function connect() {
    try {
      ws.value = new WebSocket(url, protocols);

      ws.value.onopen = (event) => {
        status.value = "OPEN";
        reconnectAttempts = 0;
        error.value = null;

        // Start heartbeat
        startHeartbeat();

        onOpen(event);
      };

      ws.value.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          data.value = parsedData;
          onMessage(parsedData, event);
        } catch (err) {
          console.error("Failed to parse message:", err);
        }
      };

      ws.value.onerror = (event) => {
        error.value = event;
        onError(event);
      };

      ws.value.onclose = (event) => {
        status.value = "CLOSED";
        stopHeartbeat();

        onClose(event);

        // Attempt reconnection
        if (reconnect && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = reconnectInterval * Math.pow(2, reconnectAttempts - 1);

          console.log(
            `Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`
          );

          reconnectTimer = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      error.value = err;
      console.error("WebSocket connection failed:", err);
    }
  }

  function send(message) {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      const data =
        typeof message === "string" ? message : JSON.stringify(message);

      ws.value.send(data);
      return true;
    }

    console.warn("WebSocket is not connected");
    return false;
  }

  function close(code = 1000, reason = "Client closing connection") {
    reconnect = false; // Prevent auto-reconnect

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    stopHeartbeat();

    if (ws.value) {
      ws.value.close(code, reason);
    }
  }

  function startHeartbeat() {
    if (!heartbeatInterval) return;

    heartbeatTimer = setInterval(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        send({ type: "ping", timestamp: Date.now() });
      }
    }, heartbeatInterval);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    close();
  });

  return {
    ws,
    data,
    status,
    error,
    send,
    close,
    reconnect: connect,
  };
}
```

### 2. WebSocket with Room/Channel Support

**Concept:**
In large apps, you don't send every message to every user. You have "Rooms" or "Channels" (e.g., `chat_room_123`, `user_notifications_456`). The client "subscribes" to specific topics, and the server routes messages accordingly. This is the **Pub/Sub pattern**.

```javascript
// composables/useWebSocketChannel.js
export function useWebSocketChannel(url) {
  const { send, status, data } = useWebSocket(url, {
    onMessage: handleMessage,
  });

  const channels = ref(new Map());
  const currentChannel = ref(null);

  function handleMessage(message) {
    const { channel, type, payload } = message;

    if (!channels.value.has(channel)) return;

    const channelData = channels.value.get(channel);
    const listeners = channelData.listeners.get(type) || [];

    listeners.forEach((callback) => callback(payload));
  }

  function subscribe(channel, eventType, callback) {
    if (!channels.value.has(channel)) {
      channels.value.set(channel, {
        listeners: new Map(),
        subscribed: false,
      });
    }

    const channelData = channels.value.get(channel);

    if (!channelData.listeners.has(eventType)) {
      channelData.listeners.set(eventType, []);
    }

    channelData.listeners.get(eventType).push(callback);

    // Send subscription request
    if (!channelData.subscribed) {
      send({
        type: "subscribe",
        channel,
      });
      channelData.subscribed = true;
    }

    // Return unsubscribe function
    return () => {
      const listeners = channelData.listeners.get(eventType);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  function unsubscribe(channel) {
    if (channels.value.has(channel)) {
      send({
        type: "unsubscribe",
        channel,
      });
      channels.value.delete(channel);
    }
  }

  function publish(channel, eventType, payload) {
    send({
      type: "publish",
      channel,
      eventType,
      payload,
    });
  }

  return {
    status,
    subscribe,
    unsubscribe,
    publish,
  };
}
```

### 3. WebSocket Server Example (Node.js)

**Concept:**
A Node.js server using the `ws` library. It tracks active connections (`sendToClient`) and manages channel subscriptions (`subscribeToChannel`).

```javascript
// server/websocket.js
const WebSocket = require("ws");

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    this.channels = new Map();

    this.wss.on("connection", (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    const clientId = this.generateClientId();

    this.clients.set(clientId, {
      ws,
      channels: new Set(),
      metadata: {},
    });

    console.log(`Client ${clientId} connected`);

    ws.on("message", (message) => {
      this.handleMessage(clientId, message);
    });

    ws.on("close", () => {
      this.handleDisconnect(clientId);
    });

    ws.on("error", (error) => {
      console.error(`Client ${clientId} error:`, error);
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: "welcome",
      clientId,
      timestamp: Date.now(),
    });
  }

  handleMessage(clientId, rawMessage) {
    try {
      const message = JSON.parse(rawMessage);

      switch (message.type) {
        case "subscribe":
          this.subscribeToChannel(clientId, message.channel);
          break;

        case "unsubscribe":
          this.unsubscribeFromChannel(clientId, message.channel);
          break;

        case "publish":
          this.publishToChannel(
            message.channel,
            message.eventType,
            message.payload,
            clientId
          );
          break;

        case "ping":
          this.sendToClient(clientId, {
            type: "pong",
            timestamp: Date.now(),
          });
          break;
      }
    } catch (error) {
      console.error("Invalid message:", error);
    }
  }

  subscribeToChannel(clientId, channel) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.channels.add(channel);

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    this.channels.get(channel).add(clientId);

    this.sendToClient(clientId, {
      type: "subscribed",
      channel,
    });
  }

  unsubscribeFromChannel(clientId, channel) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.channels.delete(channel);

    if (this.channels.has(channel)) {
      this.channels.get(channel).delete(clientId);
    }

    this.sendToClient(clientId, {
      type: "unsubscribed",
      channel,
    });
  }

  publishToChannel(channel, eventType, payload, senderId) {
    if (!this.channels.has(channel)) return;

    const subscribers = this.channels.get(channel);

    subscribers.forEach((clientId) => {
      // Don't send back to sender
      if (clientId === senderId) return;

      this.sendToClient(clientId, {
        channel,
        type: eventType,
        payload,
      });
    });
  }

  broadcastToChannel(channel, message) {
    if (!this.channels.has(channel)) return;

    const subscribers = this.channels.get(channel);

    subscribers.forEach((clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all channels
    client.channels.forEach((channel) => {
      if (this.channels.has(channel)) {
        this.channels.get(channel).delete(clientId);
      }
    });

    this.clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  }

  generateClientId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = WebSocketServer;
```

---

## Server-Sent Events (SSE)

SSE is often underused despite being perfect for "feed-like" features. It establishes a persistent HTTP connection where the server sends data in a specific text format (`text/event-stream`).

### 1. SSE Client Implementation

**Concept:**
The native `EventSource` API is simple but powerful. It handles connection management for you.

```javascript
// composables/useSSE.js
import { ref, onMounted, onUnmounted } from "vue";

export function useSSE(url, options = {}) {
  const data = ref(null);
  const status = ref("CONNECTING");
  const error = ref(null);
  const eventSource = ref(null);

  const {
    events = ["message"],
    withCredentials = false,
    onOpen = () => {},
    onError = () => {},
  } = options;

  function connect() {
    try {
      eventSource.value = new EventSource(url, { withCredentials });

      eventSource.value.onopen = (event) => {
        status.value = "OPEN";
        error.value = null;
        onOpen(event);
      };

      // Subscribe to custom events
      events.forEach((eventName) => {
        eventSource.value.addEventListener(eventName, (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            data.value = {
              event: eventName,
              data: parsedData,
              id: event.lastEventId,
            };
          } catch (err) {
            data.value = {
              event: eventName,
              data: event.data,
              id: event.lastEventId,
            };
          }
        });
      });

      eventSource.value.onerror = (event) => {
        status.value = "ERROR";
        error.value = event;
        onError(event);

        // EventSource automatically reconnects
        // unless explicitly closed
      };
    } catch (err) {
      error.value = err;
      console.error("SSE connection failed:", err);
    }
  }

  function close() {
    if (eventSource.value) {
      eventSource.value.close();
      status.value = "CLOSED";
    }
  }

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    close();
  });

  return {
    data,
    status,
    error,
    close,
  };
}
```

### 2. SSE Server Implementation (Node.js)

**Concept:**
The server sets headers `Content-Type: text/event-stream` and `Connection: keep-alive`. Then it simply writes strings to the response stream in the format `event: eventName\ndata: JSONData\n\n`.

```javascript
// server/sse.js
const express = require("express");
const router = express.Router();

// Store active connections
const clients = new Map();

router.get("/events", (req, res) => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Generate client ID
  const clientId = Date.now().toString();

  // Send initial connection message
  sendEvent(res, "connected", { clientId, timestamp: Date.now() });

  // Store client connection
  clients.set(clientId, res);

  // Send periodic heartbeat
  const heartbeat = setInterval(() => {
    sendEvent(res, "heartbeat", { timestamp: Date.now() });
  }, 30000);

  // Handle client disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });
});

function sendEvent(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event, data) {
  clients.forEach((client) => {
    sendEvent(client, event, data);
  });
}

function sendToClient(clientId, event, data) {
  const client = clients.get(clientId);
  if (client) {
    sendEvent(client, event, data);
  }
}

module.exports = { router, broadcast, sendToClient };
```

---

## Long Polling

When WebSockets aren't available (e.g., restrictive corporate firewalls or legacy servers), long polling is the standard fallback.

### 1. Long Polling Client

**Concept:**
The client makes a request. The server waits (e.g., up to 30 seconds) until it has new data. If data arrives, it responds immediately. If time runs out, it sends an empty response. The client _immediately_ opens a new request upon receiving the response.

```javascript
// composables/useLongPolling.js
import { ref, onMounted, onUnmounted } from "vue";

export function useLongPolling(url, options = {}) {
  const data = ref(null);
  const error = ref(null);
  const isPolling = ref(false);

  const { timeout = 30000, onData = () => {}, onError = () => {} } = options;

  let abortController = null;
  let shouldPoll = true;

  async function poll() {
    if (!shouldPoll) return;

    isPolling.value = true;
    abortController = new AbortController();

    try {
      const response = await fetch(url, {
        signal: abortController.signal,
        headers: {
          "X-Long-Polling": "true",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.data) {
        data.value = result.data;
        onData(result.data);
      }

      error.value = null;

      // Immediately start next poll
      if (shouldPoll) {
        poll();
      }
    } catch (err) {
      if (err.name === "AbortError") {
        return; // Polling stopped intentionally
      }

      error.value = err;
      onError(err);

      // Retry after delay on error
      if (shouldPoll) {
        setTimeout(poll, 5000);
      }
    } finally {
      isPolling.value = false;
    }
  }

  function stop() {
    shouldPoll = false;
    if (abortController) {
      abortController.abort();
    }
  }

  function start() {
    shouldPoll = true;
    poll();
  }

  onMounted(() => {
    start();
  });

  onUnmounted(() => {
    stop();
  });

  return {
    data,
    error,
    isPolling,
    start,
    stop,
  };
}
```

### 2. Long Polling Server

**Concept:**
The server uses `setTimeout` to delay the response until either data is available or the timeout is reached.

```javascript
// server/longPolling.js
const asyncHandler = require("express-async-handler");

// Store pending requests
const pendingRequests = new Map();

const longPollHandler = asyncHandler(async (req, res) => {
  const timeout = 30000;
  const userId = req.user.id;

  // Store request for this user
  if (!pendingRequests.has(userId)) {
    pendingRequests.set(userId, []);
  }
  pendingRequests.get(userId).push(res);

  // Set timeout
  const timeoutId = setTimeout(() => {
    // No updates within timeout, send empty response
    res.json({ data: null, timestamp: Date.now() });

    // Remove from pending
    const requests = pendingRequests.get(userId);
    const index = requests.indexOf(res);
    if (index > -1) {
      requests.splice(index, 1);
    }
  }, timeout);

  // Handle client disconnect
  req.on("close", () => {
    clearTimeout(timeoutId);

    const requests = pendingRequests.get(userId);
    if (requests) {
      const index = requests.indexOf(res);
      if (index > -1) {
        requests.splice(index, 1);
      }
    }
  });
});
```
