import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { createTwitterClient } from '@/lib/twitter/client'
import { filterTweets, processTweet, defaultTwitterFilters } from '@/lib/twitter/filters'
import { ProcessedTweet } from '@/lib/twitter/types'

// High-value tech Twitter accounts
const TECH_ACCOUNTS = [
  // AI/ML Leaders
  'elonmusk', 'sama', 'satyanadella', 'sundarpichai', 'ylecun',
  
  // Companies
  'OpenAI', 'googledeepmind', 'anthropicai', 'huggingface',
  
  // Developers/Founders  
  'paulg', 'naval', 'garrytan', 'balajis', 'jason',
  
  // Tech News
  'techcrunch', 'verge', 'arstechnica', 'wired', 'hackernews'
]

function convertTwitterToArticle(processedTweet: ProcessedTweet) {
  // Generate tags from topics and hashtags
  const tags = [
    ...processedTweet.topics || [],
    ...processedTweet.hashtags || [],
    'twitter',
    'social'
  ].filter(Boolean).slice(0, 5)

  return {
    title: processedTweet.cleanText.length > 100 
      ? processedTweet.cleanText.substring(0, 97) + '...'
      : processedTweet.cleanText,
    summary: processedTweet.cleanText,
    url: processedTweet.url,
    author: `@${processedTweet.author.username}`,
    sourceName: 'Twitter',
    publishedAt: Timestamp.fromDate(new Date(processedTweet.createdAt)),
    popularityScore: processedTweet.score,
    finalScore: processedTweet.score,
    tags,
    metadata: {
      tweetId: processedTweet.id,
      authorId: processedTweet.author.id,
      authorName: processedTweet.author.name,
      authorUsername: processedTweet.author.username,
      authorVerified: processedTweet.author.verified,
      authorProfileImage: processedTweet.author.profileImage,
      likes: processedTweet.engagement.likes,
      retweets: processedTweet.engagement.retweets,
      replies: processedTweet.engagement.replies,
      quotes: processedTweet.engagement.quotes,
      totalEngagement: processedTweet.engagement.total,
      topics: processedTweet.topics,
      hashtags: processedTweet.hashtags,
      links: processedTweet.links,
      originalText: processedTweet.text
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      accounts = TECH_ACCOUNTS.slice(0, 10), // Default to first 10 accounts to avoid rate limits
      maxTweetsPerAccount = 5,
      filterConfig = defaultTwitterFilters
    } = body

    console.log(`Starting Twitter aggregation for ${accounts.length} accounts...`)

    const client = createTwitterClient()
    const articlesAdded = []
    let totalTweets = 0
    let totalFiltered = 0

    for (const username of accounts) {
      try {
        console.log(`Fetching tweets from @${username}...`)
        
        const { user, tweets } = await client.getUserTweetsByUsername(
          username, 
          maxTweetsPerAccount
        )

        if (!user) {
          console.log(`⚠️ Could not find user @${username}`)
          continue
        }

        if (tweets.length === 0) {
          console.log(`📭 No tweets found for @${username}`)
          continue
        }

        totalTweets += tweets.length

        // Filter high-quality tweets
        const filteredTweets = filterTweets(tweets, user, filterConfig)
        totalFiltered += filteredTweets.length

        console.log(`📊 @${username}: ${tweets.length} tweets → ${filteredTweets.length} after filtering`)

        // Process and save to Firebase
        for (const tweet of filteredTweets) {
          try {
            const processedTweet = processTweet(tweet, user, filterConfig)
            const article = convertTwitterToArticle(processedTweet)

            const docRef = await addDoc(collection(db, 'articles'), article)
            articlesAdded.push({
              id: docRef.id,
              username: username,
              tweetId: tweet.id,
              score: processedTweet.score,
              engagement: processedTweet.engagement.total
            })

            console.log(`✅ Added tweet from @${username}: ${processedTweet.score.toFixed(2)} score`)
          } catch (saveError) {
            console.error(`Failed to save tweet ${tweet.id}:`, saveError)
          }
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (accountError) {
        console.error(`Error processing @${username}:`, accountError)
        continue
      }
    }

    const response = {
      success: true,
      message: `Successfully aggregated Twitter content`,
      stats: {
        accounts_processed: accounts.length,
        total_tweets_fetched: totalTweets,
        tweets_after_filtering: totalFiltered,
        articles_added: articlesAdded.length
      },
      articles_added: articlesAdded.length,
      sample_articles: articlesAdded.slice(0, 3).map(article => ({
        username: article.username,
        score: article.score,
        engagement: article.engagement
      }))
    }

    console.log(`🎉 Twitter aggregation complete:`, response.stats)
    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Twitter aggregation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Twitter aggregation failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const client = createTwitterClient()
    const rateLimitStatus = await client.getRateLimitStatus()
    
    return NextResponse.json({
      message: 'Twitter aggregation endpoint is ready',
      configuration: {
        default_accounts: TECH_ACCOUNTS.length,
        max_tweets_per_account: 5,
        rate_limits: rateLimitStatus ? 'Available' : 'Not available'
      },
      usage: {
        endpoint: 'POST /api/aggregation/twitter',
        body: {
          accounts: ['array of usernames (optional)'],
          maxTweetsPerAccount: 'number (default: 5)',
          filterConfig: 'TwitterFilterConfig (optional)'
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Twitter API configuration error',
        message: error.message,
        setup_required: 'Please check TWITTER_BEARER_TOKEN environment variable'
      },
      { status: 500 }
    )
  }
}
