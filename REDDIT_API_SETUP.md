# 🔴 Reddit API Setup Guide for HUD News App

## Why Reddit API?

✅ **Rich Content Sources** - Access to thousands of subreddits  
✅ **Real-time Discussions** - Get trending topics and conversations  
✅ **Community Insights** - Tap into niche communities and expertise  
✅ **Engagement Metrics** - Upvotes, comments, and discussion data  
✅ **Free Tier** - Generous API limits for personal projects  
✅ **Easy Integration** - RESTful API with JSON responses  

## Step-by-Step Setup

### 1. Create Reddit Account (if you don't have one)

1. Go to [https://www.reddit.com](https://www.reddit.com)
2. Click **"Sign Up"** in the top right
3. Create your account with email/username/password
4. **Verify your email** (important for API access)

### 2. Create Reddit App

1. Go to [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Scroll down to **"Developed Applications"**
3. Click **"Create App"** or **"Create Another App"**

### 3. Fill Out App Details

**App Configuration:**
```
Name: HUD News App
App type: ☑️ web app (select this radio button)
Description: AI-powered news aggregation platform that curates content from Reddit communities
About URL: https://your-hud-news-app.vercel.app (leave blank for now)
Redirect URI: http://localhost:3000/auth/reddit/callback
```

**Important Notes:**
- **App Type**: Must be "web app" (not "script" or "installed app")
- **Redirect URI**: Use the localhost URL for development
- **Description**: Be honest about your app's purpose

### 4. Get Your API Credentials

After creating the app, you'll see:

```
┌─────────────────────────────────────┐
│  HUD News App                       │
│  web app by YourUsername            │
│                                     │
│  Client ID: AbCdEf12345678          │  ← Copy this
│  Secret: XyZ987654321abcdef         │  ← Copy this
│                                     │
│  Edit  Delete                       │
└─────────────────────────────────────┘
```

**Copy these values:**
- **Client ID**: The short string under your app name
- **Secret**: The longer string (keep this private!)

### 5. Add to Your Environment Variables

Open your `.env.local` file and add:

```env
# Reddit API Configuration
REDDIT_CLIENT_ID=AbCdEf12345678
REDDIT_CLIENT_SECRET=XyZ987654321abcdef
REDDIT_USER_AGENT=HUD-News-App/1.0 by YourUsername
```

**Important**: Replace with your actual values!

### 6. Reddit API Authentication Flow

Reddit uses OAuth2 for authentication. Here's how it works:

```
User → Your App → Reddit → Your App → API Access
```

1. **User clicks "Login with Reddit"**
2. **Redirect to Reddit** with your client ID
3. **User authorizes** your app
4. **Reddit redirects back** with authorization code
5. **Exchange code for access token**
6. **Use token for API requests**

## Reddit API Integration

### Basic API Usage

```typescript
// Get subreddit posts
const response = await fetch(
  `https://www.reddit.com/r/technology/hot.json?limit=25`,
  {
    headers: {
      'User-Agent': 'HUD-News-App/1.0 by YourUsername'
    }
  }
)

const data = await response.json()
const posts = data.data.children.map(child => child.data)
```

### Popular Subreddits for News

```typescript
const newsSubreddits = [
  'technology',      // Tech news and discussions
  'programming',     // Programming and development
  'MachineLearning', // AI and ML content
  'startups',        // Startup news and advice
  'webdev',          // Web development
  'artificial',      // AI discussions
  'datascience',     // Data science content
  'cybersecurity',   // Security news
  'cryptocurrency',  // Crypto and blockchain
  'science',         // Scientific discoveries
  'futurology',      // Future tech predictions
  'AskEngineers'     // Engineering Q&A
]
```

### Content Filtering

```typescript
// Filter high-quality posts
const qualityPosts = posts.filter(post => 
  post.score > 50 &&           // Minimum upvotes
  post.num_comments > 10 &&    // Active discussion
  !post.over_18 &&             // SFW content
  !post.is_self &&             // External links
  post.url.includes('http')    // Valid URLs
)
```

## Reddit API Endpoints

### Essential Endpoints for News Aggregation

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `/r/{subreddit}/hot` | Trending posts | `/r/technology/hot.json` |
| `/r/{subreddit}/new` | Latest posts | `/r/programming/new.json` |
| `/r/{subreddit}/top` | Top posts | `/r/startups/top.json?t=day` |
| `/r/{subreddit}/rising` | Rising posts | `/r/artificial/rising.json` |

### Query Parameters

```typescript
const params = new URLSearchParams({
  limit: '25',           // Number of posts (max 100)
  t: 'day',             // Time period: hour, day, week, month, year, all
  after: 'post_id',     // Pagination
  before: 'post_id'     // Pagination
})
```

## Rate Limits & Best Practices

### API Limits
- **Rate Limit**: 60 requests per minute
- **User-Agent Required**: Must include unique User-Agent header
- **No API Key**: Public endpoints don't require authentication
- **Bulk Requests**: Use `limit=100` to minimize requests

### Best Practices

```typescript
// Rate limiting with delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchSubredditSafely(subreddit: string) {
  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`, {
      headers: {
        'User-Agent': process.env.REDDIT_USER_AGENT || 'HUD-News-App/1.0'
      }
    })
    
    if (response.status === 429) {
      // Rate limited - wait and retry
      await delay(60000) // Wait 1 minute
      return fetchSubredditSafely(subreddit)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Reddit API error for ${subreddit}:`, error)
    return null
  }
}
```

## Data Structure

### Reddit Post Object

```typescript
interface RedditPost {
  id: string
  title: string
  url: string
  author: string
  subreddit: string
  score: number              // Upvotes - downvotes
  upvote_ratio: number       // Percentage of upvotes
  num_comments: number       // Comment count
  created_utc: number        // Unix timestamp
  selftext: string           // Post content (for text posts)
  thumbnail: string          // Image thumbnail
  domain: string             // Source domain
  permalink: string          // Reddit URL
  is_self: boolean           // Text post vs link
  over_18: boolean           // NSFW flag
  distinguished: string      // Moderator/admin posts
  stickied: boolean          // Pinned posts
}
```

### Convert to Your Article Format

```typescript
function convertRedditToArticle(redditPost: any) {
  return {
    id: redditPost.id,
    title: redditPost.title,
    url: redditPost.url,
    summary: redditPost.selftext ? redditPost.selftext.substring(0, 200) + '...' : '',
    author: redditPost.author,
    source_name: `Reddit - r/${redditPost.subreddit}`,
    published_at: new Date(redditPost.created_utc * 1000).toISOString(),
    popularity_score: Math.min(redditPost.score / 1000, 1), // Normalize
    tags: [redditPost.subreddit, 'reddit'],
    metadata: {
      score: redditPost.score,
      comments: redditPost.num_comments,
      upvote_ratio: redditPost.upvote_ratio,
      subreddit: redditPost.subreddit,
      reddit_url: `https://reddit.com${redditPost.permalink}`
    }
  }
}
```

## Security & Compliance

### API Key Security
```typescript
// ✅ Good - Server-side only
const clientSecret = process.env.REDDIT_CLIENT_SECRET

