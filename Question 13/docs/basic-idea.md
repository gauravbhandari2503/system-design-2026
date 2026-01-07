# Core Architecture Overview

## The Fundamental Challenge
Deliver high-quality video to millions of users simultaneously, with minimal buffering, adaptive to network conditions, and at massive scale.

## Video Processing Pipeline

### Video Ingestion & Encoding

**Upload Process:**
```javascript
// Content creator uploads video
1. Upload raw video file (could be 100GB+ for 4K content)
2. Store in object storage (S3, GCS)
3. Trigger encoding pipeline
4. Generate multiple versions
5. Extract metadata
6. Generate thumbnails
7. Index for search
```

**Transcoding (Critical Step):**
Convert source video into multiple formats and quality levels:
```javascript
// From single source video, create multiple versions
{
  source: "movie_master_4K_HDR.mov", // 100GB
  
  outputs: [
    // Different resolutions
    { resolution: "3840x2160", bitrate: "25000kbps", codec: "H.265" }, // 4K
    { resolution: "1920x1080", bitrate: "8000kbps", codec: "H.264" },  // 1080p
    { resolution: "1280x720", bitrate: "5000kbps", codec: "H.264" },   // 720p
    { resolution: "854x480", bitrate: "2500kbps", codec: "H.264" },    // 480p
    { resolution: "640x360", bitrate: "1000kbps", codec: "H.264" },    // 360p
    
    // Different codecs for compatibility
    { codec: "VP9" },   // For Chrome/Firefox
    { codec: "AV1" },   // Next-gen codec (better compression)
    
    // Audio tracks
    { audio: "AAC", bitrate: "128kbps" },
    { audio: "Dolby Atmos" },
    
    // Subtitles/captions in multiple languages
    { subtitles: ["en", "es", "fr", "de", "ja"] }
  ]
}
```

