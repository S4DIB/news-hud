import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createContentMix, rankArticles } from '@/utils/ranking'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId')
    
    // Get user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch articles from database
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(`
        *,
        feed_sources!source_id (
          name,
          type
        )
      `)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (articlesError) {
      console.error('Error fetching articles:', articlesError)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }

    // If user ID is provided, personalize the results
    if (userId && userId === user.id) {
      // Fetch user interests
      const { data: userInterests, error: interestsError } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (interestsError) {
        console.error('Error fetching user interests:', interestsError)
        return NextResponse.json({ error: 'Failed to fetch user interests' }, { status: 500 })
      }

      // Fetch user preferences
      const { data: userPreferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (preferencesError) {
        console.error('Error fetching user preferences:', preferencesError)
        return NextResponse.json({ error: 'Failed to fetch user preferences' }, { status: 500 })
      }

      // Rank and mix content based on user preferences
      const rankedArticles = rankArticles(articles || [], userInterests || [])
      const mixedArticles = createContentMix(
        rankedArticles,
        userPreferences?.content_mix_ratio || { interests: 0.7, popular: 0.2, serendipity: 0.1 },
        limit
      )

      return NextResponse.json({
        articles: mixedArticles,
        total: mixedArticles.length,
        personalized: true
      })
    }

    // Return articles without personalization
    return NextResponse.json({
      articles: articles || [],
      total: articles?.length || 0,
      personalized: false
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, url, summary, content, source_name, tags, metadata } = body

    // Insert new article
    const { data: article, error: insertError } = await supabase
      .from('articles')
      .insert({
        title,
        url,
        summary,
        content,
        source_name,
        tags: tags || [],
        metadata: metadata || {},
        published_at: new Date().toISOString(),
        source_id: null // Will need to be updated when source management is implemented
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting article:', insertError)
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
    }

    return NextResponse.json({ article }, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
