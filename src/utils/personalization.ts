import { UserProfile } from '@/lib/firebase/auth'

interface Article {
  id: string
  title: string
  summary?: string
  tags: string[]
  finalScore: number
  popularityScore: number
  publishedAt: any
  sourceName: string
}

/**
 * Calculates how relevant an article is to a user's interests
 * @param article - The article to score
 * @param userInterests - Array of user's interest topics
 * @returns Score between 0 and 1 (higher = more relevant)
 */
export function calculateRelevanceScore(article: Article, userInterests: string[]): number {
  if (!userInterests || userInterests.length === 0) {
    return 0.5 // Neutral score if no interests set
  }

  const articleText = `${article.title} ${article.summary || ''} ${article.tags?.join(' ') || ''}`.toLowerCase()
  
  let totalRelevance = 0
  let matchingInterests = 0

  for (const interest of userInterests) {
    const interestKeywords = generateKeywordsForTopic(interest)
    let interestScore = 0

    for (const keyword of interestKeywords) {
      if (articleText.includes(keyword.toLowerCase())) {
        // Weight matches by keyword importance
        const weight = keyword === interest.toLowerCase() ? 1.0 : 0.5
        interestScore += weight
      }
    }

    if (interestScore > 0) {
      matchingInterests++
      totalRelevance += Math.min(interestScore, 1.0) // Cap individual interest score at 1.0
    }
  }

  // Calculate final score: average relevance of matching interests
  if (matchingInterests === 0) return 0.1 // Very low but not zero for diversity
  
  const averageRelevance = totalRelevance / matchingInterests
  const coverageBonus = Math.min(matchingInterests / userInterests.length, 1.0) * 0.2 // Bonus for broad coverage
  
  return Math.min(averageRelevance + coverageBonus, 1.0)
}

/**
 * Generate keywords for a topic to improve matching
 */
function generateKeywordsForTopic(topic: string): string[] {
  const keywordMap: Record<string, string[]> = {
    // Technology
    'Artificial Intelligence': ['ai', 'artificial intelligence', 'machine learning', 'neural networks', 'deep learning', 'llm', 'gpt', 'openai', 'chatgpt'],
    'Machine Learning': ['ml', 'machine learning', 'data science', 'algorithms', 'tensorflow', 'pytorch', 'ai', 'neural'],
    'Programming': ['programming', 'coding', 'software', 'development', 'javascript', 'python', 'react', 'nodejs', 'github'],
    'Web Development': ['web development', 'frontend', 'backend', 'html', 'css', 'javascript', 'react', 'vue', 'angular'],
    'Mobile Development': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'app development'],
    'DevOps': ['devops', 'docker', 'kubernetes', 'ci/cd', 'aws', 'cloud', 'deployment', 'infrastructure'],
    'Cybersecurity': ['cybersecurity', 'security', 'hacking', 'privacy', 'encryption', 'vulnerability', 'malware'],
    'Blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3', 'defi', 'nft', 'smart contracts'],
    'Cloud Computing': ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'microservices', 'saas'],
    'Data Science': ['data science', 'analytics', 'big data', 'statistics', 'visualization', 'pandas', 'numpy'],

    // Business
    'Startups': ['startup', 'entrepreneur', 'venture capital', 'vc', 'funding', 'unicorn', 'ipo', 'founder'],
    'Entrepreneurship': ['entrepreneur', 'business', 'startup', 'founder', 'innovation', 'leadership'],
    'Finance': ['finance', 'investment', 'banking', 'fintech', 'money', 'economy', 'market'],
    'Investing': ['investing', 'stocks', 'portfolio', 'dividend', 'bonds', 'etf', 'trading'],
    'Marketing': ['marketing', 'advertising', 'branding', 'seo', 'social media', 'content marketing'],
    'Cryptocurrency': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'web3', 'trading'],

    // Science
    'Space': ['space', 'nasa', 'spacex', 'astronomy', 'mars', 'rocket', 'satellite', 'universe'],
    'Physics': ['physics', 'quantum', 'relativity', 'particle', 'energy', 'mechanics'],
    'Biology': ['biology', 'genetics', 'dna', 'evolution', 'medical', 'research'],
    'Climate Change': ['climate', 'environment', 'global warming', 'sustainability', 'renewable energy'],
    'Medical Research': ['medical', 'health', 'research', 'medicine', 'clinical', 'treatment', 'disease'],

    // Lifestyle
    'Gaming': ['gaming', 'games', 'video games', 'esports', 'steam', 'xbox', 'playstation'],
    'Health & Fitness': ['health', 'fitness', 'exercise', 'nutrition', 'wellness', 'workout'],
    'Travel': ['travel', 'tourism', 'vacation', 'adventure', 'destination', 'hotel'],
    'Food': ['food', 'cooking', 'recipe', 'restaurant', 'cuisine', 'chef'],

    // News & Politics
    'World News': ['news', 'international', 'global', 'world', 'current events'],
    'Politics': ['politics', 'government', 'election', 'policy', 'democracy'],
    'Economics': ['economics', 'economy', 'gdp', 'inflation', 'trade', 'market']
  }

  const keywords = keywordMap[topic] || []
  
  // Always include the topic itself and common variations
  const baseKeywords = [
    topic.toLowerCase(),
    topic.toLowerCase().replace(/\s+/g, '-'),
    topic.toLowerCase().replace(/\s+/g, ''),
    ...topic.toLowerCase().split(' ')
  ]

  return [...baseKeywords, ...keywords]
}