**Why Multiple Versions?**
*   Adaptive bitrate streaming (adjust to user's network)
*   Device compatibility (smart TVs, phones, browsers)
*   Bandwidth optimization
*   Accessibility (subtitles, audio descriptions)

**Transcoding Infrastructure:**
*   Massively parallel processing (AWS MediaConvert, Google Transcoder)
*   Distributed workers processing different segments
*   GPU-accelerated encoding for speed
*   Can take hours for a 2-hour 4K movie

**Segmentation (HLS/DASH):**
Break video into small chunks:
```javascript
// Video broken into 2-10 second segments
movie.mp4 → [
  segment_001.ts,  // First 4 seconds
  segment_002.ts,  // Next 4 seconds
  segment_003.ts,
  // ... thousands of segments
]

// Manifest file tells player which segments to fetch
manifest.m3u8 or manifest.mpd
```

**Why Segmentation?**
*   Adaptive streaming (switch quality mid-playback)
*   Faster startup (don't wait for entire file)
*   Better caching
*   Resume playback easily

## Content Delivery Network (CDN)

**The Critical Component:**
CDNs are ESSENTIAL for video streaming. Without them, streaming at scale is impossible.

**How CDNs Work:**
```text
User in Tokyo → Request video
  ↓
Check nearest CDN edge server (Tokyo)
  ↓
If cached: Serve immediately (5-20ms latency)
  ↓
If not cached: Fetch from origin → Cache → Serve to user
  ↓
Next user in Tokyo: Gets from cache (instant)
```

**CDN Architecture:**
```javascript
// Global distribution
CDN Edge Servers: ~200 locations worldwide
  - Tokyo, Seoul, Singapore (Asia)
  - London, Paris, Frankfurt (Europe)
  - NYC, LA, Chicago (Americas)
  - Sydney, Mumbai, São Paulo

// Each edge server:
{
  storage: "10-100TB SSD cache",
  bandwidth: "10-100 Gbps",
  caches: "most popular content automatically",
  eviction: "LRU (Least Recently Used)"
}
```

**Cache Strategy:**
```javascript
// Popular content (trending shows) cached at ALL edge servers
// Long-tail content (old movies) cached on-demand

// Intelligent pre-caching
if (new_season_released('Stranger Things')) {
  prewarm_all_edge_servers();
  // Push to all CDN nodes before announcement
}

// Time-based caching
if (time_of_day === 'peak_evening') {
  increase_cache_size_for_popular_content();
}
```

**CDN Providers:**
*   Netflix uses custom CDN (Open Connect)
*   YouTube uses Google's CDN
*   Prime uses Amazon CloudFront + custom
*   Others: Akamai, Fastly, Cloudflare

**Netflix Open Connect:**
```text
Netflix actually places servers INSIDE ISP networks
  ↓
Comcast data center → Netflix box directly connected
  ↓
User watching Netflix → Data never leaves Comcast network
  ↓
Extremely low latency, no transit costs
```

## Adaptive Bitrate Streaming (ABR)

**The Problem:**
User's network bandwidth varies constantly (WiFi → mobile, congestion, etc.)

**The Solution:**
Continuously monitor network, switch video quality seamlessly.

**How It Works:**
```javascript
// Player measures download speed continuously
class ABRAlgorithm {
  constructor() {
    this.buffer = []; // Downloaded segments not yet played
    this.targetBuffer = 30; // seconds
    this.bandwidth = null;
  }
  
  selectQuality() {
    // Measure recent download speed
    this.bandwidth = this.measureBandwidth();
    
    // Buffer-based decision
    if (this.buffer.length < 10) {
      // Low buffer, risky - choose lower quality for safety
      return 'low';
    } else if (this.buffer.length > 30) {
      // Plenty of buffer - can try higher quality
      return 'high';
    }
    
    // Bandwidth-based decision
    if (this.bandwidth > 10_000_000) { // 10 Mbps
      return '1080p';
    } else if (this.bandwidth > 5_000_000) { // 5 Mbps
      return '720p';
    } else if (this.bandwidth > 2_000_000) { // 2 Mbps
      return '480p';
    } else {
      return '360p';
    }
  }
  
  measureBandwidth() {
    // Download speed of last few segments
    const recentSegments = this.downloadHistory.slice(-5);
    const avgSpeed = recentSegments.reduce((sum, seg) => 
      sum + (seg.size / seg.downloadTime), 0
    ) / recentSegments.length;
    
    return avgSpeed;
  }
}
```

**ABR Algorithms:**

*   **Throughput-Based:**
    *   Measure recent download speed
    *   Select quality based on available bandwidth
    *   Simple but reactive

*   **Buffer-Based (Netflix uses this):**
    *   Monitor playback buffer level
    *   If buffer low → reduce quality
    *   If buffer high → increase quality
    *   More stable, fewer switches

*   **Hybrid:**
    *   Combine throughput + buffer + latency
    *   Machine learning models predict future bandwidth
    *   Look ahead: if video scene changes to high-action, preload higher quality

**Quality Switching:**
```javascript
// Seamless quality transitions
function switchQuality(newQuality) {
  // Don't interrupt current segment
  // Switch at next segment boundary
  
  currentSegmentIndex = 42;
  
  // Continue current quality for segment 42
  downloadSegment('segment_042_720p.ts');
  
  // Switch to new quality starting segment 43
  downloadSegment('segment_043_1080p.ts');
  
  // User sees smooth transition (happens between segments)
}
```

## Video Player Architecture

**Player Components:**

**Frontend Player (Browser/App):**
```javascript
class VideoPlayer {
  constructor() {
    this.videoElement = document.querySelector('video');
    this.buffer = new SourceBuffer();
    this.manifestParser = new ManifestParser();
    this.abrController = new ABRController();
    this.drmManager = new DRMManager();
  }
  
  async init(videoUrl) {
    // 1. Fetch manifest
    const manifest = await this.fetchManifest(videoUrl);
    
    // 2. Parse available qualities
    this.qualities = this.manifestParser.parse(manifest);
    
    // 3. Select initial quality
    const quality = this.abrController.selectInitialQuality();
    
    // 4. Start downloading segments
    this.downloadLoop(quality);
    
    // 5. Monitor playback and adjust
    this.monitorPlayback();
  }
  
  async downloadLoop(quality) {
    while (!this.ended) {
      // Determine next segment to download
      const nextSegment = this.getNextSegment(quality);
      
      // Download segment
      const data = await this.downloadSegment(nextSegment);
      
      // Append to buffer
      this.buffer.appendBuffer(data);
      
      // Check if quality should change
      const newQuality = this.abrController.selectQuality();
      if (newQuality !== quality) {
        quality = newQuality;
      }
      
      // Wait if buffer is full
      if (this.buffer.length > this.maxBufferSize) {
        await this.waitForBufferSpace();
      }
    }
  }
  
  monitorPlayback() {
    setInterval(() => {
      // Track metrics
      this.metrics.bufferLevel = this.buffer.length;
      this.metrics.currentQuality = this.currentQuality;
      this.metrics.bandwidth = this.estimatedBandwidth;
      this.metrics.droppedFrames = this.videoElement.getVideoPlaybackQuality().droppedVideoFrames;
      
      // Send analytics
      this.sendMetrics(this.metrics);
    }, 5000); // Every 5 seconds
  }
}
```

**Popular Player Libraries:**
*   Video.js (open-source, widely used)
*   Shaka Player (Google, used by YouTube)
*   HLS.js (for HLS streaming in browsers)
*   Dash.js (for MPEG-DASH)
*   Native players on iOS/Android

**Player Features:**
```javascript
// Standard controls
{
  play_pause: true,
  seek: true,
  volume: true,
  fullscreen: true,
  quality_selector: true,
  playback_speed: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
  
  // Advanced features
  skip_intro: true, // Netflix-style
  skip_credits: true,
  next_episode: true,
  preview_thumbnails: true, // Hover over timeline
  chapter_markers: true,
  
  // Accessibility
  subtitles: true,
  audio_description: true,
  keyboard_shortcuts: true
}
```

## Live Streaming Architecture

**Different from VOD (Video on Demand):**

**Live Streaming Challenges:**
*   Real-time encoding (can't preprocess)
*   Ultra-low latency (seconds, not minutes)
*   Synchronization across millions of viewers
*   Handle sudden traffic spikes

**Live Streaming Pipeline:**
```text
1. Camera/Source → Capture video
2. Encoder → Real-time encoding (H.264, ~1 second latency)
3. Origin Server → Receives encoded stream
4. CDN → Distributes to edge servers
5. Players → Viewers watch with 10-30 second delay
```

**Latency Types:**
*   **Standard Latency (20-30 seconds):**
    *   HLS/DASH protocols
    *   Good for most use cases (sports, concerts)
    *   Allows buffering, better quality
*   **Low Latency (5-10 seconds):**
    *   LL-HLS, LL-DASH protocols
    *   Better for interactive content
    *   More complex, higher cost
*   **Ultra-Low Latency (<1 second):**
    *   WebRTC, SRT protocols
    *   Video conferencing, live auctions
    *   Higher bandwidth, more expensive

**Live Streaming Architecture:**
```javascript
// Twitch-style live streaming
{
  streamer: {
    software: "OBS Studio",
    protocol: "RTMP", // Push to ingest server
    bitrate: "6000 kbps",
    resolution: "1080p 60fps"
  },
  
  ingest_server: {
    receives: "RTMP stream",
    transcodes: "real-time to multiple qualities",
    segments: "into HLS chunks",
    delay: "1-2 seconds"
  },
  
  cdn: {
    distributes: "HLS segments globally",
    caching: "short TTL (4-10 seconds)",
    delay: "5-10 seconds"
  },
  
  viewer: {
    protocol: "HLS over HTTPS",
    player: "Video.js or native",
    total_latency: "15-30 seconds"
  }
}
```

**Handling Live Traffic Spikes:**
```javascript
// World Cup final, breaking news
- Pre-scale infrastructure
- Increase CDN capacity
- Rate limit non-critical features
- Implement waiting rooms for overflow
- Degrade gracefully (lower max quality)
```

## DRM (Digital Rights Management)

**Content Protection:**
Prevent piracy, unauthorized downloads, screen recording.

**DRM Systems:**
```javascript
// Major DRM providers
{
  widevine: "Google (Android, Chrome)",
  fairplay: "Apple (iOS, Safari, Apple TV)",
  playready: "Microsoft (Edge, Xbox, Windows)"
}

// Multi-DRM setup (support all platforms)
if (platform === 'ios') {
  useDRM('fairplay');
} else if (platform === 'android') {
  useDRM('widevine');
} else if (platform === 'windows') {
  useDRM('playready');
}
```

**DRM Workflow:**
```text
1. Player requests video
2. Detects encrypted content
3. Requests license from DRM server
4. DRM server checks user authorization
5. Issues decryption keys (time-limited, device-bound)
6. Player decrypts and plays (in secure hardware)
7. Keys expire after X hours (user must re-authenticate)
```

**Content Encryption:**
```javascript
// Encrypt video during encoding
encryptedVideo = encrypt(rawVideo, encryptionKey);

// Package with DRM metadata
{
  video: encryptedVideo,
  drm: {
    system: "widevine",
    licenseUrl: "https://drm.example.com/license",
    keyId: "abc123..."
  }
}
```

**Security Levels:**
```javascript
// Hardware-backed DRM (most secure)
L1: "Decryption in secure hardware (TEE, Widevine L1)"
  → Can play 4K, HDR
  → Hardest to break

// Software DRM (less secure)  
L3: "Decryption in software"
  → Limited to 480p/720p
  → Easier to circumvent

// Netflix, Prime limit quality based on DRM level
if (drmLevel === 'L3') {
  maxQuality = '720p';
} else if (drmLevel === 'L1') {
  maxQuality = '4K_HDR';
}
```

**Forensic Watermarking:**
```javascript
// Embed invisible watermark in video
// If pirated, can trace back to original account
{
  userId: "user_12345",
  sessionId: "session_abc",
  timestamp: Date.now(),
  watermark: "imperceptible visual/audio pattern"
}
```

## Recommendation Engine

**Critical for Engagement:**
80% of Netflix viewing comes from recommendations.

**Data Collection:**
```javascript
// Track everything
{
  user_views: [
    { videoId: "vid_123", watchedPercentage: 85, timestamp: ... },
    { videoId: "vid_456", watchedPercentage: 20, timestamp: ... } // Abandoned
  ],
  
  interactions: [
    { videoId: "vid_789", action: "liked" },
    { videoId: "vid_012", action: "added_to_list" },
    { videoId: "vid_345", action: "searched" }
  ],
  
  implicit_signals: [
    { videoId: "vid_123", hovered: true, duration: 3000 }, // Hovered for 3 seconds
    { videoId: "vid_456", thumbnail_clicked: true },
    { hour_of_day: 21, day_of_week: "friday" } // Context
  ]
}
```

**Recommendation Algorithms:**

**Collaborative Filtering:**
```javascript
// "Users who watched X also watched Y"
function collaborativeFiltering(userId) {
  // Find similar users
  const similarUsers = findSimilarUsers(userId);
  
  // Get their watched videos
  const theirVideos = getVideosWatchedBy(similarUsers);
  
  // Remove already watched by current user
  const recommendations = theirVideos.filter(
    video => !hasWatched(userId, video)
  );
  
  return recommendations;
}
```

**Content-Based Filtering:**
```javascript
// "You watched action movies, here are more action movies"
function contentBasedFiltering(userId) {
  // Get user's watch history
  const watchHistory = getUserHistory(userId);
  
  // Extract features (genre, actors, director, tags)
  const userPreferences = extractFeatures(watchHistory);
  
  // Find videos with similar features
  const recommendations = findSimilarContent(userPreferences);
  
  return recommendations;
}
```

**Deep Learning Models:**
```javascript
// Netflix uses neural networks
{
  inputs: [
    user_demographics,
    watch_history,
    time_of_day,
    device_type,
    season,
    trending_content
  ],
  
  model: "Multi-layer neural network",
  
  output: "Ranked list of recommendations with confidence scores"
}
```

**Personalized Thumbnails:**
```javascript
// Netflix shows different thumbnails to different users
// Action fan sees explosion scene
// Romance fan sees kissing scene
// Same movie, different thumbnails

function selectThumbnail(userId, videoId) {
  const userProfile = getUserPreferences(userId);
  const thumbnails = getAvailableThumbnails(videoId);
  
  // ML model predicts which thumbnail user most likely to click
  const bestThumbnail = thumbnails.sort((a, b) => 
    predictClickProbability(userProfile, a) - 
    predictClickProbability(userProfile, b)
  )[0];
  
  return bestThumbnail;
}
```

**A/B Testing:**
```javascript
// Continuously test recommendation algorithms
experiment = {
  control: "Current algorithm",
  variant_A: "New neural network model",
  variant_B: "Hybrid collaborative + content-based",
  
  metrics: [
    "click_through_rate",
    "watch_time",
    "completion_rate",
    "retention"
  ]
}

// Roll out winning variant
```

## Backend Architecture

### Database Design

**Video Metadata:**
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  duration_seconds INTEGER,
  release_year INTEGER,
  rating VARCHAR(10), -- "PG-13", "TV-MA"
  
  -- Video files
  master_file_url TEXT, -- Original upload
  hls_manifest_url TEXT, -- Streaming manifest
  dash_manifest_url TEXT,
  
  -- Metadata
  genres TEXT[], -- ["Action", "Thriller"]
  cast TEXT[], -- ["Actor A", "Actor B"]
  director VARCHAR(255),
  language VARCHAR(10),
  subtitles TEXT[], -- ["en", "es", "fr"]
  
  -- Business
  price DECIMAL(10, 2), -- For rental/purchase
  subscription_tier VARCHAR(50), -- "basic", "premium"
  
  -- Analytics
  view_count BIGINT,
  average_rating DECIMAL(3, 2),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- Search
  search_vector TSVECTOR -- Full-text search index
);

CREATE INDEX idx_videos_genre ON videos USING GIN(genres);
CREATE INDEX idx_videos_search ON videos USING GIN(search_vector);
```

**User Watch History:**
```sql
CREATE TABLE watch_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  video_id UUID,
  
  -- Progress tracking
  position_seconds INTEGER, -- Resume playback
  watched_percentage INTEGER, -- 0-100
  completed BOOLEAN,
  
  -- Context
  device_type VARCHAR(50), -- "mobile", "tv", "desktop"
  quality_level VARCHAR(20), -- "1080p"
  
  -- Timestamps
  started_at TIMESTAMP,
  last_watched_at TIMESTAMP,
  
  INDEX (user_id, video_id),
  INDEX (user_id, last_watched_at)
);
```

**User Ratings:**
```sql
CREATE TABLE ratings (
  user_id UUID,
  video_id UUID,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMP,
  
  PRIMARY KEY (user_id, video_id)
);
```

**Subscriptions:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID,
  plan_id VARCHAR(50), -- "basic", "standard", "premium"
  status VARCHAR(20), -- "active", "canceled", "expired"
  
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  auto_renew BOOLEAN,
  
  payment_method_id VARCHAR(100),
  
  INDEX (user_id, status)
);
```

### Microservices Architecture

**Service Breakdown:**
```javascript
{
  video_service: {
    responsibility: "Video metadata, CRUD operations",
    database: "PostgreSQL (video catalog)"
  },
  
  playback_service: {
    responsibility: "Generate streaming URLs, track playback",
    database: "Redis (sessions), DynamoDB (playback logs)"
  },
  
  recommendation_service: {
    responsibility: "Generate personalized recommendations",
    database: "Graph DB (user similarity), ML models"
  },
  
  search_service: {
    responsibility: "Video search, autocomplete",
    database: "Elasticsearch"
  },
  
  encoding_service: {
    responsibility: "Transcode videos, generate thumbnails",
    infrastructure: "AWS MediaConvert, worker queues"
  },
  
  user_service: {
    responsibility: "Authentication, profiles, subscriptions",
    database: "PostgreSQL"
  },
  
  billing_service: {
    responsibility: "Payments, invoices, subscriptions",
    database: "PostgreSQL",
    integrations: "Stripe, PayPal"
  },
  
  analytics_service: {
    responsibility: "Track views, engagement, metrics",
    database: "ClickHouse, BigQuery (data warehouse)"
  },
  
  notification_service: {
    responsibility: "Push notifications, emails",
    infrastructure: "SNS, SendGrid"
  }
}
```

**Inter-service Communication:**
```javascript
// Synchronous (REST/gRPC)
playbackService.getStreamingUrl(videoId, userId);

// Asynchronous (Message Queue)
publishEvent({
  type: 'video_watched',
  userId: 'user_123',
  videoId: 'vid_456',
  watchedPercentage: 95
});

// Subscribers:
// - recommendation_service → Update user preferences
// - analytics_service → Log event
// - billing_service → Check watch limits
```

### Caching Strategy

**Multi-layer Caching:**

*   **CDN Edge Cache (Closest to User):**
    *   Video segments cached here
    *   TTL: 24-48 hours for popular content
    *   Hit rate: 90-95% for popular videos

*   **Application Cache (Redis):**
    ```javascript
    // Frequently accessed data
    cache.set('video:metadata:vid_123', videoData, TTL='1 hour');
    cache.set('user:watchlist:user_456', watchlist, TTL='5 minutes');
    cache.set('recommendations:user_456', recs, TTL='30 minutes');
    ```

*   **Database Query Cache:**
    ```sql
    -- Repeated queries cached
    SELECT * FROM videos WHERE genre = 'Action' ORDER BY rating DESC LIMIT 20;
    -- Cache result for 10 minutes
    ```

**Cache Invalidation:**
```javascript
// When video metadata updated
function updateVideo(videoId, newData) {
  // 1. Update database
  db.update('videos', videoId, newData);
  
  // 2. Invalidate caches
  cache.delete(`video:metadata:${videoId}`);
  cache.delete(`search:results:*`); // Wildcard delete
  
  // 3. Purge CDN cache (if thumbnail changed)
  cdn.purge(`/thumbnails/${videoId}/*`);
}
```

## Analytics & Monitoring

**Playback Metrics (Real-time):**
```javascript
// Sent from player every 10-30 seconds
{
  sessionId: "session_abc",
  userId: "user_123",
  videoId: "vid_456",
  timestamp: Date.now(),
  
  // Playback quality
  currentBitrate: 5000000, // 5 Mbps
  bufferLevel: 15, // seconds
  qualitySwitches: 3,
  rebuffers: 1, // buffering events
  droppedFrames: 12,
  
  // Network
  bandwidth: 8000000, // 8 Mbps
  latency: 45, // ms
  
  // User actions
  paused: false,
  seeking: false,
  volume: 0.8,
  fullscreen: true
}
```

**Business Metrics:**
```javascript
// Dashboard metrics
{
  concurrent_viewers: 5_000_000, // Right now
  total_watch_time_today: "50M hours",
  
  quality_of_experience: {
    avg_startup_time: "1.2 seconds",
    rebuffer_ratio: "0.3%", // Industry standard: <1%
    video_start_failures: "0.05%",
    avg_bitrate: "1080p"
  },
  
  engagement: {
    completion_rate: "78%", // Finish video
    next_episode_rate: "85%", // Auto-play next
    avg_session_duration: "45 minutes"
  },
  
  revenue: {
    mrr: "$500M", // Monthly recurring revenue
    churn_rate: "2.5%",
    arpu: "$12.50" // Avg revenue per user
  }
}
```

**Quality Monitoring:**
```javascript
// Alert on degraded experience
if (rebuffer_ratio > 1.0%) {
  alert("High rebuffering rate - investigate CDN/encoding");
}

if (startup_time > 3.0) {
  alert("Slow video startup - check CDN performance");
}

if (video_start_failures > 0.5%) {
  alert("High failure rate - critical issue");
}
```

## Scalability Patterns

**Handling Peak Load:**
*   **Auto-scaling:** Horizontal scaling of servers
*   **Pre-warming caches:** Push popular content to all edge servers before release
*   **Rate limiting:** Limit non-essential features (recommendations, comments)
*   **Graceful degradation:** Disable 4K during peak if needed
*   **Queue management:** Limit concurrent streams per user

**Database Sharding:**
```text
// Shard by user ID
shard_1: users_000000 - users_499999
shard_2: users_500000 - users_999999
...

// Shard by video ID  
shard_1: videos_A* (all videos starting with A)
shard_2: videos_B*
...

// Shard by geography
shard_us: US users
shard_eu: European users
shard_asia: Asian users
```

**Read Replicas:**
```javascript
// Master database: Handle writes
// Read replicas: Handle read traffic (10-100x more reads than writes)

if (operation === 'write') {
  database = master;
} else {
  database = readReplica[random()]; // Load balance reads
}
```

**Asynchronous Processing:**
*   Video encoding → Background job queue
*   Recommendation generation → Batch job (nightly)
*   Analytics aggregation → Stream processing (Kafka, Flink)
*   Thumbnail generation → Worker queue

## Mobile App Considerations

**Offline Downloads:**
```javascript
// Allow users to download for offline viewing
{
  download_quality: ['480p', '720p', '1080p'],
  storage_limit: '100GB',
  encryption: 'DRM-protected',
  expiration: '30 days or subscription end',
  
  // Smart downloads
  auto_download_next_episode: true,
  wifi_only: true,
  delete_after_watching: true
}
```

**Bandwidth Management:**
```javascript
// Cellular data awareness
if (connection === 'cellular' && dataUsage > userLimit) {
  showWarning('You are using cellular data. Continue?');
  limitQualityTo('480p');
}

// Data saver mode
if (dataSaverEnabled) {
  maxQuality = '480p';
  disableAutoplay = true;
  lowerBufferSize = true;
}
```

**Picture-in-Picture:**
```javascript
// Continue watching while using other apps
player.enablePictureInPicture();

// iOS: Native PiP support
// Android: Custom floating window
```

## Advanced Features

**Interactive Content:**
```javascript
// Black Mirror: Bandersnatch style
{
  type: 'branching_narrative',
  decisions: [
    {
      timestamp: 300, // 5 minutes in
      prompt: "Choose your path",
      options: [
        { text: "Go left", nextSegment: "segment_A" },
        { text: "Go right", nextSegment: "segment_B" }
      ],
      timeout: 10 // seconds to decide
    }
  ]
}
```

**Watch Parties (Synchronized Viewing):**
```javascript
// Watch with friends remotely, stay in sync
{
  partyId: "party_123",
  members: ['user_A', 'user_B', 'user_C'],
  currentPosition: 1234, // seconds
  
  // Synchronization
  host: 'user_A', // Controls playback
  
  // When host plays/pauses/seeks, broadcast to all
  broadcastAction({
    action: 'play',
    timestamp: 1234
  });
  
  // All players sync to this position
}
```

**Skip Intro/Credits:**
```javascript
// ML model detects intro/credits
{
  videoId: "vid_123",
  intro: { start: 0, end: 90 }, // First 90 seconds
  credits: { start: 5340, end: 5400 }, // Last minute
  recap: { start: 90, end: 150 } // "Previously on..."
}

// Show skip button
if (currentTime >= intro.start && currentTime < intro.end) {
  showButton('Skip Intro', seekTo(intro.end));
}
```

**Preview Thumbnails:**
```javascript
// Hover over timeline, see preview image
{
  videoId: "vid_123",
  thumbnails: [
    { timestamp: 0, url: "thumb_000.jpg" },
    { timestamp: 10, url: "thumb_010.jpg" },
    { timestamp: 20, url: "thumb_020.jpg" },
    // ... every 10 seconds
  ]
}

// On hover at position X
const thumbnail = getThumbnailNear(hoverPosition);
showPreview(thumbnail);
```

**Multilingual Support:**
```javascript
// Audio tracks in multiple languages
{
  videoId: "vid_123",
  audioTracks: [
    { language: "en", label: "English", default: true },
    { language: "es", label: "Español (España)" },
    { language: "ja", label: "日本語" }
  ],
  subtitles: [
    { language: "en", label: "English", type: "closed_caption" },
    { language: "es", label: "Español" },
    { language: "fr", label: "Français" },
    // ... 20+ languages
  ]
}
```

## Cost Optimization

**The Biggest Costs:**

**1. Bandwidth (Biggest):**
```javascript
// Serving video to millions = massive bandwidth
Cost per GB: $0.05 - $0.15
  
Netflix monthly bandwidth: ~250 Petabytes
Cost: $12-37 million per month just for bandwidth

// Optimization strategies:
- Use CDN (cheaper than origin bandwidth)
- Efficient codecs (AV1 saves 30% bandwidth vs H.264)
- Adaptive bitrate (don't stream 4K to 720p screen)
- P2P delivery (users help distribute, reduces CDN cost)
```

**2. Storage:**
```javascript
// Storing multiple versions of every video
Single 2-hour movie:
  - 4K: 20GB
  - 1080p: 8GB
  - 720p: 4GB
  - 480p: 2GB
  - 360p: 1GB
  Total: ~35GB per movie

Netflix catalog: 5000+ movies, 2000+ shows
Approximate storage: 500+ Petabytes

// Optimization:
- Delete unpopular content after X years
- Store only popular qualities for old content
- Use cheaper storage tiers (S3 Glacier for old content)
```

**3. Encoding:**
```javascript
// Transcoding is compute-intensive
Single 2-hour 4K movie: 
  - Encoding time: 10-20 hours on high-end server
  - Cost: $50-200 per movie

// Optimization:
- GPU-accelerated encoding (faster, cheaper)
- Encode only popular content in highest quality
- Just-in-time encoding (encode on demand)
```

**4. CDN:**
```javascript
// CDN costs scale with traffic
Netflix pays Akamai, builds own Open Connect
YouTube uses Google's global infrastructure (cost advantage)
Prime uses CloudFront (Amazon's CDN)

Cost optimization:
- Multi-CDN strategy (use cheapest for each region)
- Peer-assisted delivery (WebRTC P2P)
- Intelligent routing (send to nearest/cheapest edge)
```

## Security & Anti-Piracy

**Content Protection:**
```javascript
// Multi-layered security
1. DRM encryption (Widevine, FairPlay, PlayReady)
2. Forensic watermarking (trace leaks)
3. Geo-blocking (regional licensing)
4. Device limits (max 4 simultaneous streams)
5. Screenshot/screen recording prevention
6. HDCP (High-bandwidth Digital Content Protection)
```

**Account Sharing Prevention:**
```javascript
// Netflix crackdown on password sharing
{
  household_detection: {
    primary_location: "IP address + WiFi SSID",
    allowed_devices: 4,
    
    // If login from new location
    if (location !== primary_location && !traveling) {
      require_verification();
      or_charge_extra_member_fee();
    }
  },
  
  device_fingerprinting: {
    track: "device_id, IP, user_agent, timezone",
    detect: "account_sharing_patterns"
  }
}
```

**Bot Detection:**
```javascript
// Prevent automated scraping/downloading
- Rate limiting (max X videos per day)
- Captcha challenges
- Behavioral analysis (human vs bot patterns)
- IP reputation scoring
- Device fingerprinting
```

## The Hardest Problems

1.  **Buffering/Rebuffering**: The #1 UX killer. Keeping playback smooth despite variable networks.

2.  **Cold Start**: Getting video playing in <2 seconds on first load.

3.  **Live Streaming Latency**: Delivering live content with minimal delay at scale.

4.  **Cost at Scale**: Bandwidth costs are enormous (Netflix spends ~$1B/year on delivery).

5.  **Content Discovery**: Helping users find what to watch from thousands of options.

6.  **Global Delivery**: Low latency for users worldwide, dealing with ISPs, regulations.

7.  **Quality vs Bandwidth**: Balancing visual quality with data usage.

8.  **DRM Complexity**: Supporting all platforms while preventing piracy.

## Key Takeaways

**Architecture Principles:**
*   CDN is essential (can't stream at scale without it)
*   Adaptive bitrate is mandatory (network varies constantly)
*   Segment video for flexibility (HLS/DASH)
*   Cache aggressively (reduce origin load)
*   Monitor relentlessly (catch issues before users notice)

**User Experience:**
*   Minimize startup time (<2 seconds)
*   Prevent buffering at all costs (<1% rebuffer ratio)
*   Smooth quality transitions
*   Resume playback across devices
*   Offline downloads for mobile

**Business:**
*   Bandwidth is the biggest cost
*   Recommendations drive 80% of viewing
*   DRM protects content but adds complexity
*   Scale horizontally (more servers, not bigger servers)

> The best streaming platforms feel **instant, smooth, and intelligent**. Netflix's "just works" experience, YouTube's massive scale, Prime's integration with shopping—each represents years of optimization on these core challenges. Building a video streaming platform from scratch is genuinely one of the most complex system design problems in software engineering.