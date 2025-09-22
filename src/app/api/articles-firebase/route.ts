import { NextRequest, NextResponse } from 'next/server'
import { getArticles, addArticle } from '@/lib/firebase/firestore'
import { getCurrentUser } from '@/lib/firebase/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Get articles from Firebase
    const articles = await getArticles(limit)
    
    return NextResponse.json({
      articles,
      total: articles.length,
      source: 'firebase'
    })

  } catch (error: any) {
    console.error('Firebase API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles', details: error.message }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, url, summary, content, source_name, tags, metadata } = body

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' }, 
        { status: 400 }
      )
    }

    const articleData = {
      title,
      url,
      summary: summary || '',
      content: content || '',
      author: body.author || '',
      source_id: body.source_id || '',
      source_name: source_name || 'Manual',
      published_at: new Date().toISOString(),
      scraped_at: new Date().toISOString(),
      popularity_score: 0.5,
      relevance_score: 0.5,
      final_score: 0.5,
      tags: tags || [],
      metadata: metadata || {}
    }

    const articleId = await addArticle(articleData)

    return NextResponse.json({ 
      id: articleId,
      message: 'Article created successfully' 
    }, { status: 201 })

  } catch (error: any) {
    console.error('Firebase API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create article', details: error.message }, 
      { status: 500 }
    )
  }
}
