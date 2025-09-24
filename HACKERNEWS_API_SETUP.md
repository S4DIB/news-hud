# 🌐 HackerNews API Integration Guide

## Overview
Complete step-by-step guide to integrate HackerNews API into your HUD News app for fetching real-time tech news based on user interests.

---

## 📋 **What is HackerNews API?**

**HackerNews** is a popular tech news aggregation site where developers and entrepreneurs share and discuss:
- 🔥 Latest tech news and articles
- 💡 Startup announcements and funding news
- 🛠️ Open source projects and tools
- 📝 Tech blogs and opinion pieces
- 🎯 Job postings and career content

**API Benefits:**
- ✅ **Free to use** - No API key required
- ✅ **Real-time data** - Latest stories and comments
- ✅ **High quality content** - Curated by tech community
- ✅ **JSON format** - Easy to integrate
- ✅ **Fast responses** - Reliable performance

---

## 🔗 **HackerNews API Endpoints**

### **Base URL**: `https://hacker-news.firebaseio.com/v0/`

### **Available Endpoints**:
```
📰 Top Stories:     /topstories.json
🆕 New Stories:     /newstories.json
🔥 Best Stories:    /beststories.json
💼 Job Stories:     /jobstories.json
🔍 Individual Item: /item/{id}.json
👤 User Profile:    /user/{username}.json
```

### **Example API Calls**:
```bash
# Get top story IDs
GET https://hacker-news.firebaseio.com/v0/topstories.json
# Returns: [32817204, 32817003, 32816891, ...]

# Get specific story details
GET https://hacker-news.firebaseio.com/v0/item/32817204.json
# Returns: { "id": 32817204, "title": "...", "url": "...", ... }
```

---

## 🏗️ **Implementation Architecture**

### **How It Works in HUD News**:
```
1. User sets interests: ["AI", "Programming", "Startups"]
   ↓
2. Map interests to keywords: ["artificial intelligence", "programming", "startup"]
   ↓
3. Fetch HackerNews top stories (first 50)
   ↓
4. Filter stories by matching keywords in title/content
   ↓
5. Score and rank filtered stories
   ↓
6. Display personalized HackerNews content
```

---

## 🔧 **Step-by-Step Integration**

### **Step 1: Create HackerNews API Functions**

**File**: `src/lib/apis/hackernews.ts`

```typescript
// HackerNews API integration
interface HackerNewsItem {
  id: number
  title: string
  url?: string
  text?: string
  by: string
  time: number
  score: number
  descendants?: number
  type: string
}

interface HackerNewsArticle {
  id: string
  title: string
  summary: string
  url: string
  author: string
  sourceName: string
  publishedAt: Date
  popularityScore: number
  finalScore: number
  tags: string[]
  metadata: {
    score: number
    comments: number
    type: string
  }
}

// Get top story IDs
export async function getTopStoryIds(limit = 50): Promise<number[]> {
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    const storyIds = await response.json()
    return storyIds.slice(0, limit)
  } catch (error) {
    console.error('Error fetching top story IDs:', error)
    return []
  }
}

// Get story details by ID
export async function getStoryById(id: number): Promise<HackerNewsItem | null> {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    return await response.json()
  } catch (error) {
    console.error(`Error fetching story ${id}:`, error)
    return null
  }
}

// Get multiple stories in parallel
export async function getStoriesByIds(ids: number[]): Promise<HackerNewsItem[]> {
  try {
    const storyPromises = ids.map(id => getStoryById(id))
    const stories = await Promise.all(storyPromises)
    return stories.filter(story => story !== null) as HackerNewsItem[]
  } catch (error) {
    console.error('Error fetching multiple stories:', error)
    return []
  }
}

// Convert HackerNews item to standardized article format
export function convertToArticle(item: HackerNewsItem): HackerNewsArticle {
  return {
    id: `hn-${item.id}`,
    title: item.title,
    summary: item.text || '',
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    author: item.by || 'Unknown',
    sourceName: 'HackerNews',
    publishedAt: new Date(item.time * 1000),
    popularityScore: Math.min((item.score || 0) / 500, 1), // Normalize to 0-1
    finalScore: Math.min((item.score || 0) / 500, 1),
    tags: extractTechTags(item.title),
    metadata: {
      score: item.score || 0,
      comments: item.descendants || 0,
      type: item.type
    }
  }
}

// Extract relevant tech tags from title
function extractTechTags(title: string): string[] {
  const techKeywords = [
    'ai', 'ml', 'javascript', 'python', 'react', 'nodejs', 'docker', 'kubernetes',
    'aws', 'google', 'microsoft', 'apple', 'tesla', 'spacex', 'crypto', 'bitcoin',
    'startup', 'vc', 'funding', 'ipo', 'programming', 'coding', 'tech', 'api'
  ]
  
  const tags = []
  const lowerTitle = title.toLowerCase()
  
  for (const keyword of techKeywords) {
    if (lowerTitle.includes(keyword)) {
      tags.push(keyword)
    }
  }
  
  return tags
}
```

