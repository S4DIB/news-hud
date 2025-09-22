import { NextRequest, NextResponse } from 'next/server'

// Auto-aggregation endpoint that combines all sources
export async function POST() {
  try {
    console.log('🚀 Starting automated content aggregation...')
    
    const results = {
      reddit: { success: false, articles: 0, error: null },
      hackernews: { success: false, articles: 0, error: null },
      twitter: { success: false, articles: 0, error: null },
      newsletters: { success: false, articles: 0, error: null }
    }

    // 1. Reddit aggregation (most reliable)
    try {
      console.log('📍 Aggregating Reddit content...')
      const redditResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/aggregation/reddit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subreddits: ['technology', 'programming', 'MachineLearning', 'startups'],
          limit: 15
        })
      })
      
      if (redditResponse.ok) {
        const redditData = await redditResponse.json()
        results.reddit.success = true
        results.reddit.articles = redditData.articles_added || 0
        console.log(`✅ Reddit: ${results.reddit.articles} articles`)
      }
    } catch (error: any) {
      results.reddit.error = error.message
      console.log('❌ Reddit failed:', error.message)
    }

    // 2. HackerNews aggregation (always free)
    try {
      console.log('📍 Aggregating HackerNews content...')
      const hnResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/aggregation/hackernews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'top',
          limit: 20
        })
      })
      
      if (hnResponse.ok) {
        const hnData = await hnResponse.json()
        results.hackernews.success = true
        results.hackernews.articles = hnData.articles_added || 0
        console.log(`✅ HackerNews: ${results.hackernews.articles} articles`)
      }
    } catch (error: any) {
      results.hackernews.error = error.message
      console.log('❌ HackerNews failed:', error.message)
    }

    // 3. Twitter aggregation (if API key available and limited)
    if (process.env.TWITTER_BEARER_TOKEN) {
      try {
        console.log('📍 Aggregating Twitter content...')
        const twitterResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/aggregation/twitter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accounts: ['OpenAI', 'sama', 'techcrunch', 'verge'], // Limited to 4 accounts to save API calls
            maxTweetsPerAccount: 3 // Only 3 tweets per account = 12 total
          })
        })
        
        if (twitterResponse.ok) {
          const twitterData = await twitterResponse.json()
          results.twitter.success = true
          results.twitter.articles = twitterData.articles_added || 0
          console.log(`✅ Twitter: ${results.twitter.articles} articles`)
        }
      } catch (error: any) {
        results.twitter.error = error.message
        console.log('❌ Twitter failed:', error.message)
      }
    } else {
      results.twitter.error = 'Twitter API key not configured'
      console.log('⚠️ Twitter skipped: No API key')
    }

    // 4. Newsletter aggregation (free but may be limited by CORS)
    try {
      console.log('📍 Aggregating Newsletter content...')
      const newsletterResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/aggregation/newsletters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletters: ['tldr-ai', 'rundown-ai'],
          maxItemsPerNewsletter: 3
        })
      })
      
      if (newsletterResponse.ok) {
        const newsletterData = await newsletterResponse.json()
        results.newsletters.success = true
        results.newsletters.articles = newsletterData.articles_added || 0
        console.log(`✅ Newsletters: ${results.newsletters.articles} articles`)
      }
    } catch (error: any) {
      results.newsletters.error = error.message
      console.log('❌ Newsletters failed:', error.message)
    }

    const totalArticles = Object.values(results).reduce((sum, result) => sum + result.articles, 0)
    const successCount = Object.values(results).filter(result => result.success).length

    console.log(`🎉 Auto-aggregation complete: ${totalArticles} articles from ${successCount}/4 sources`)

    return NextResponse.json({
      success: true,
      message: `Auto-aggregation complete: ${totalArticles} new articles`,
      timestamp: new Date().toISOString(),
      sources: results,
      summary: {
        total_articles: totalArticles,
        successful_sources: successCount,
        failed_sources: 4 - successCount
      }
    })

  } catch (error: any) {
    console.error('Auto-aggregation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Auto-aggregation failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Auto-aggregation endpoint',
    description: 'Automatically fetches content from all available sources',
    sources: [
      'Reddit (technology, programming, ML, startups)',
      'HackerNews (top stories)',
      'Twitter (if API key configured)',
      'Newsletters (TLDR AI, Rundown AI)'
    ],
    usage: 'POST /api/aggregation/auto',
    note: 'This endpoint is designed for cron jobs or automatic updates'
  })
}
