export interface NewsletterConfig {
  name: string
  type: 'rss' | 'web_scraping' | 'api'
  url: string
  selectors?: {
    title?: string
    content?: string
    link?: string
    date?: string
    author?: string
  }
  rssConfig?: {
    titleField: string
    contentField: string
    linkField: string
    dateField: string
  }
}

export interface NewsletterItem {
  title: string
  content: string
  url: string
  author: string
  publishedAt: Date
  source: string
  summary: string
  tags: string[]
}

// Newsletter configurations
export const NEWSLETTER_CONFIGS: Record<string, NewsletterConfig> = {
  'tldr-ai': {
    name: 'TLDR AI',
    type: 'rss',
    url: 'https://tldr.tech/ai/feed',
    rssConfig: {
      titleField: 'title',
      contentField: 'description',
      linkField: 'link',
      dateField: 'pubDate'
    }
  },
  'rundown-ai': {
    name: 'Rundown AI',
    type: 'rss',
    url: 'https://www.therundown.ai/feed',
    rssConfig: {
      titleField: 'title',
      contentField: 'description',
      linkField: 'link',
      dateField: 'pubDate'
    }
  },
  'ai-news': {
    name: 'AI News',
    type: 'web_scraping',
    url: 'https://artificialintelligence-news.com',
    selectors: {
      title: 'h2.entry-title a',
      content: '.entry-content p',
      link: 'h2.entry-title a',
      date: 'time.entry-date',
      author: '.entry-author'
    }
  }
}

export class NewsletterClient {
  
  async parseRSSFeed(config: NewsletterConfig): Promise<NewsletterItem[]> {
    if (!config.rssConfig) {
      throw new Error('RSS config is required for RSS feeds')
    }

    try {
      console.log(`Fetching RSS feed: ${config.url}`)
      
      // Use a CORS proxy or RSS to JSON service
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(config.url)}`
      
      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`RSS fetch failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 'ok') {
        throw new Error(`RSS parsing failed: ${data.message}`)
      }

      const items: NewsletterItem[] = data.items.map((item: any) => {
        const title = item.title || 'Untitled'
        const content = this.cleanHTMLContent(item.description || item.content || '')
        
        return {
          title,
          content,
          url: item.link || '',
          author: item.author || config.name,
          publishedAt: new Date(item.pubDate || Date.now()),
          source: config.name,
          summary: this.generateSummary(content, title),
          tags: this.generateTags(title, content, config.name)
        }
      })

      console.log(`Parsed ${items.length} items from ${config.name}`)
      return items.slice(0, 10) // Limit to recent items

    } catch (error) {
      console.error(`Failed to parse RSS feed for ${config.name}:`, error)
      return []
    }
  }

  async scrapeWebsite(config: NewsletterConfig): Promise<NewsletterItem[]> {
    // For web scraping, we'd need a server-side scraping service
    // This is a placeholder that returns sample data
    console.log(`Web scraping not implemented for ${config.name}`)
    
    // Return some sample AI News items as fallback
    if (config.name === 'AI News') {
      return [
        {
          title: 'Latest AI breakthroughs in machine learning',
          content: 'Recent developments in AI technology are showing promising results...',
          url: 'https://artificialintelligence-news.com/sample',
          author: 'AI News Team',
          publishedAt: new Date(),
          source: 'AI News',
          summary: 'Overview of recent AI breakthroughs and their implications',
          tags: ['ai', 'machine-learning', 'technology', 'research']
        }
      ]
    }
    
    return []
  }

  cleanHTMLContent(html: string): string {
    return html
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

  generateSummary(content: string, title: string): string {
    if (content.length > 200) {
      return content.substring(0, 197) + '...'
    }
    
    if (content.length < 50 && title) {
      return `${title} - ${content}`
    }
    
    return content || 'Newsletter update'
  }

  generateTags(title: string, content: string, source: string): string[] {
    const tags = ['newsletter']
    
    // Add source-specific tags
    if (source.toLowerCase().includes('ai')) {
      tags.push('ai', 'artificial-intelligence')
    }
    
    const text = `${title} ${content}`.toLowerCase()
    
    // AI/ML terms
    if (text.match(/\b(machine learning|ml|deep learning|neural|gpt|llm|openai|anthropic|chatgpt)\b/)) {
      tags.push('machine-learning')
    }
    
    // Tech terms
    if (text.match(/\b(startup|funding|ipo|acquisition|vc|venture capital)\b/)) {
      tags.push('startup', 'business')
    }
    
    // Programming
    if (text.match(/\b(programming|coding|developer|software|api|framework)\b/)) {
      tags.push('programming', 'development')
    }
    
    // Research
    if (text.match(/\b(research|study|paper|university|academia|science)\b/)) {
      tags.push('research', 'science')
    }
    
    // Industry
    if (text.match(/\b(tech|technology|innovation|industry|enterprise)\b/)) {
      tags.push('technology', 'industry')
    }
    
    return [...new Set(tags)].slice(0, 5)
  }

  async getNewsletterContent(newsletterKey: string): Promise<NewsletterItem[]> {
    const config = NEWSLETTER_CONFIGS[newsletterKey]
    if (!config) {
      throw new Error(`Unknown newsletter: ${newsletterKey}`)
    }

    switch (config.type) {
      case 'rss':
        return await this.parseRSSFeed(config)
      
      case 'web_scraping':
        return await this.scrapeWebsite(config)
      
      default:
        throw new Error(`Unsupported newsletter type: ${config.type}`)
    }
  }

  async getAllNewsletters(): Promise<NewsletterItem[]> {
    const allItems: NewsletterItem[] = []
    
    for (const [key, config] of Object.entries(NEWSLETTER_CONFIGS)) {
      try {
        console.log(`Fetching ${config.name}...`)
        const items = await this.getNewsletterContent(key)
        allItems.push(...items)
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to fetch ${config.name}:`, error)
      }
    }

    // Sort by published date, most recent first
    return allItems.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }

  calculateNewsletterScore(item: NewsletterItem): number {
    // Score based on recency and content quality
    const ageHours = (Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60)
    const recencyScore = Math.max(0, 1 - (ageHours / 168)) // Decay over 1 week
    
    // Content quality indicators
    const hasSubstantialContent = item.content.length > 100 ? 0.3 : 0
    const hasGoodTitle = item.title.length > 20 ? 0.2 : 0
    const hasURL = item.url.length > 0 ? 0.1 : 0
    
    // Source credibility (newsletters are generally high quality)
    const sourceScore = 0.4
    
    return Math.min(recencyScore + hasSubstantialContent + hasGoodTitle + hasURL + sourceScore, 1)
  }
}

export const createNewsletterClient = () => {
  return new NewsletterClient()
}