### **Step 2: Add Interest-Based Filtering**

```typescript
// Filter HackerNews stories by user interests
export async function fetchHackerNewsForInterests(interests: string[]): Promise<HackerNewsArticle[]> {
  try {
    console.log('🌐 Fetching HackerNews for interests:', interests)
    
    // Get top story IDs
    const storyIds = await getTopStoryIds(50)
    console.log(`📰 Got ${storyIds.length} top story IDs`)
    
    // Fetch story details
    const stories = await getStoriesByIds(storyIds)
    console.log(`✅ Fetched ${stories.length} story details`)
    
    // Convert to article format
    const articles = stories
      .filter(story => story.title && story.type === 'story') // Only stories with titles
      .map(story => convertToArticle(story))
    
    // Filter by interests if provided
    if (interests.length > 0) {
      const filteredArticles = articles.filter(article => 
        isRelevantToInterests(article, interests)
      )
      console.log(`🎯 Filtered to ${filteredArticles.length} relevant articles`)
      return filteredArticles.slice(0, 15) // Top 15 relevant articles
    }
    
    return articles.slice(0, 20) // Top 20 articles if no interests
    
  } catch (error) {
    console.error('❌ Error fetching HackerNews:', error)
    return []
  }
}

// Check if article is relevant to user interests
function isRelevantToInterests(article: HackerNewsArticle, interests: string[]): boolean {
  const searchTerms = getSearchTermsForInterests(interests)
  const articleText = `${article.title} ${article.summary}`.toLowerCase()
  
  return searchTerms.some(term => 
    articleText.includes(term.toLowerCase())
  )
}

// Map interests to search terms
function getSearchTermsForInterests(interests: string[]): string[] {
  const interestKeywords = {
    'Artificial Intelligence': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'openai', 'gpt'],
    'Machine Learning': ['machine learning', 'ml', 'deep learning', 'tensorflow', 'pytorch'],
    'Programming': ['programming', 'coding', 'development', 'javascript', 'python', 'react'],
    'Startups': ['startup', 'entrepreneur', 'funding', 'vc', 'venture capital', 'ipo'],
    'Cybersecurity': ['security', 'cybersecurity', 'privacy', 'encryption', 'hack'],
    'Blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3'],
    // Add more mappings as needed
  }
  
  const searchTerms = new Set<string>()
  
  for (const interest of interests) {
    const keywords = interestKeywords[interest] || [interest.toLowerCase()]
    keywords.forEach(keyword => searchTerms.add(keyword))
  }
  
  return Array.from(searchTerms)
}
```

### **Step 3: Integrate with Dynamic News System**

**Update**: `src/lib/dynamicNews.ts`

