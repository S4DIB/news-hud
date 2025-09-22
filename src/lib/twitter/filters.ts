import { TwitterTweet, TwitterUser, ProcessedTweet } from './types'

export interface TwitterFilterConfig {
  minLikes: number
  minRetweets: number
  maxAgeHours: number
  excludeReplies: boolean
  excludeRetweets: boolean
  minTextLength: number
  requireUrls: boolean
  techKeywords: string[]
}

export const defaultTwitterFilters: TwitterFilterConfig = {
  minLikes: 10,
  minRetweets: 5,
  maxAgeHours: 24,
  excludeReplies: true,
  excludeRetweets: false,
  minTextLength: 50,
  requireUrls: false,
  techKeywords: [
    'AI', 'ML', 'artificial intelligence', 'machine learning', 'deep learning',
    'startup', 'tech', 'software', 'programming', 'development', 'coding',
    'blockchain', 'crypto', 'web3', 'NFT', 'metaverse',
    'cloud', 'AWS', 'Azure', 'Google Cloud', 'DevOps',
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python',
    'API', 'database', 'microservices', 'architecture',
    'cybersecurity', 'data science', 'analytics', 'automation',
    'IoT', 'edge computing', 'quantum', 'robotics',
    'SaaS', 'B2B', 'enterprise', 'productivity', 'workflow'
  ]
}

export function cleanTweetText(text: string): string {
  return text
    // Remove t.co links
    .replace(/https:\/\/t\.co\/\w+/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim()
}

export function extractTweetTopics(tweet: TwitterTweet): string[] {
  const topics: string[] = []
  
  if (tweet.context_annotations) {
    for (const annotation of tweet.context_annotations) {
      if (annotation.entity?.name) {
        topics.push(annotation.entity.name)
      }
      if (annotation.domain?.name) {
        topics.push(annotation.domain.name)
      }
    }
  }
  
  return [...new Set(topics)] // Remove duplicates
}

export function extractHashtags(tweet: TwitterTweet): string[] {
  if (!tweet.entities?.hashtags) return []
  return tweet.entities.hashtags.map(tag => tag.tag)
}

export function extractLinks(tweet: TwitterTweet): Array<{ url: string, title?: string, description?: string }> {
  if (!tweet.entities?.urls) return []
  
  return tweet.entities.urls.map(url => ({
    url: url.expanded_url || url.url,
    title: url.title,
    description: url.description
  }))
}

export function calculateTweetScore(tweet: TwitterTweet, user: TwitterUser, config: TwitterFilterConfig): number {
  const metrics = tweet.public_metrics
  if (!metrics) return 0

  // Base engagement score (0-1)
  const engagement = metrics.like_count + (metrics.retweet_count * 2) + metrics.reply_count
  const engagementScore = Math.min(engagement / 1000, 1)

  // Recency score (0-1)
  const ageHours = (Date.now() - new Date(tweet.created_at).getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(0, 1 - (ageHours / 48)) // Decay over 48 hours

  // User credibility score (0-1)
  const followerCount = user.public_metrics?.followers_count || 0
  const credibilityScore = Math.min(followerCount / 1000000, 1) // Max at 1M followers
  const verifiedBonus = user.verified ? 0.2 : 0

  // Tech relevance score (0-1)
  const text = tweet.text.toLowerCase()
  const relevantKeywords = config.techKeywords.filter(keyword => 
    text.includes(keyword.toLowerCase())
  )
  const relevanceScore = Math.min(relevantKeywords.length / 5, 1)

  // Combined score
  const finalScore = (
    engagementScore * 0.3 +
    recencyScore * 0.2 +
    (credibilityScore + verifiedBonus) * 0.3 +
    relevanceScore * 0.2
  )

  return Math.min(finalScore, 1)
}

export function filterTweets(tweets: TwitterTweet[], user: TwitterUser, config: TwitterFilterConfig = defaultTwitterFilters): TwitterTweet[] {
  return tweets.filter(tweet => {
    // Age filter
    const ageHours = (Date.now() - new Date(tweet.created_at).getTime()) / (1000 * 60 * 60)
    if (ageHours > config.maxAgeHours) return false

    // Text length filter
    const cleanText = cleanTweetText(tweet.text)
    if (cleanText.length < config.minTextLength) return false

    // Engagement filters
    const metrics = tweet.public_metrics
    if (metrics) {
      if (metrics.like_count < config.minLikes) return false
      if (metrics.retweet_count < config.minRetweets) return false
    }

    // Reply filter
    if (config.excludeReplies && tweet.text.startsWith('@')) return false

    // URL requirement
    if (config.requireUrls && !tweet.entities?.urls?.length) return false

    return true
  })
}

export function processTweet(tweet: TwitterTweet, user: TwitterUser, config: TwitterFilterConfig = defaultTwitterFilters): ProcessedTweet {
  const cleanText = cleanTweetText(tweet.text)
  const topics = extractTweetTopics(tweet)
  const hashtags = extractHashtags(tweet)
  const links = extractLinks(tweet)
  const score = calculateTweetScore(tweet, user, config)

  return {
    id: tweet.id,
    text: tweet.text,
    cleanText,
    author: {
      id: user.id,
      name: user.name,
      username: user.username,
      profileImage: user.profile_image_url,
      verified: user.verified
    },
    url: `https://twitter.com/${user.username}/status/${tweet.id}`,
    createdAt: tweet.created_at,
    engagement: {
      likes: tweet.public_metrics?.like_count || 0,
      retweets: tweet.public_metrics?.retweet_count || 0,
      replies: tweet.public_metrics?.reply_count || 0,
      quotes: tweet.public_metrics?.quote_count || 0,
      total: (tweet.public_metrics?.like_count || 0) + 
             (tweet.public_metrics?.retweet_count || 0) + 
             (tweet.public_metrics?.reply_count || 0) + 
             (tweet.public_metrics?.quote_count || 0)
    },
    topics,
    hashtags,
    links,
    score
  }
}
