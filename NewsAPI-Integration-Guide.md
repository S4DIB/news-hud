# NewsAPI Integration Guide

## 📰 Overview

This guide will help you integrate NewsAPI into your HUD News App to get real-time breaking news from major news outlets like CNN, BBC, Reuters, TechCrunch, The Verge, and more.

## 🎯 What NewsAPI Provides

- **Real breaking news** from 80,000+ news sources worldwide
- **Category-based news** (Technology, Business, Health, Science, Sports)
- **Keyword search** for specific topics
- **High-quality articles** with proper titles, descriptions, and source attribution
- **Fresh content** updated every 15 minutes

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Free NewsAPI Key

1. Go to **https://newsapi.org/**
2. Click **"Get API Key"**
3. Sign up with your email (it's free!)
4. Choose the **"Developer"** plan (free - 500 requests/day)
5. Copy your API key (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 2: Add API Key to Your Environment

Create or update your `.env.local` file in the project root:

```env
# NewsAPI Configuration
NEWS_API_KEY=your_actual_api_key_here

# Example:
# NEWS_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Important:** Never commit your API key to GitHub! The `.env.local` file is already in `.gitignore`.

### Step 3: Restart Your Development Server

```bash
npm run dev
```

### Step 4: Test the Integration

1. Open your app at `http://localhost:3000`
2. Set your interests in the settings (e.g., "Artificial Intelligence", "Health & Fitness")
3. Refresh the news feed
4. Check the browser console for NewsAPI logs:

```
📰 NewsAPI: 8 articles
📰 NewsAPI sample: ["OpenAI releases new model", "Tech stocks surge"]
```

## 📊 Interest-to-Category Mapping

NewsAPI automatically maps your interests to relevant categories and keywords:

| **Your Interest** | **NewsAPI Category** | **Keywords** |
|---|---|---|
| Artificial Intelligence | Technology | AI, machine learning, OpenAI, ChatGPT |
| Health & Fitness | Health | fitness, health, exercise, nutrition |
| Stock Market | Business | stock market, trading, investing, NYSE |
| Startups | Business | startup, venture capital, entrepreneur |
| Space | Science | space, NASA, SpaceX, rocket |
| Climate Change | Science | climate change, renewable energy |

## 🔧 Advanced Configuration

### Custom Categories

You can modify the interest mapping in `src/lib/dynamicNews.ts`:

```javascript
const interestToKeywords = {
  'Your Custom Interest': { 
    category: 'technology', 
    keywords: ['keyword1', 'keyword2'] 
  }
}
```

### API Rate Limits

**Free Plan Limits:**
- 500 requests per day
- 50 requests per hour
- No commercial use

**The app automatically:**
- Limits to 2 categories per fetch
- Uses 5 articles per category max
- Includes 500ms delays between requests
- Implements timeout protection (8 seconds)

### Error Handling

The app gracefully handles:
- ❌ Invalid API keys
- ❌ Rate limit exceeded
- ❌ Network timeouts
- ❌ Malformed responses

## 📈 Expected Results

### Before NewsAPI Integration:
```
🔴 Reddit: 3 articles (community posts)
🌐 HackerNews: 2 articles (tech discussions)
```

### After NewsAPI Integration:
```
📰 NewsAPI: 8 articles (breaking news)
🔴 Reddit: 3 articles (discussions)  
🌐 HackerNews: 2 articles (tech news)
Total: 13 diverse articles from real news sources
```

## 🐛 Troubleshooting

### "NewsAPI returned no articles"

**Check 1: API Key**
```bash
# Verify your .env.local file exists and has the correct key
cat .env.local
```

**Check 2: Console Logs**
Look for these in browser console:
```
⚠️ NewsAPI not configured - skipping NewsAPI fetch
NewsAPI category technology failed: 401 (Unauthorized)
```

**Check 3: Test API Key**
Test your key manually:
```bash
curl "https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=YOUR_KEY"
```

### "Rate limit exceeded"

**Solution:**
- Wait 1 hour (free plan: 50 requests/hour)
- Reduce news refresh frequency
- Consider upgrading NewsAPI plan

### "No articles match interests"

**Solution:**
- Check if your interests are mapped in the code
- Try broader interests like "Technology" or "Health"
- Check console for available interest mappings

## 🎯 Optimization Tips

### 1. Choose Relevant Interests
The more specific your interests, the better the news matching:
- ✅ "Artificial Intelligence" → Gets AI-specific news
- ❌ "General" → Gets random news

### 2. Monitor API Usage
Check your usage at https://newsapi.org/account

### 3. Cache Strategy
The app automatically:
- Fetches news every 15 minutes
- Caches results in browser
- Deduplicates identical articles

## 🔒 Security Best Practices

### Environment Variables
```env
# ✅ Good - Server-side only
NEWS_API_KEY=your_key

# ❌ Bad - Exposed to client
NEXT_PUBLIC_NEWS_API_KEY=your_key
```

### API Key Protection
- Never log API keys
- Use server-side API routes when possible
- Rotate keys if compromised

## 🚀 Upgrade Options

### NewsAPI Business Plan ($449/month)
- 1,000,000 requests/month
- Commercial use allowed
- Live news (no 15-minute delay)
- Search historical articles

### Alternative News Sources
If you need more sources, consider adding:
- **RSS feeds** (free, but manual parsing)
- **Guardian API** (free, 5,000 requests/day)
- **NYTimes API** (free, 4,000 requests/day)

## 📝 Sample API Response

```json
{
  "status": "ok",
  "totalResults": 38,
  "articles": [
    {
      "source": { "name": "TechCrunch" },
      "title": "OpenAI announces GPT-5 with breakthrough capabilities",
      "description": "The new model shows significant improvements...",
      "url": "https://techcrunch.com/2024/...",
      "publishedAt": "2024-09-25T10:30:00Z"
    }
  ]
}
```

## 🎉 Success Checklist

- [ ] ✅ API key obtained from newsapi.org
- [ ] ✅ API key added to `.env.local`
- [ ] ✅ Development server restarted
- [ ] ✅ Console shows "NewsAPI: X articles"
- [ ] ✅ Real news articles appear in feed
- [ ] ✅ Articles show proper source attribution
- [ ] ✅ Multiple news sources mixed together

## 📞 Support

### NewsAPI Issues
- Documentation: https://newsapi.org/docs
- Support: https://newsapi.org/support

### App Integration Issues
- Check browser console for detailed error logs
- Verify environment variables are properly set
- Test with different interests/categories

---

🎯 **You should now have real breaking news integrated into your HUD News App!** The app will automatically fetch relevant news based on your interests and mix it with Reddit discussions and HackerNews tech content.