/**
 * Filter and rank articles based on user interests
 */
export function personalizeArticles(
  articles: Article[], 
  userProfile: UserProfile | null,
  options: {
    maxArticles?: number
    minRelevanceScore?: number
    diversityFactor?: number // 0-1, higher = more diverse content
  } = {}
): Article[] {
  const { 
    maxArticles = 50, 
    minRelevanceScore = 0.1, 
    diversityFactor = 0.3 
  } = options

  if (!userProfile?.interests || userProfile.interests.length === 0) {
    // No interests set, return top articles by general popularity
    return articles
      .sort((a, b) => (b.finalScore || b.popularityScore) - (a.finalScore || a.popularityScore))
      .slice(0, maxArticles)
  }

  // Calculate personalized scores
  const scoredArticles = articles.map(article => {
    const relevanceScore = calculateRelevanceScore(article, userProfile.interests)
    const popularityScore = article.finalScore || article.popularityScore || 0.5
    const recencyScore = calculateRecencyScore(article)
    
    // Combine scores: relevance (50%), popularity (30%), recency (20%)
    const personalizedScore = (
      relevanceScore * 0.5 +
      popularityScore * 0.3 +
      recencyScore * 0.2
    )

    return {
      ...article,
      relevanceScore,
      personalizedScore
    }
  })

  // Filter by minimum relevance
  const relevantArticles = scoredArticles.filter(
    article => article.relevanceScore >= minRelevanceScore
  )

  // Sort by personalized score
  relevantArticles.sort((a, b) => b.personalizedScore - a.personalizedScore)

  // Apply diversity factor to prevent echo chambers
  if (diversityFactor > 0) {
    return applyDiversityFilter(relevantArticles, diversityFactor, maxArticles)
  }

  return relevantArticles.slice(0, maxArticles)
}

/**
 * Calculate recency score (newer articles get higher scores)
 */
function calculateRecencyScore(article: Article): number {
  if (!article.publishedAt) return 0.5

  const now = Date.now()
  const publishedTime = article.publishedAt.seconds 
    ? article.publishedAt.seconds * 1000 
    : new Date(article.publishedAt).getTime()
  
  const ageHours = (now - publishedTime) / (1000 * 60 * 60)
  
  // Articles decay over 48 hours
  if (ageHours <= 1) return 1.0      // Last hour: full score
  if (ageHours <= 6) return 0.9      // 1-6 hours: 90%
  if (ageHours <= 24) return 0.7     // 6-24 hours: 70%
  if (ageHours <= 48) return 0.4     // 24-48 hours: 40%
  
  return Math.max(0.1, 1.0 - (ageHours / (24 * 7))) // Gradual decay over a week
}

/**
 * Apply diversity filter to prevent echo chambers
 */
function applyDiversityFilter(
  articles: any[], 
  diversityFactor: number, 
  maxArticles: number
): Article[] {
  const result: Article[] = []
  const usedSources = new Set<string>()
  const highRelevanceThreshold = 0.7

  // First pass: High relevance articles (guaranteed spots)
  for (const article of articles) {
    if (article.relevanceScore >= highRelevanceThreshold && result.length < maxArticles * 0.7) {
      result.push(article)
      usedSources.add(article.sourceName)
    }
  }

  // Second pass: Fill remaining spots with diverse content
  for (const article of articles) {
    if (result.length >= maxArticles) break
    if (result.includes(article)) continue

    // Encourage source diversity
    const sourceDiversityBonus = usedSources.has(article.sourceName) ? 0 : diversityFactor
    const adjustedScore = article.personalizedScore + sourceDiversityBonus

    // Add if it's good enough or we need more diversity
    if (adjustedScore >= 0.3 || result.length < maxArticles * 0.8) {
      result.push(article)
      usedSources.add(article.sourceName)
    }
  }

  return result
}

/**
 * Get content mix recommendations based on user interests
 */
export function getContentMixForUser(userProfile: UserProfile | null): {
  interests: number
  popular: number
  diverse: number
} {
  if (!userProfile?.interests || userProfile.interests.length === 0) {
    return { interests: 0.2, popular: 0.6, diverse: 0.2 } // New user: mostly popular
  }

  const interestCount = userProfile.interests.length
  
  if (interestCount <= 3) {
    return { interests: 0.8, popular: 0.15, diverse: 0.05 } // Focused interests
  } else if (interestCount <= 7) {
    return { interests: 0.7, popular: 0.2, diverse: 0.1 } // Balanced
  } else {
    return { interests: 0.6, popular: 0.25, diverse: 0.15 } // Many interests: more diversity
  }
}
