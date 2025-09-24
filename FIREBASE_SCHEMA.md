# 🔥 Firebase Schema Design - Multi-User News Feed App

## Overview
Complete Firebase Firestore schema with authentication for a personalized, multi-user news aggregation platform supporting real-time updates, user preferences, bookmarks, and interaction tracking.

---

## 🔐 Firebase Authentication Setup

### Supported Providers
```javascript
// Firebase Auth Configuration
const authProviders = {
  email: true,           // Email/Password
  google: true,          // Google OAuth
  github: true,          // GitHub OAuth (optional)
  anonymous: false       // Anonymous auth disabled
}
```

### User Claims & Security
```javascript
// Custom claims for admin users
const customClaims = {
  admin: false,          // Admin privileges
  premium: false,        // Premium subscription
  apiAccess: true        // API access enabled
}
```

---

## 📊 Firestore Collections Schema

### 1. 👤 **users** Collection
**Path**: `/users/{userId}`

```typescript
interface User {
  uid: string                    // Firebase Auth UID (document ID)
  email: string                  // User's email address
  displayName?: string           // Display name
  photoURL?: string              // Profile picture URL
  username?: string              // Unique username
  
  // Preferences
  preferences: {
    theme: 'hud' | 'minimal' | 'classic'
    autoScroll: boolean
    scrollSpeed: number          // 30-120 seconds
    language: string             // 'en', 'es', etc.
    timezone: string             // User's timezone
    notifications: {
      email: boolean
      push: boolean
      digest: 'daily' | 'weekly' | 'never'
    }
  }
  
  // Content preferences
  interests: string[]            // ['ai', 'programming', 'startups']
  sources: {
    reddit: boolean
    hackernews: boolean
    twitter: boolean
    newsletters: boolean
  }
  
  // API Keys (encrypted)
  apiKeys?: {
    openai?: string              // Encrypted OpenAI key
    gemini?: string              // Encrypted Gemini key
    anthropic?: string           // Encrypted Anthropic key
  }
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt: Timestamp
  isActive: boolean
  subscriptionTier: 'free' | 'premium'
}
```

**Example Document**:
```json
{
  "uid": "user123",
  "email": "john@example.com",
  "displayName": "John Doe",
  "username": "johndoe",
  "preferences": {
    "theme": "hud",
    "autoScroll": true,
    "scrollSpeed": 60,
    "language": "en",
    "timezone": "America/New_York",
    "notifications": {
      "email": true,
      "push": false,
      "digest": "daily"
    }
  },
  "interests": ["ai", "programming", "startups"],
  "sources": {
    "reddit": true,
    "hackernews": true,
    "twitter": false,
    "newsletters": true
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:22:00Z",
  "lastLoginAt": "2024-01-20T14:22:00Z",
  "isActive": true,
  "subscriptionTier": "free"
}
```

---

### 2. 📰 **articles** Collection
**Path**: `/articles/{articleId}`

```typescript
interface Article {
  id: string                     // Auto-generated document ID
  title: string
  url: string
  summary?: string
  content?: string               // Full content if available
  
  // Source information
  source: {
    name: string                 // 'Reddit', 'HackerNews', 'Twitter'
    platform: 'reddit' | 'hackernews' | 'twitter' | 'newsletter'
    originalId?: string          // Original post/tweet ID
    author?: string              // Original author
    subreddit?: string           // For Reddit posts
    tweetId?: string             // For Twitter posts
  }
  
  // Timestamps
  publishedAt: Timestamp         // Original publication date
  crawledAt: Timestamp           // When we fetched it
  
  // Engagement metrics
  metrics: {
    score: number                // Reddit upvotes, HN points, etc.
    comments: number
    shares?: number
    likes?: number
    retweets?: number
    upvoteRatio?: number         // Reddit specific
  }
  
  // Content analysis
  tags: string[]                 // ['ai', 'programming', 'startup']
  categories: string[]           // ['Technology', 'Business']
  sentiment?: 'positive' | 'neutral' | 'negative'
  readingTime?: number           // Estimated minutes
  
  // Popularity & ranking
  popularityScore: number        // 0.0 - 1.0
  trendingScore: number          // 0.0 - 1.0
  qualityScore: number           // 0.0 - 1.0
  finalScore: number             // Combined score for ranking
  
  // Metadata
  language: string               // 'en', 'es', etc.
  imageUrl?: string              // Featured image
  domain?: string                // Source domain
  isActive: boolean              // For soft deletion
}
```

**Example Document**:
```json
{
  "id": "article_001",
  "title": "OpenAI Releases GPT-5 with Revolutionary Capabilities",
  "url": "https://example.com/gpt5-release",
  "summary": "OpenAI announces GPT-5 with unprecedented reasoning abilities...",
  "source": {
    "name": "TechCrunch",
    "platform": "twitter",
    "originalId": "1234567890",
    "author": "techcrunch"
  },
  "publishedAt": "2024-01-20T09:00:00Z",
  "crawledAt": "2024-01-20T09:15:00Z",
  "metrics": {
    "score": 1250,
    "comments": 89,
    "likes": 2400,
    "retweets": 850
  },
  "tags": ["ai", "gpt", "openai", "machine-learning"],
  "categories": ["Technology", "AI"],
  "sentiment": "positive",
  "readingTime": 3,
  "popularityScore": 0.89,
  "trendingScore": 0.95,
  "qualityScore": 0.87,
  "finalScore": 0.91,
  "language": "en",
  "imageUrl": "https://example.com/gpt5-image.jpg",
  "domain": "techcrunch.com",
  "isActive": true
}
```