// ❌ Bad - Never expose in client-side code
const clientSecret = 'XyZ987654321abcdef'
```

### Reddit API Rules
- **User-Agent**: Always include descriptive User-Agent
- **Rate Limits**: Respect 60 requests/minute limit
- **Content Policy**: Follow Reddit's content policy
- **Attribution**: Credit Reddit as source
- **Caching**: Cache responses to reduce API calls

## Testing Your Setup

### 1. Test Basic Connection

```bash
# Test public endpoint (no auth needed)
curl -H "User-Agent: HUD-News-App/1.0 by YourUsername" \
  "https://www.reddit.com/r/technology/hot.json?limit=5"
```

### 2. Create Test Endpoint

```typescript
// src/app/api/test-reddit/route.ts
export async function GET() {
  try {
    const response = await fetch(
      'https://www.reddit.com/r/technology/hot.json?limit=5',
      {
        headers: {
          'User-Agent': process.env.REDDIT_USER_AGENT || 'HUD-News-App/1.0'
        }
      }
    )
    
    const data = await response.json()
    
    return Response.json({
      status: 'success',
      posts: data.data.children.length,
      sample: data.data.children[0]?.data.title
    })
  } catch (error) {
    return Response.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
```

### 3. Test URL
```
http://localhost:3000/api/test-reddit
```

## Advanced Features

### 1. OAuth Authentication (Optional)

For user-specific features like posting or accessing private subreddits:

```typescript
const authUrl = `https://www.reddit.com/api/v1/authorize?` +
  `client_id=${process.env.REDDIT_CLIENT_ID}&` +
  `response_type=code&` +
  `state=random_string&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `duration=permanent&` +
  `scope=read submit identity`
```

### 2. Subreddit Recommendations

```typescript
const techSubreddits = {
  'AI/ML': ['MachineLearning', 'artificial', 'datascience'],
  'Web Dev': ['webdev', 'javascript', 'reactjs', 'nodejs'],
  'Mobile': ['androiddev', 'iOSProgramming', 'reactnative'],
  'DevOps': ['devops', 'kubernetes', 'docker', 'aws'],
  'Security': ['cybersecurity', 'netsec', 'AskNetsec'],
  'General': ['technology', 'programming', 'coding', 'compsci']
}
```

### 3. Content Quality Scoring

```typescript
function calculateRedditQuality(post: RedditPost) {
  let score = 0
  
  // Upvote ratio (0-1)
  score += post.upvote_ratio * 0.3
  
  // Engagement (comments vs score)
  score += Math.min(post.num_comments / post.score, 1) * 0.2
  
  // Domain reputation
  const trustedDomains = ['github.com', 'arxiv.org', 'techcrunch.com']
  if (trustedDomains.some(domain => post.url.includes(domain))) {
    score += 0.3
  }
  
  // Time factor (newer = better)
  const hoursOld = (Date.now() - post.created_utc * 1000) / (1000 * 60 * 60)
  score += Math.max(0, (24 - hoursOld) / 24) * 0.2
  
  return Math.min(score, 1)
}
```

## Troubleshooting

### Common Issues

**"Too Many Requests" (429 Error)**
```typescript
// Solution: Add rate limiting
await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
```

**"Forbidden" (403 Error)**
```typescript
// Solution: Check User-Agent header
headers: {
  'User-Agent': 'HUD-News-App/1.0 by YourRedditUsername'
}
```

**"Not Found" (404 Error)**
```typescript
// Solution: Verify subreddit exists and is public
const response = await fetch(`https://www.reddit.com/r/${subreddit}/about.json`)
```

### Debugging Tips

```typescript
// Log API responses
console.log('Reddit API Response:', {
  status: response.status,
  headers: Object.fromEntries(response.headers.entries()),
  rateLimit: response.headers.get('x-ratelimit-remaining')
})
```

## Production Deployment

### Environment Variables in Vercel

```bash
# Add to Vercel environment variables
vercel env add REDDIT_CLIENT_ID production
vercel env add REDDIT_CLIENT_SECRET production
vercel env add REDDIT_USER_AGENT production
```

### Update Redirect URIs

When deploying to production:

1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Edit your app
3. Update redirect URI to: `https://your-domain.vercel.app/auth/reddit/callback`

## Integration with HUD News

### 1. Add to Content Sources

```typescript
// src/lib/reddit/client.ts
export async function fetchRedditPosts(subreddit: string, limit = 25) {
  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
    {
      headers: {
        'User-Agent': process.env.REDDIT_USER_AGENT
      }
    }
  )
  
  const data = await response.json()
  return data.data.children.map(child => convertRedditToArticle(child.data))
}
```

### 2. Add to Aggregation Pipeline

```typescript
// src/app/api/aggregation/reddit/route.ts
import { fetchRedditPosts } from '@/lib/reddit/client'
import { addArticle } from '@/lib/firebase/firestore'

export async function POST(request: Request) {
  const { subreddit } = await request.json()
  
  try {
    const posts = await fetchRedditPosts(subreddit)
    
    for (const post of posts) {
      await addArticle(post)
    }
    
    return Response.json({
      success: true,
      added: posts.length,
      subreddit
    })
  } catch (error) {
    return Response.json({
      error: error.message
    }, { status: 500 })
  }
}
```

## Next Steps

1. **Get Reddit API credentials** following this guide
2. **Add to `.env.local`** with your actual values
3. **Test the connection** with the test endpoint
4. **Integrate with your news aggregation** pipeline
5. **Configure subreddit monitoring** for relevant content

Reddit API integration will give your HUD News app access to rich community discussions and trending topics! 🚀

## Useful Resources

- **Reddit API Documentation**: [https://www.reddit.com/dev/api/](https://www.reddit.com/dev/api/)
- **OAuth2 Guide**: [https://github.com/reddit-archive/reddit/wiki/OAuth2](https://github.com/reddit-archive/reddit/wiki/OAuth2)
- **API Rate Limits**: [https://www.reddit.com/wiki/api](https://www.reddit.com/wiki/api)
- **Subreddit Discovery**: [https://subredditstats.com/](https://subredditstats.com/)

---

**Pro Tip**: Start with popular tech subreddits like `r/technology`, `r/programming`, and `r/MachineLearning` for high-quality content! 🔴
