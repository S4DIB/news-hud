# 🐦 Twitter/X API Setup Guide for HUD News App

## Overview

This guide shows you how to get Twitter API access to pull tweets from specific tech accounts and integrate them into your HUD News feed.

## 🔑 Getting Twitter API Access

### Step 1: Apply for Twitter Developer Account

1. **Go to**: [https://developer.twitter.com](https://developer.twitter.com)
2. **Click**: "Apply for a developer account"
3. **Choose**: "Hobbyist" → "Making a bot"
4. **Fill out the application**:
   - Use case: "News aggregation for personal learning"
   - How will you use the API: "Pulling tweets from tech accounts for a personal news dashboard"
   - Will you tweet, retweet, or like content: "No, read-only access"

### Step 2: Create a Twitter App

1. **Go to**: [https://developer.twitter.com/en/portal/dashboard](https://developer.twitter.com/en/portal/dashboard)
2. **Click**: "Create App"
3. **App name**: `HUD-News-Aggregator`
4. **App description**: `Personal news aggregation dashboard`

### Step 3: Get API Keys

1. **In your app dashboard**, go to "Keys and tokens"
2. **Copy these values**:
   - API Key
   - API Secret Key  
   - Bearer Token (most important for read-only access)

## 🔧 Environment Variables Setup

Add these to your `.env.local` file:

```env
# Twitter/X API Configuration
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here

# Expose to client-side (for rate limit info)
NEXT_PUBLIC_TWITTER_RATE_LIMIT=true
```

## 📱 Target Tech Accounts

### High-Signal Tech Twitter Accounts

```typescript
const techAccounts = [
  // AI/ML Leaders
  'elonmusk',           // Tesla/SpaceX/xAI updates
  'sama',               // OpenAI CEO Sam Altman
  'satyanadella',       // Microsoft CEO
  'sundarpichai',       // Google CEO
  'ylecun',             // Meta Chief AI Scientist
  
  // Tech Companies
  'OpenAI',             // OpenAI official
  'googledeepmind',     // DeepMind
  'anthropicai',        // Anthropic
  'huggingface',        // Hugging Face
  
  // Developers/Founders
  'paulg',              // Y Combinator
  'naval',              // AngelList founder
  'garrytan',           // Y Combinator
  'balajis',            // Former Coinbase CTO
  'jason',              // This Week in Startups
  
  // Tech News/Analysis
  'techcrunch',         // TechCrunch
  'verge',              // The Verge
  'arstechnica',        // Ars Technica
  'wired',              // WIRED
  'hackernews',         // Hacker News
]
```

## 🔄 API Endpoints We'll Use

### User Timeline API
- **Endpoint**: `GET /2/users/by/username/{username}/tweets`
- **Purpose**: Get recent tweets from specific accounts
- **Rate Limit**: 75 requests per 15 minutes

### Tweet Fields
```typescript
const tweetFields = [
  'id',
  'text', 
  'created_at',
  'author_id',
  'public_metrics',  // likes, retweets, replies
  'context_annotations', // topics/entities
  'entities',        // hashtags, mentions, URLs
  'attachments'      // media
]
```

## 🎯 Content Filtering Strategy

### Quality Filters
```typescript
const qualityFilters = {
  minLikes: 10,           // Minimum engagement
  minRetweets: 5,         // Some amplification
  maxAge: 24,             // Hours (only recent)
  excludeReplies: true,   // Original content only
  excludeRetweets: false, // Include good RTs
  minLength: 50,          // Substantial content
  requireUrls: false      // Links preferred but not required
}
```

### Content Categories
- **🚀 Product Launches**: New AI models, tools, features
- **📈 Funding News**: Startup raises, acquisitions
- **🔬 Research**: Papers, breakthroughs, studies  
- **💼 Industry Updates**: Hiring, partnerships, strategy
- **🛠️ Development**: Code releases, open source
- **📊 Market Analysis**: Trends, predictions, data

## 🔐 Authentication Methods

### Bearer Token (Recommended)
```typescript
const headers = {
  'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  'User-Agent': 'HUD-News-App/1.0'
}
```

### OAuth 2.0 (Advanced)
- Required for user-specific actions
- Not needed for public tweet reading
- More complex setup

## 📊 Rate Limits & Best Practices

### Rate Limits
- **User Timeline**: 75 requests / 15 minutes
- **User Lookup**: 300 requests / 15 minutes  
- **Tweet Lookup**: 300 requests / 15 minutes

### Optimization Strategies
```typescript
// Batch requests for multiple users
const batchSize = 5  // Users per request cycle

// Cache responses
const cacheTimeout = 15 * 60 * 1000  // 15 minutes

// Smart polling
const updateFrequency = {
  highActivity: 5,   // 5 minutes for active accounts
  normal: 15,        // 15 minutes for regular accounts  
  lowActivity: 60    // 1 hour for less active accounts
}
```

## 🚫 Common Issues & Solutions

### Issue 1: Rate Limit Exceeded
```typescript
// Solution: Implement exponential backoff
const retryDelay = attempt => Math.min(1000 * Math.pow(2, attempt), 30000)
```

### Issue 2: Deleted/Protected Tweets
```typescript
// Solution: Handle API errors gracefully
try {
  const tweets = await fetchUserTweets(username)
} catch (error) {
  if (error.status === 401) {
    console.log(`Account ${username} is protected or suspended`)
    return []
  }
}
```

### Issue 3: Tweet Content Parsing
```typescript
// Solution: Clean and normalize tweet text
function cleanTweetText(text) {
  return text
    .replace(/https:\/\/t\.co\/\w+/g, '')  // Remove t.co links
    .replace(/@\w+/g, '')                  // Remove mentions
    .replace(/\n+/g, ' ')                  // Clean line breaks
    .trim()
}
```

## 🔧 Implementation Structure

```
src/app/api/aggregation/twitter/
├── route.ts              # Main aggregation endpoint
├── users.ts              # User account management
└── utils.ts              # Tweet processing utilities

src/app/test-twitter/
└── page.tsx              # Twitter API test page

src/lib/twitter/
├── client.ts             # Twitter API client
├── types.ts              # TypeScript interfaces
└── filters.ts            # Content filtering logic
```

## 🎯 Next Steps

1. **Get your Twitter API keys** using this guide
2. **Add keys to `.env.local`**
3. **Test the connection** at `/test-twitter`
4. **Run aggregation** to pull tweets into your HUD News feed

Your HUD News app will then show a mix of:
- 🔴 **Reddit tech discussions**
- 🐦 **Twitter/X tech updates** 
- 📰 **HackerNews stories** (coming next)
- 📧 **AI newsletters** (coming next)

Perfect blend of real-time tech intelligence! 🚀
