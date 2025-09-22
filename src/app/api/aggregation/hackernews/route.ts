import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { createHackerNewsClient, ProcessedHNStory } from '@/lib/hackernews/client'

function convertHNToArticle(story: ProcessedHNStory) {
  return {
    title: story.title,
    summary: story.summary,
    url: story.url,
    author: story.author,
    sourceName: 'HackerNews',
    publishedAt: Timestamp.fromDate(story.createdAt),
    popularityScore: story.score / 1000, // Normalize to 0-1 scale
    finalScore: story.score / 1000,
    tags: story.tags,
    metadata: {
      hnId: story.id,
      hnUrl: story.hnUrl,
      score: story.score,
      comments: story.comments,
      time: story.time,
      rank: 0 // Will be set based on order
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      limit = 30,
      category = 'top' // 'top', 'new', 'best'
    } = body

    console.log(`Starting HackerNews aggregation: ${category} stories, limit ${limit}`)

    const client = createHackerNewsClient()
    let stories: ProcessedHNStory[] = []

    // Fetch stories based on category
    switch (category) {
      case 'new':
        const newStoryIds = await client.getNewStories(limit)
        const newStories = await client.getStories(newStoryIds)
        stories = newStories
          .map(story => client.processStory(story))
          .filter(Boolean) as ProcessedHNStory[]
        break
      
      case 'best':
        const bestStoryIds = await client.getBestStories(limit)
        const bestStories = await client.getStories(bestStoryIds)
        stories = bestStories
          .map(story => client.processStory(story))
          .filter(Boolean) as ProcessedHNStory[]
        break
      
      case 'top':
      default:
        stories = await client.getTopStoriesProcessed(limit)
        break
    }

    if (stories.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No stories found',
        stats: { stories_fetched: 0, articles_added: 0 }
      })
    }

    console.log(`Processing ${stories.length} HackerNews stories...`)

    const articlesAdded = []
    const now = new Date()

    // Filter recent and high-quality stories
    const qualityStories = stories.filter(story => {
      const ageHours = (now.getTime() - story.createdAt.getTime()) / (1000 * 60 * 60)
      
      return (
        story.score >= 10 &&           // Minimum score
        ageHours <= 72 &&             // Max 3 days old
        story.title.length > 10 &&     // Meaningful title
        !story.title.toLowerCase().includes('[deleted]') &&
        !story.title.toLowerCase().includes('[dead]')
      )
    })

    console.log(`${qualityStories.length} stories passed quality filter`)

    // Save to Firebase
    for (let i = 0; i < qualityStories.length; i++) {
      const story = qualityStories[i]
      
      try {
        const article = convertHNToArticle(story)
        article.metadata.rank = i + 1 // Add ranking position
        
        const docRef = await addDoc(collection(db, 'articles'), article)
        
        articlesAdded.push({
          id: docRef.id,
          hnId: story.id,
          title: story.title,
          score: story.score,
          comments: story.comments,
          rank: i + 1
        })
        
        console.log(`✅ Added HN story: "${story.title}" (Score: ${story.score}, Comments: ${story.comments})`)
        
      } catch (saveError) {
        console.error(`Failed to save HN story ${story.id}:`, saveError)
      }
    }

    const response = {
      success: true,
      message: `Successfully aggregated HackerNews ${category} stories`,
      stats: {
        category,
        stories_fetched: stories.length,
        stories_after_filtering: qualityStories.length,
        articles_added: articlesAdded.length
      },
      articles_added: articlesAdded.length,
      sample_articles: articlesAdded.slice(0, 3).map(article => ({
        title: article.title.substring(0, 60) + (article.title.length > 60 ? '...' : ''),
        score: article.score,
        comments: article.comments,
        rank: article.rank
      }))
    }

    console.log(`🎉 HackerNews aggregation complete:`, response.stats)
    return NextResponse.json(response)

  } catch (error: any) {
    console.error('HackerNews aggregation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'HackerNews aggregation failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'HackerNews aggregation endpoint is ready',
    description: 'Fetches top stories from HackerNews and adds them to your HUD News feed',
    usage: {
      endpoint: 'POST /api/aggregation/hackernews',
      body: {
        limit: 'number (default: 30, max: 50)',
        category: 'string (top, new, best - default: top)'
      }
    },
    categories: {
      top: 'Top stories ranked by HN algorithm',
      new: 'Newest stories by submission time',
      best: 'Best stories by community vote'
    },
    features: [
      'Automatic quality filtering (min 10 points)',
      'Recency filter (max 3 days old)',
      'Content categorization with smart tags',
      'HN score preservation and ranking',
      'Direct links to HN comments'
    ]
  })
}