```typescript
import { fetchHackerNewsForInterests } from './apis/hackernews'

// Update the main fetch function
export async function fetchDynamicNews(interests: string[]): Promise<DynamicArticle[]> {
  console.log('🔄 Fetching dynamic news for interests:', interests)
  
  try {
    // Fetch from all sources in parallel
    const [hackerNewsArticles, redditArticles] = await Promise.all([
      fetchHackerNewsForInterests(interests),
      fetchRedditForInterests(interests)
    ])
    
    console.log(`📊 Fetched: ${hackerNewsArticles.length} HackerNews + ${redditArticles.length} Reddit`)
    
    const allArticles = [...hackerNewsArticles, ...redditArticles]
    
    // Sort by relevance and popularity
    allArticles.sort((a, b) => {
      const scoreA = a.finalScore + (a.relevanceScore || 0)
      const scoreB = b.finalScore + (b.relevanceScore || 0)
      return scoreB - scoreA
    })
    
    console.log(`✅ Returning ${allArticles.length} total articles`)
    return allArticles.slice(0, 30) // Top 30 articles
    
  } catch (error) {
    console.error('❌ Error fetching dynamic news:', error)
    return []
  }
}
```

### **Step 4: Update UI to Show HackerNews Source**

**Update**: `src/app/page.tsx`

```typescript
// Update source icon function
const getSourceIcon = (sourceName: string) => {
  if (sourceName.includes('Reddit')) return '🔴'
  if (sourceName.includes('HackerNews')) return '🟠' // Orange for HackerNews
  if (sourceName.includes('TLDR')) return '🤖'
  if (sourceName.includes('Twitter')) return '🐦'
  return '📡'
}
```

---

## 🎯 **Testing Your Integration**

### **Step 1: Test API Connection**

Create a test file: `src/app/test-hackernews/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { fetchHackerNewsForInterests } from '@/lib/apis/hackernews'

export default function TestHackerNews() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)

  const testFetch = async () => {
    setLoading(true)
    try {
      const interests = ['Programming', 'Artificial Intelligence', 'Startups']
      const result = await fetchHackerNewsForInterests(interests)
      setArticles(result)
      console.log('HackerNews test result:', result)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>🌐 HackerNews API Test</h1>
      <button 
        onClick={testFetch} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          background: '#ff6600', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {loading ? '🔄 Testing...' : '🧪 Test HackerNews API'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Results: {articles.length} articles</h2>
        {articles.map((article, index) => (
          <div key={index} style={{ 
            border: '1px solid #333', 
            padding: '10px', 
            margin: '10px 0',
            borderRadius: '4px'
          }}>
            <h3>🟠 {article.title}</h3>
            <p>📊 Score: {article.metadata.score} | 💬 Comments: {article.metadata.comments}</p>
            <p>🕒 {article.publishedAt.toLocaleString()}</p>
            <a href={article.url} target="_blank" style={{ color: '#ff6600' }}>
              Read more →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### **Step 2: Test in Main App**

1. **🔄 Refresh your app**: `http://localhost:3000`
2. **⚙️ Go to Settings**: Set interests like "Programming", "AI", "Startups"
3. **💾 Save Changes**: Return to main feed
4. **👀 Look for HackerNews articles**: Orange icon 🟠
5. **🔍 Check browser console**: Should see fetch logs

---

## 🔧 **API Rate Limits & Best Practices**

### **Rate Limits**:
- ✅ **No authentication required**
- ✅ **No explicit rate limits** mentioned
- ⚠️ **Be respectful**: Don't spam requests
- 💡 **Recommended**: Cache responses for 5-10 minutes

### **Best Practices**:

```typescript
// 1. Implement caching
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getCachedTopStories(): Promise<number[]> {
  const cacheKey = 'top-stories'
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  const data = await getTopStoryIds()
  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

// 2. Handle errors gracefully
export async function safeGetStory(id: number): Promise<HackerNewsItem | null> {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    
    if (!response.ok) {
      console.warn(`Story ${id} not found or unavailable`)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch story ${id}:`, error)
    return null
  }
}

