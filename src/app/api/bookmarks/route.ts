import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    // Get user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('bookmarks')
      .select(`
        *,
        articles (
          id,
          title,
          summary,
          url,
          author,
          source_name,
          published_at,
          tags,
          metadata
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: bookmarks, error: bookmarksError } = await query

    if (bookmarksError) {
      console.error('Error fetching bookmarks:', bookmarksError)
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
    }

    return NextResponse.json({
      bookmarks: bookmarks || [],
      total: bookmarks?.length || 0
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
    const { article_id, category, notes, is_favorite = false } = body

    if (!article_id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    // Check if article exists
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', article_id)
      .single()

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Insert bookmark
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .upsert({
        user_id: user.id,
        article_id,
        category,
        notes,
        is_favorite
      }, {
        onConflict: 'user_id,article_id'
      })
      .select(`
        *,
        articles (
          id,
          title,
          summary,
          url,
          author,
          source_name,
          published_at,
          tags,
          metadata
        )
      `)
      .single()

    if (bookmarkError) {
      console.error('Error creating bookmark:', bookmarkError)
      return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 })
    }

    return NextResponse.json({ bookmark }, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('id')
    const articleId = searchParams.get('article_id')

    if (!bookmarkId && !articleId) {
      return NextResponse.json({ error: 'Bookmark ID or Article ID is required' }, { status: 400 })
    }

    let query = supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)

    if (bookmarkId) {
      query = query.eq('id', bookmarkId)
    } else if (articleId) {
      query = query.eq('article_id', articleId)
    }

    const { error: deleteError } = await query

    if (deleteError) {
      console.error('Error deleting bookmark:', deleteError)
      return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Bookmark deleted successfully' })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
