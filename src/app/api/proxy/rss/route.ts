import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rssUrl = searchParams.get('url')

    if (!rssUrl) {
      return NextResponse.json(
        { error: 'RSS URL parameter is required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Proxying RSS request: ${rssUrl}`)

    // Fetch the RSS feed
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsletterBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`)
    }

    const rssContent = await response.text()
    
    // Convert RSS to JSON using a simple parser
    const jsonData = parseRSSToJSON(rssContent)

    console.log(`✅ RSS proxy successful: ${rssUrl} (${jsonData.items?.length || 0} items)`)
    
    return NextResponse.json(jsonData)

  } catch (error: any) {
    console.error('❌ RSS proxy error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch RSS feed',
        details: error.message,
        status: 'error'
      },
      { status: 500 }
    )
  }
}

function parseRSSToJSON(rssContent: string) {
  try {
    // Simple RSS to JSON parser
    const items: any[] = []
    
    // Extract items using regex (basic parsing)
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
    let match
    
    while ((match = itemRegex.exec(rssContent)) !== null) {
      const itemContent = match[1]
      
      const title = extractTagContent(itemContent, 'title')
      const description = extractTagContent(itemContent, 'description')
      const link = extractTagContent(itemContent, 'link')
      const pubDate = extractTagContent(itemContent, 'pubDate')
      const author = extractTagContent(itemContent, 'author') || extractTagContent(itemContent, 'dc:creator')
      
      if (title && link) {
        items.push({
          title: cleanText(title),
          description: cleanText(description),
          content: cleanText(description),
          link: link,
          pubDate: pubDate,
          author: cleanText(author)
        })
      }
    }
    
    return {
      status: 'ok',
      items: items.slice(0, 10) // Limit to 10 items
    }
    
  } catch (error) {
    console.error('RSS parsing error:', error)
    return {
      status: 'error',
      message: 'Failed to parse RSS content',
      items: []
    }
  }
}

function extractTagContent(content: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

function cleanText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