// 3. Batch requests efficiently
export async function batchGetStories(ids: number[], batchSize = 10): Promise<HackerNewsItem[]> {
  const results = []
  
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(id => safeGetStory(id))
    )
    results.push(...batchResults.filter(Boolean))
    
    // Small delay between batches to be nice to the API
    if (i + batchSize < ids.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return results
}
```

---

## 📊 **Data Structure Examples**

### **Top Stories Response**:
```json
[
  32817204,
  32817003,
  32816891,
  32816754,
  32816691,
  ...
]
```

### **Individual Story Response**:
```json
{
  "id": 32817204,
  "title": "OpenAI releases GPT-4 with vision capabilities",
  "url": "https://openai.com/gpt-4",
  "text": "We're excited to announce GPT-4 with enhanced vision...",
  "by": "sama",
  "time": 1693487234,
  "score": 1284,
  "descendants": 387,
  "type": "story",
  "kids": [32817301, 32817289, ...]
}
```

### **Converted Article Format**:
```json
{
  "id": "hn-32817204",
  "title": "OpenAI releases GPT-4 with vision capabilities",
  "summary": "We're excited to announce GPT-4 with enhanced vision...",
  "url": "https://openai.com/gpt-4",
  "author": "sama",
  "sourceName": "HackerNews",
  "publishedAt": "2023-08-31T12:34:00Z",
  "popularityScore": 0.87,
  "finalScore": 0.87,
  "tags": ["ai", "gpt", "openai"],
  "metadata": {
    "score": 1284,
    "comments": 387,
    "type": "story"
  }
}
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Stories without URLs**
```typescript
// Some HackerNews posts are text-only (Ask HN, Show HN)
// Solution: Provide fallback URL to HackerNews discussion
const url = item.url || `https://news.ycombinator.com/item?id=${item.id}`
```

### **Issue 2: Network Timeouts**
```typescript
// Solution: Add timeout and retry logic
const fetchWithTimeout = async (url: string, timeout = 5000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
```

### **Issue 3: Stories with No Content**
```typescript
// Solution: Filter out stories without titles or content
const validStories = stories.filter(story => 
  story.title && 
  story.type === 'story' && 
  !story.deleted && 
  !story.dead
)
```

---

## ✅ **Verification Checklist**

- [ ] ✅ API endpoints are accessible
- [ ] ✅ Top stories fetch correctly
- [ ] ✅ Individual stories fetch with details
- [ ] ✅ Articles convert to standard format
- [ ] ✅ Interest-based filtering works
- [ ] ✅ Articles appear in main feed with 🟠 icon
- [ ] ✅ Scores and metadata display correctly
- [ ] ✅ Links work when clicked
- [ ] ✅ Error handling prevents crashes
- [ ] ✅ Performance is acceptable (< 3 seconds)

---

## 🎉 **Success Metrics**

After successful integration, you should see:

1. **🟠 HackerNews articles** in your main feed
2. **🎯 Relevant content** based on your interests
3. **📊 Proper scoring** (score/500 for popularity)
4. **🕒 Recent timestamps** (stories from last 24 hours)
5. **💬 Comment counts** displayed in metadata
6. **🔗 Working links** to original articles or HN discussion

---

## 🚀 **Next Steps**

### **Enhancements to Consider**:
1. **💬 Fetch top comments** for additional context
2. **👤 User filtering** - follow specific HN users
3. **🏷️ Better tagging** - ML-based topic detection
4. **📊 Trending detection** - identify rapidly rising stories
5. **🔍 Search functionality** - search HN archives
6. **📱 Mobile optimization** - responsive design improvements

### **Integration with Other Sources**:
- Combine HackerNews with Reddit, Twitter feeds
- Cross-reference trending topics across platforms
- Unified scoring system across all sources

Your HackerNews integration is now complete! 🎉 

**Test it by setting interests related to technology, programming, or startups, and you should see relevant HackerNews articles in your personalized feed!**
