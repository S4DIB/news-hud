import { Article, UserInterest } from '@/types'

export interface RankingConfig {
  recencyWeight: number
  popularityWeight: number
  relevanceWeight: number
  sourceCredibilityWeight: number
}

export const defaultRankingConfig: RankingConfig = {
  recencyWeight: 0.3,
  popularityWeight: 0.25,
  relevanceWeight: 0.35,
  sourceCredibilityWeight: 0.1
}

export function calculateRecencyScore(publishedAt: string): number {
  const now = new Date()
  const published = new Date(publishedAt)
  const hoursSincePublished = (now.getTime() - published.getTime()) / (1000 * 60 * 60)
  
  // Exponential decay: newer articles get higher scores
  // Articles published in the last hour get score close to 1
  // Articles published 24 hours ago get score around 0.5
  // Articles published 48 hours ago get score around 0.25
  return Math.exp(-hoursSincePublished / 24)
}

export function calculatePopularityScore(metadata: Record<string, any>): number {
  const score = metadata.score || 0
  const comments = metadata.comments || 0
  const shares = metadata.shares || 0
  const likes = metadata.likes || 0
  
  // Normalize and combine different engagement metrics
  // This is a simplified scoring system - you might want to make it more sophisticated
  const normalizedScore = Math.min(score / 1000, 1) // Normalize score to 0-1
  const normalizedComments = Math.min(comments / 100, 1) // Normalize comments to 0-1
  const normalizedShares = Math.min(shares / 50, 1) // Normalize shares to 0-1
  const normalizedLikes = Math.min(likes / 500, 1) // Normalize likes to 0-1
  
  return (normalizedScore * 0.4 + normalizedComments * 0.3 + normalizedShares * 0.2 + normalizedLikes * 0.1)
}

export function calculateRelevanceScore(
  article: Article,
  userInterests: UserInterest[]
): number {
  if (userInterests.length === 0) return 0.5 // Default score if no interests

  let maxRelevance = 0
  const articleText = `${article.title} ${article.content || ''} ${article.summary || ''}`.toLowerCase()
  
  for (const interest of userInterests) {
    if (!interest.is_active) continue
    
    let relevanceScore = 0
    for (const keyword of interest.keywords) {
      const keywordLower = keyword.toLowerCase()
      // Count occurrences of keyword in article text
      const occurrences = (articleText.match(new RegExp(keywordLower, 'g')) || []).length
      relevanceScore += occurrences > 0 ? Math.min(occurrences / 5, 1) : 0
    }
    
    // Apply interest weight
    relevanceScore = (relevanceScore / interest.keywords.length) * interest.weight
    maxRelevance = Math.max(maxRelevance, relevanceScore)
  }
  
  return Math.min(maxRelevance, 1)
}

export function calculateSourceCredibilityScore(sourceName: string): number {
  // Source credibility mapping - you can expand this based on your needs
  const credibilityMap: Record<string, number> = {
    'hackernews': 0.9,
    'reddit': 0.7,
    'twitter': 0.6,
    'rundownai': 0.85,
    'tldr': 0.8,
    'ai-news': 0.75
  }
  
  return credibilityMap[sourceName.toLowerCase()] || 0.5 // Default credibility
}

export function calculateFinalScore(
  article: Article,
  userInterests: UserInterest[],
  config: RankingConfig = defaultRankingConfig
): number {
  const recencyScore = calculateRecencyScore(article.published_at)
  const popularityScore = calculatePopularityScore(article.metadata)
  const relevanceScore = calculateRelevanceScore(article, userInterests)
  const credibilityScore = calculateSourceCredibilityScore(article.source_name)
  
  const finalScore = 
    recencyScore * config.recencyWeight +
    popularityScore * config.popularityWeight +
    relevanceScore * config.relevanceWeight +
    credibilityScore * config.sourceCredibilityWeight
  
  return Math.min(finalScore, 1)
}

export function rankArticles(
  articles: Article[],
  userInterests: UserInterest[],
  config: RankingConfig = defaultRankingConfig
): Article[] {
  return articles
    .map(article => ({
      ...article,
      final_score: calculateFinalScore(article, userInterests, config)
    }))
    .sort((a, b) => b.final_score - a.final_score)
}

export function createContentMix(
  articles: Article[],
  mixRatio: { interests: number; popular: number; serendipity: number },
  limit: number = 50
): Article[] {
  const rankedArticles = articles.sort((a, b) => b.final_score - a.final_score)
  const popularArticles = articles.sort((a, b) => b.popularity_score - a.popularity_score)
  const randomArticles = [...articles].sort(() => Math.random() - 0.5)
  
  const interestCount = Math.floor(limit * mixRatio.interests)
  const popularCount = Math.floor(limit * mixRatio.popular)
  const serendipityCount = limit - interestCount - popularCount
  
  const mixed: Article[] = []
  const usedIds = new Set<string>()
  
  // Add interest-based articles
  for (let i = 0; i < interestCount && i < rankedArticles.length; i++) {
    if (!usedIds.has(rankedArticles[i].id)) {
      mixed.push(rankedArticles[i])
      usedIds.add(rankedArticles[i].id)
    }
  }
  
  // Add popular articles
  for (let i = 0; i < popularCount && i < popularArticles.length; i++) {
    if (!usedIds.has(popularArticles[i].id)) {
      mixed.push(popularArticles[i])
      usedIds.add(popularArticles[i].id)
    }
  }
  
  // Add serendipity articles
  for (let i = 0; i < serendipityCount && i < randomArticles.length; i++) {
    if (!usedIds.has(randomArticles[i].id)) {
      mixed.push(randomArticles[i])
      usedIds.add(randomArticles[i].id)
    }
  }
  
  // Shuffle the final mix to avoid predictable patterns
  return mixed.sort(() => Math.random() - 0.5)
}
