import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { createNewsletterClient, NewsletterItem, NEWSLETTER_CONFIGS } from '@/lib/newsletters/client'

function convertNewsletterToArticle(item: NewsletterItem, score: number) {
  return {
    title: item.title,
    summary: item.summary,
    url: item.url,
    author: item.author,
    sourceName: item.source,
    publishedAt: Timestamp.fromDate(item.publishedAt),
    popularityScore: score,
    finalScore: score,
    tags: item.tags,
    metadata: {
      newsletterSource: item.source,
      contentLength: item.content.length,
      originalContent: item.content.substring(0, 500) // Store first 500 chars
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      newsletters = Object.keys(NEWSLETTER_CONFIGS), // Default to all newsletters
      maxItemsPerNewsletter = 5
    } = body

    console.log(`Starting newsletter aggregation for: ${newsletters.join(', ')}`)

    const client = createNewsletterClient()
    const articlesAdded = []
    let totalItems = 0

    for (const newsletterKey of newsletters) {
      try {
        if (!NEWSLETTER_CONFIGS[newsletterKey]) {
          console.log(`⚠️ Unknown newsletter: ${newsletterKey}`)
          continue
        }

        console.log(`Fetching ${NEWSLETTER_CONFIGS[newsletterKey].name}...`)
        
        const items = await client.getNewsletterContent(newsletterKey)
        
        if (items.length === 0) {
          console.log(`📭 No items found for ${NEWSLETTER_CONFIGS[newsletterKey].name}`)
          continue
        }

        totalItems += items.length

        // Take only the most recent items
        const recentItems = items.slice(0, maxItemsPerNewsletter)
        
        console.log(`📊 ${NEWSLETTER_CONFIGS[newsletterKey].name}: ${items.length} items → ${recentItems.length} selected`)

        // Process and save to Firebase
        for (const item of recentItems) {
          try {
            const score = client.calculateNewsletterScore(item)
            const article = convertNewsletterToArticle(item, score)

            const docRef = await addDoc(collection(db, 'articles'), article)
            
            articlesAdded.push({
              id: docRef.id,
              newsletter: item.source,
              title: item.title.substring(0, 60) + (item.title.length > 60 ? '...' : ''),
              score: score,
              publishedAt: item.publishedAt.toISOString()
            })

            console.log(`✅ Added ${item.source}: "${item.title.substring(0, 50)}..." (Score: ${score.toFixed(2)})`)
          } catch (saveError) {
            console.error(`Failed to save newsletter item:`, saveError)
          }
        }

        // Small delay between newsletters
        await new Promise(resolve => setTimeout(resolve, 1500))

      } catch (newsletterError) {
        console.error(`Error processing newsletter ${newsletterKey}:`, newsletterError)
        continue
      }
    }

    const response = {
      success: true,
      message: `Successfully aggregated newsletter content`,
      stats: {
        newsletters_processed: newsletters.length,
        total_items_fetched: totalItems,
        articles_added: articlesAdded.length
      },
      articles_added: articlesAdded.length,
      newsletters_attempted: newsletters.map(key => ({
        key,
        name: NEWSLETTER_CONFIGS[key]?.name || 'Unknown',
        type: NEWSLETTER_CONFIGS[key]?.type || 'Unknown'
      })),
      sample_articles: articlesAdded.slice(0, 3).map(article => ({
        newsletter: article.newsletter,
        title: article.title,
        score: article.score
      }))
    }

    console.log(`🎉 Newsletter aggregation complete:`, response.stats)
    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Newsletter aggregation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Newsletter aggregation failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Newsletter aggregation endpoint is ready',
    description: 'Fetches content from AI and tech newsletters',
    available_newsletters: Object.entries(NEWSLETTER_CONFIGS).map(([key, config]) => ({
      key,
      name: config.name,
      type: config.type,
      url: config.url
    })),
    usage: {
      endpoint: 'POST /api/aggregation/newsletters',
      body: {
        newsletters: 'array of newsletter keys (optional, defaults to all)',
        maxItemsPerNewsletter: 'number (default: 5)'
      }
    },
    supported_newsletters: {
      'tldr-ai': {
        name: 'TLDR AI',
        description: 'AI and tech news summaries',
        type: 'RSS feed'
      },
      'rundown-ai': {
        name: 'Rundown AI',
        description: 'Daily AI news and insights',
        type: 'RSS feed'
      },
      'ai-news': {
        name: 'AI News',
        description: 'Artificial intelligence industry news',
        type: 'Web scraping (sample data)'
      }
    },
    features: [
      'RSS feed parsing for TLDR AI and Rundown AI',
      'Content cleaning and HTML tag removal',
      'Smart tagging based on content analysis',
      'Automatic summary generation',
      'Quality scoring based on recency and content'
    ],
    limitations: [
      'Web scraping requires server-side implementation',
      'Some newsletters may require API keys or subscriptions',
      'Rate limiting may apply to external RSS services'
    ]
  })
}