---

### 3. 🔖 **bookmarks** Collection
**Path**: `/bookmarks/{bookmarkId}`

```typescript
interface Bookmark {
  id: string                     // Auto-generated document ID
  userId: string                 // Reference to user
  articleId: string              // Reference to article
  
  // Bookmark details
  title: string                  // Article title (cached)
  url: string                    // Article URL (cached)
  summary?: string               // User's custom summary
  tags: string[]                 // User-defined tags
  notes?: string                 // User's notes
  
  // Organization
  folder?: string                // 'AI News', 'To Read Later'
  isFavorite: boolean
  isArchived: boolean
  
  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  
  // Article snapshot (for deleted articles)
  articleSnapshot: {
    title: string
    source: string
    publishedAt: Timestamp
    originalUrl: string
  }
}
```

**Example Document**:
```json
{
  "id": "bookmark_001",
  "userId": "user123",
  "articleId": "article_001",
  "title": "OpenAI Releases GPT-5 with Revolutionary Capabilities",
  "url": "https://example.com/gpt5-release",
  "summary": "Important AI breakthrough to review later",
  "tags": ["ai", "important", "work"],
  "notes": "Share with team on Monday",
  "folder": "AI Research",
  "isFavorite": true,
  "isArchived": false,
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T10:30:00Z",
  "articleSnapshot": {
    "title": "OpenAI Releases GPT-5 with Revolutionary Capabilities",
    "source": "TechCrunch",
    "publishedAt": "2024-01-20T09:00:00Z",
    "originalUrl": "https://example.com/gpt5-release"
  }
}
```

---

### 4. 📊 **userInteractions** Collection
**Path**: `/userInteractions/{interactionId}`

```typescript
interface UserInteraction {
  id: string                     // Auto-generated document ID
  userId: string                 // Reference to user
  articleId: string              // Reference to article
  
  // Interaction details
  type: 'view' | 'click' | 'like' | 'share' | 'bookmark' | 'hide' | 'report'
  duration?: number              // Time spent viewing (seconds)
  timestamp: Timestamp
  
  // Context
  source: 'feed' | 'search' | 'bookmark' | 'recommendation'
  position?: number              // Position in feed when interacted
  deviceType: 'desktop' | 'mobile' | 'tablet'
  
  // Engagement depth
  scrollDepth?: number           // 0.0 - 1.0 (how much of article was read)
  clickedElements?: string[]     // ['title', 'image', 'summary']
  
  // Metadata
  sessionId?: string             // For grouping interactions
  ipAddress?: string             // For analytics (hashed)
  userAgent?: string             // Browser info
}
```

**Example Document**:
```json
{
  "id": "interaction_001",
  "userId": "user123",
  "articleId": "article_001",
  "type": "view",
  "duration": 45,
  "timestamp": "2024-01-20T10:35:00Z",
  "source": "feed",
  "position": 3,
  "deviceType": "desktop",
  "scrollDepth": 0.8,
  "clickedElements": ["title", "summary"],
  "sessionId": "session_456"
}
```

---

### 5. 🎯 **userFeed** Collection (Personalized Feed Cache)
**Path**: `/userFeed/{userId}/articles/{articleId}`

```typescript
interface UserFeedItem {
  articleId: string              // Reference to article
  userId: string                 // User this feed item belongs to
  
  // Personalization scores
  personalizedScore: number      // 0.0 - 1.0 based on user interests
  relevanceScore: number         // How relevant to user's interests
  recencyScore: number           // Time-based scoring
  
  // Feed position
  rank: number                   // Position in personalized feed
  feedCategory: 'trending' | 'recommended' | 'following' | 'interests'
  
  // Status
  isRead: boolean
  isHidden: boolean
  showAgain: boolean
  
  // Metadata
  addedAt: Timestamp             // When added to user's feed
  lastUpdated: Timestamp
  expiresAt?: Timestamp          // Auto-cleanup old items
}
```

---

### 6. 🏷️ **userTopics** Collection
**Path**: `/userTopics/{userId}/topics/{topicId}`

```typescript
interface UserTopic {
  name: string                   // 'Artificial Intelligence'
  keywords: string[]             // ['AI', 'machine learning', 'neural networks']
  weight: number                 // 0.0 - 1.0 importance to user
  isActive: boolean
  
  // Learning from interactions
  engagementScore: number        // How much user engages with this topic
  lastInteraction: Timestamp
  
  // Auto-detection
  isAutoDetected: boolean        // Learned from user behavior
  confidence: number             // 0.0 - 1.0 for auto-detected topics
  
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### 7. 📁 **feedSources** Collection
**Path**: `/feedSources/{sourceId}`

```typescript
interface FeedSource {
  id: string
  name: string                   // 'r/technology', '@elonmusk'
  platform: 'reddit' | 'twitter' | 'hackernews' | 'newsletter'
  url?: string
  
