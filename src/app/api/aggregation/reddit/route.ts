import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface RedditPost {
  id: string
  title: string
  url: string
  author: string
  subreddit: string
  score: number
  upvote_ratio: number
  num_comments: number
  created_utc: number
  selftext: string
  domain: string
  permalink: string
  over_18: boolean
}

function convertRedditToArticle(post: RedditPost) {
  // Calculate popularity score (0-1 scale)
  const popularityScore = Math.min(post.score / 1000, 1)
  
  // Calculate engagement score based on comments vs score ratio
  const engagementScore = post.num_comments > 0 ? Math.min(post.num_comments / post.score, 1) : 0
  
  // Calculate recency score (newer = higher)
  const hoursOld = (Date.now() - post.created_utc * 1000) / (1000 * 60 * 60)
  const recencyScore = Math.max(0, (24 - hoursOld) / 24)
  
  // Final score combines popularity, engagement, and recency
  const finalScore = (popularityScore * 0.4 + engagementScore * 0.3 + recencyScore * 0.3)

  return {
    title: post.title,
    summary: post.selftext ? post.selftext.substring(0, 300) + '...' : `Discussion from r/${post.subreddit} with ${post.num_comments} comments`,
    url: post.url.startsWith('http') ? post.url : `https://reddit.com${post.permalink}`,
    author: post.author,
    sourceName: `Reddit - r/${post.subreddit}`,
    publishedAt: Timestamp.fromDate(new Date(post.created_utc * 1000)),
    scrapedAt: Timestamp.now(),
    popularityScore: popularityScore,
    relevanceScore: 0.5, // Default, can be enhanced with AI
    finalScore: finalScore,
    tags: [post.subreddit, 'reddit', post.domain.split('.')[0]],
    metadata: {
      score: post.score,
      comments: post.num_comments,
      upvote_ratio: post.upvote_ratio,
      subreddit: post.subreddit,
      reddit_url: `https://reddit.com${post.permalink}`,
      domain: post.domain,
      author: post.author,
      nsfw: post.over_18
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      subreddits = ['technology', 'programming', 'MachineLearning', 'startups'], 
      limit = 25,
      sort = 'hot' 
    } = body

    const userAgent = process.env.REDDIT_USER_AGENT || 'HUD-News-App/1.0'
    const articlesAdded = []
    
    console.log(`Aggregating from ${subreddits.length} subreddits...`)

    for (const subreddit of subreddits) {
      try {
        console.log(`Fetching r/${subreddit}...`)
        
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`,
          {
            headers: {
              'User-Agent': userAgent,
              'Accept': 'application/json'
            }
          }
        )

        if (!response.ok) {
          console.error(`Failed to fetch r/${subreddit}: ${response.status}`)
          continue
        }

        const data = await response.json()
        const posts = data.data?.children?.map((child: any) => child.data) || []
        
        // Filter quality posts
        const qualityPosts = posts.filter((post: RedditPost) => 
          post.score > 10 &&           // Minimum upvotes
          post.num_comments > 5 &&     // Some discussion
          !post.over_18 &&             // SFW only
          post.upvote_ratio > 0.6 &&   // Positive reception
          post.title.length > 10 &&    // Meaningful title
          !post.title.toLowerCase().includes('[deleted]')
        )

        console.log(`Found ${qualityPosts.length} quality posts in r/${subreddit}`)

        // Convert and save to Firebase
        for (const post of qualityPosts) {
          try {
            const article = convertRedditToArticle(post)
            
            // Add to Firebase
            const docRef = await addDoc(collection(db, 'articles'), article)
            
            articlesAdded.push({
              id: docRef.id,
              title: article.title,
              subreddit: post.subreddit,
              score: post.score
            })
            
          } catch (error) {
            console.error(`Error saving post ${post.id}:`, error)
          }
        }

        // Rate limiting - wait between subreddits
        if (subreddits.indexOf(subreddit) < subreddits.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

      } catch (error) {
        console.error(`Error processing r/${subreddit}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully aggregated ${articlesAdded.length} articles from Reddit`,
      articles_added: articlesAdded.length,
      subreddits_processed: subreddits.length,
      details: articlesAdded,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Reddit aggregation error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Failed to aggregate Reddit content'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Manual trigger for testing
    const { searchParams } = new URL(request.url)
    const subreddit = searchParams.get('subreddit') || 'technology'
    const limit = parseInt(searchParams.get('limit') || '10')

    const userAgent = process.env.REDDIT_USER_AGENT || 'HUD-News-App/1.0'
    
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}`)
    }

    const data = await response.json()
    const posts = data.data?.children?.map((child: any) => child.data) || []
    
    const articles = posts.map(convertRedditToArticle)

    return NextResponse.json({
      success: true,
      subreddit,
      articles_preview: articles,
      count: articles.length,
      message: 'Preview of articles that would be added to database'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
