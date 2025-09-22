export interface HackerNewsItem {
  id: number
  deleted?: boolean
  type?: 'job' | 'story' | 'comment' | 'poll' | 'pollopt'
  by?: string
  time?: number
  text?: string
  dead?: boolean
  parent?: number
  poll?: number
  kids?: number[]
  url?: string
  score?: number
  title?: string
  parts?: number[]
  descendants?: number
}

export interface ProcessedHNStory {
  id: number
  title: string
  url: string
  author: string
  score: number
  comments: number
  time: number
  createdAt: Date
  summary: string
  tags: string[]
  hnUrl: string
}

export class HackerNewsClient {
  private baseUrl = 'https://hacker-news.firebaseio.com/v0'

  async getItem(id: number): Promise<HackerNewsItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/item/${id}.json`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error(`Failed to fetch HN item ${id}:`, error)
      return null
    }
  }

  async getTopStories(limit: number = 50): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/topstories.json`)
      if (!response.ok) return []
      const storyIds = await response.json()
      return storyIds.slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch HN top stories:', error)
      return []
    }
  }

  async getNewStories(limit: number = 50): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/newstories.json`)
      if (!response.ok) return []
      const storyIds = await response.json()
      return storyIds.slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch HN new stories:', error)
      return []
    }
  }

  async getBestStories(limit: number = 50): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/beststories.json`)
      if (!response.ok) return []
      const storyIds = await response.json()
      return storyIds.slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch HN best stories:', error)
      return []
    }
  }

  async getStories(storyIds: number[]): Promise<HackerNewsItem[]> {
    const stories = []
    
    // Batch requests to avoid overwhelming the API
    for (let i = 0; i < storyIds.length; i += 10) {
      const batch = storyIds.slice(i, i + 10)
      const batchPromises = batch.map(id => this.getItem(id))
      const batchResults = await Promise.all(batchPromises)
      
      stories.push(...batchResults.filter(Boolean) as HackerNewsItem[])
      
      // Small delay between batches
      if (i + 10 < storyIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return stories
  }

  generateSummary(story: HackerNewsItem): string {
    if (story.text) {
      // Remove HTML tags and clean up text
      const cleanText = story.text
        .replace(/<[^>]*>/g, '')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#x27;/g, "'")
        .trim()
      
      if (cleanText.length > 200) {
        return cleanText.substring(0, 197) + '...'
      }
      return cleanText
    }
    
    // Fallback to title-based summary
    if (story.title) {
      return `HackerNews discussion: ${story.title}`
    }
    
    return 'HackerNews story'
  }

  generateTags(story: HackerNewsItem): string[] {
    const tags = ['hackernews', 'tech']
    
    if (!story.title) return tags
    
    const title = story.title.toLowerCase()
    
    // AI/ML related
    if (title.match(/\b(ai|artificial intelligence|machine learning|ml|deep learning|neural|gpt|llm|openai|chatgpt)\b/)) {
      tags.push('ai', 'machine-learning')
    }
    
    // Programming languages
    if (title.match(/\b(javascript|js|typescript|ts|python|rust|go|java|c\+\+|swift|kotlin)\b/)) {
      tags.push('programming')
    }
    
    // Web development
    if (title.match(/\b(react|vue|angular|nextjs|web|frontend|backend|api|framework)\b/)) {
      tags.push('web-development')
    }
    
    // Startup/business
    if (title.match(/\b(startup|ipo|funding|acquisition|vc|venture|business|company)\b/)) {
      tags.push('startup', 'business')
    }
    
    // Security
    if (title.match(/\b(security|hack|breach|vulnerability|crypto|encryption)\b/)) {
      tags.push('security', 'cybersecurity')
    }
    
    // Open source
    if (title.match(/\b(open source|opensource|github|git|linux|unix)\b/)) {
      tags.push('open-source')
    }
    
    // Cloud/Infrastructure
    if (title.match(/\b(aws|azure|google cloud|cloud|docker|kubernetes|devops)\b/)) {
      tags.push('cloud', 'infrastructure')
    }
    
    return tags.slice(0, 5) // Limit to 5 tags
  }

  processStory(story: HackerNewsItem): ProcessedHNStory | null {
    if (!story.title || !story.id) return null
    
    const createdAt = story.time ? new Date(story.time * 1000) : new Date()
    const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`
    
    return {
      id: story.id,
      title: story.title,
      url: story.url || hnUrl,
      author: story.by || 'unknown',
      score: story.score || 0,
      comments: story.descendants || 0,
      time: story.time || 0,
      createdAt,
      summary: this.generateSummary(story),
      tags: this.generateTags(story),
      hnUrl
    }
  }

  async getTopStoriesProcessed(limit: number = 30): Promise<ProcessedHNStory[]> {
    console.log(`Fetching top ${limit} HackerNews stories...`)
    
    const storyIds = await this.getTopStories(limit)
    if (storyIds.length === 0) return []
    
    console.log(`Got ${storyIds.length} story IDs, fetching details...`)
    
    const stories = await this.getStories(storyIds)
    const processedStories = stories
      .map(story => this.processStory(story))
      .filter(Boolean) as ProcessedHNStory[]
    
    console.log(`Processed ${processedStories.length} stories`)
    
    // Sort by score (HN's algorithm already handles recency)
    return processedStories.sort((a, b) => b.score - a.score)
  }

  calculateStoryScore(story: ProcessedHNStory): number {
    // HackerNews scoring algorithm approximation
    const ageHours = (Date.now() - story.createdAt.getTime()) / (1000 * 60 * 60)
    const gravity = 1.8 // HN uses ~1.8
    
    // Score decays with time
    const scoreDecay = story.score / Math.pow(ageHours + 2, gravity)
    
    // Comment engagement bonus
    const commentBonus = Math.min(story.comments / 100, 0.3)
    
    // Normalize to 0-1 scale
    const normalizedScore = Math.min((scoreDecay + commentBonus) / 100, 1)
    
    return normalizedScore
  }
}

export const createHackerNewsClient = () => {
  return new HackerNewsClient()
}