  // Configuration
  isActive: boolean
  refreshInterval: number        // Minutes between updates
  priority: number               // 1-10 for source importance
  
  // Metadata
  description?: string
  category: string               // 'Technology', 'Business'
  subscribers?: number           // Follower count
  
  // Performance
  lastUpdate: Timestamp
  articlesCount: number
  avgQualityScore: number
  
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 🔐 Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Articles are readable by all authenticated users
    match /articles/{articleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.admin == true || 
         resource == null); // Allow creation
    }
    
    // Bookmarks are private to each user
    match /bookmarks/{bookmarkId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User interactions are private
    match /userInteractions/{interactionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User feed is private
    match /userFeed/{userId}/articles/{articleId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // User topics are private
    match /userTopics/{userId}/topics/{topicId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Feed sources are readable by all
    match /feedSources/{sourceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

---

## 📈 Firestore Indexes

```javascript
// Required Composite Indexes
const indexes = [
  // Articles by popularity and recency
  {
    collection: 'articles',
    fields: [
      { field: 'isActive', order: 'ASCENDING' },
      { field: 'finalScore', order: 'DESCENDING' },
      { field: 'publishedAt', order: 'DESCENDING' }
    ]
  },
  
  // User bookmarks by date
  {
    collection: 'bookmarks',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'isArchived', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  
  // User interactions for analytics
  {
    collection: 'userInteractions',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'type', order: 'ASCENDING' },
      { field: 'timestamp', order: 'DESCENDING' }
    ]
  },
  
  // User feed by rank
  {
    collection: 'userFeed',
    fields: [
      { field: 'userId', order: 'ASCENDING' },
      { field: 'isHidden', order: 'ASCENDING' },
      { field: 'rank', order: 'ASCENDING' }
    ]
  },
  
  // Articles by tags and score
  {
    collection: 'articles',
    fields: [
      { field: 'tags', order: 'ASCENDING' },
      { field: 'finalScore', order: 'DESCENDING' },
      { field: 'publishedAt', order: 'DESCENDING' }
    ]
  }
]
```

---

## 🎛️ Real-time Queries & Optimization

### Personalized Feed Query
```typescript
// Get personalized feed for user
const getPersonalizedFeed = (userId: string, limit = 50) => {
  return query(
    collection(db, 'userFeed', userId, 'articles'),
    where('isHidden', '==', false),
    orderBy('rank', 'asc'),
    limitToLast(limit)
  )
}

// Real-time listener
const unsubscribe = onSnapshot(
  getPersonalizedFeed(userId),
  (snapshot) => {
    const feedItems = snapshot.docs.map(doc => doc.data())
    updateFeedUI(feedItems)
  }
)
```

### Trending Articles Query
```typescript
const getTrendingArticles = (limit = 20) => {
  return query(
    collection(db, 'articles'),
    where('isActive', '==', true),
    where('publishedAt', '>', twentyFourHoursAgo),
    orderBy('trendingScore', 'desc'),
    orderBy('publishedAt', 'desc'),
    limit(limit)
  )
}
```

### User Bookmarks Query
```typescript
const getUserBookmarks = (userId: string) => {
  return query(
    collection(db, 'bookmarks'),
    where('userId', '==', userId),
    where('isArchived', '==', false),
    orderBy('createdAt', 'desc')
  )
}
```

---

## 🔄 Data Flow & Architecture

### 1. **User Authentication Flow**
```
User Login → Firebase Auth → Generate Custom Claims → Update User Document
```

### 2. **Content Aggregation Flow**
```
External APIs → Content Processing → Articles Collection → Personalization Engine → User Feed Collections
```

### 3. **Real-time Updates Flow**
```
New Article → Firestore Trigger → Cloud Function → Personalization → User Feed Update → Client Notification
```

### 4. **User Interaction Flow**
```
User Action → UserInteraction Document → Analytics Processing → User Topic Learning → Feed Personalization Update
```

---

## 🚀 Implementation Benefits

### **Scalability**
- **Horizontal scaling**: Each user has their own feed subcollection
- **Efficient queries**: Composite indexes optimize common query patterns
- **Real-time updates**: Firestore listeners provide instant UI updates

### **Performance**
- **Cached feeds**: Pre-computed personalized feeds for fast loading
- **Optimized indexes**: All queries use single-field or composite indexes
- **Minimal reads**: User-specific collections reduce unnecessary data transfer

### **Personalization**
- **Topic learning**: Automatic interest detection from user interactions
- **Multi-factor scoring**: Combines popularity, relevance, and recency
- **Feed customization**: Per-user ranking and filtering

### **Security**
- **User isolation**: All personal data is scoped to user UID
- **Granular permissions**: Security rules enforce data access policies
- **Encrypted keys**: API keys stored with client-side encryption

This schema provides a robust foundation for a personalized, multi-user news aggregation platform with real-time capabilities and advanced personalization features.
