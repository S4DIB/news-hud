import { NextResponse } from 'next/server'
import { collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export async function POST() {
  try {
    console.log('🗑️ Clearing old articles and fetching fresh content...')
    
    // Get all articles
    const articlesCollection = collection(db, 'articles')
    const snapshot = await getDocs(articlesCollection)
    
    // Delete old articles in batches
    const batch = writeBatch(db)
    let deleteCount = 0
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
      deleteCount++
    })
    
    if (deleteCount > 0) {
      await batch.commit()
      console.log(`🗑️ Deleted ${deleteCount} old articles`)
    }
    
    // Wait a moment for Firebase to process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Fetch fresh content
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/aggregation/auto`, {
      method: 'POST'
    })
    
    const data = await response.json()
    
    if (data.success) {
      return NextResponse.json({
        success: true,
        message: `Refreshed content! Deleted ${deleteCount} old articles, added ${data.summary.total_articles} fresh articles`,
        old_articles_deleted: deleteCount,
        new_articles_added: data.summary.total_articles,
        sources: data.summary.successful_sources,
        details: data
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch fresh content after clearing old data',
        old_articles_deleted: deleteCount,
        error: data.error
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Refresh error:', error)
    return NextResponse.json({
      success: false,
      error: 'Refresh failed',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Content refresh endpoint',
    description: 'Clears old articles and fetches fresh content from all sources',
    usage: 'POST /api/refresh',
    what_it_does: [
      'Deletes all existing articles from Firebase',
      'Fetches fresh content from Reddit, HackerNews, Twitter, and Newsletters',
      'Ensures you see the latest news, not cached content'
    ]
  })
}
