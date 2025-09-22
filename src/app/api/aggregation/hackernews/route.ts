import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface HackerNewsItem {
  id: number
  title: string
  url?: string
  score: number
  by: string
  time: number
  descendants?: number
  text?: string
  type: string
}

async function fetchHackerNewsItem(id: number): Promise<HackerNewsItem | null> {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Error fetching HN item ${id}:`, error)
    return null
  }
}

async function fetchHackerNewsStories(type: 'top' | 'new' | 'best' = 'top', limit: number = 50): Promise<HackerNewsItem[]> {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/${type}stories.json`)
    if (!response.ok) return []
    
    const storyIds: number[] = await response.json()
    const limitedIds = storyIds.slice(0, limit)
    
    // Fetch stories in parallel
    const storyPromises = limitedIds.map(id => fetchHackerNewsItem(id))
    const stories = await Promise.all(storyPromises)
    
    // Filter out null results and non-story items
    return stories.filter((story): story is HackerNewsItem => 
      story !== null && 
      story.type === 'story' && 
      story.title && 
      story.url
    )
  } catch (error) {
    console.error('Error fetching HackerNews stories:', error)
    return []
  }
}

function normalizeHackerNewsArticle(item: HackerNewsItem, sourceId: string) {
  return {
    title: item.title,
    url: item.url!,
    author: item.by,
    source_id: sourceId,
    source_name: 'HackerNews',
    published_at: new Date(item.time * 1000).toISOString(),
    popularity_score: Math.min(item.score / 1000, 1), // Normalize score
    relevance_score: 0.5, // Default relevance, will be calculated by AI
    final_score: 0.5, // Will be calculated by database trigger
    tags: ['tech', 'hackernews'],
    metadata: {
      score: item.score,
      comments: item.descendants || 0,
      hn_id: item.id,
      author: item.by
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check if this is an authenticated admin request (in production, you'd want proper auth)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const body = await request.json()
    const { type = 'top', limit = 50 } = body

    // Get HackerNews source from database
    const { data: source, error: sourceError } = await supabase
      .from('feed_sources')
      .select('id')
      .eq('name', 'HackerNews Top Stories')
      .single()

    if (sourceError || !source) {
      console.error('HackerNews source not found:', sourceError)
      return NextResponse.json({ error: 'Source not configured' }, { status: 404 })
    }

    // Fetch stories from HackerNews
    const stories = await fetchHackerNewsStories(type as 'top' | 'new' | 'best', limit)
    
    if (stories.length === 0) {
      return NextResponse.json({ message: 'No stories found', articles: [] })
    }

    // Normalize articles for database insertion
    const articles = stories.map(story => normalizeHackerNewsArticle(story, source.id))

    // Insert articles into database (ignore duplicates based on URL)
    const { data: insertedArticles, error: insertError } = await supabase
      .from('articles')
      .upsert(articles, { 
        onConflict: 'url',
        ignoreDuplicates: true 
      })
      .select()

    if (insertError) {
      console.error('Error inserting HackerNews articles:', insertError)
      return NextResponse.json({ error: 'Failed to save articles' }, { status: 500 })
    }

    return NextResponse.json({
      message: `Successfully aggregated ${insertedArticles?.length || 0} HackerNews articles`,
      articles: insertedArticles || [],
      source: 'hackernews',
      type
    })

  } catch (error) {
    console.error('HackerNews aggregation error:', error)
    return NextResponse.json({ error: 'Aggregation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'top'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Fetch and return stories without saving to database
    const stories = await fetchHackerNewsStories(type as 'top' | 'new' | 'best', limit)
    
    return NextResponse.json({
      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        url: story.url,
        score: story.score,
        author: story.by,
        comments: story.descendants || 0,
        time: new Date(story.time * 1000).toISOString()
      })),
      total: stories.length,
      type
    })

  } catch (error) {
    console.error('HackerNews fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}
