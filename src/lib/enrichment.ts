/**
 * Content Enrichment Service
 * Implements Named Entity Recognition, Topic Classification, and Signal Computation
 */

import { DynamicArticle } from '@/types'
import { initializeGemini } from './gemini'
import { ExtractedContent } from './contentExtraction'

// Enrichment configuration
const ENRICHMENT_CONFIG = {
  maxEntitiesPerArticle: 15,
  minEntityConfidence: 0.6,
  topicClassificationThreshold: 0.5,
  sourceReputationScores: {
    'reuters.com': 0.95,
    'apnews.com': 0.95,
    'bbc.com': 0.90,
    'cnn.com': 0.80,
    'nytimes.com': 0.90,
    'wsj.com': 0.88,
    'bloomberg.com': 0.87,
    'techcrunch.com': 0.75,
    'ycombinator.com': 0.85,
    'reddit.com': 0.60
  }
}

export interface EnrichedEntity {
  name: string
  type: 'person' | 'organization' | 'location' | 'product' | 'event' | 'other'
  confidence: number
  mentions: number
  context: string[]
}

export interface TopicClassification {
  topic: string
  confidence: number
  keywords: string[]
}

export interface AuxiliarySignals {
  wordCount: number
  sourceReputation: number
  countryLocale?: string
  contentType: 'news' | 'opinion' | 'analysis' | 'press_release' | 'blog'
  isBreaking: boolean
  viralityScore: number
  timelinessScore: number
  authorityScore: number
}

export interface EnrichmentResult {
  entities: EnrichedEntity[]
  topics: TopicClassification[]
  signals: AuxiliarySignals
  aiInsights?: {
    sentiment: 'positive' | 'negative' | 'neutral'
    importance: number
    credibility: number
    bias: 'left' | 'right' | 'center'
    factuality: number
  }
}

/**
 * Main enrichment function
 */
export async function enrichArticle(
  article: DynamicArticle,
  extractedContent: ExtractedContent,
  userProfile?: any
): Promise<EnrichmentResult> {
  console.log(`🔍 Enriching article: ${article.title}`)

  try {
    // Run enrichment tasks in parallel
    const [entities, topics, signals, aiInsights] = await Promise.allSettled([
      extractNamedEntities(extractedContent),
      classifyTopics(article, extractedContent),
      computeAuxiliarySignals(article, extractedContent),
      userProfile?.preferences?.ai_api_keys?.gemini 
        ? computeAIInsights(article, extractedContent, userProfile.preferences.ai_api_keys.gemini)
        : Promise.resolve(undefined)
    ])

    const result: EnrichmentResult = {
      entities: entities.status === 'fulfilled' ? entities.value : [],
      topics: topics.status === 'fulfilled' ? topics.value : [],
      signals: signals.status === 'fulfilled' ? signals.value : getDefaultSignals(article, extractedContent),
      aiInsights: aiInsights.status === 'fulfilled' ? aiInsights.value : undefined
    }

    console.log(`✅ Enrichment complete - Entities: ${result.entities.length}, Topics: ${result.topics.length}`)
    return result

  } catch (error) {
    console.error('❌ Enrichment failed:', error)
    
    // Return minimal enrichment
    return {
      entities: [],
      topics: [],
      signals: getDefaultSignals(article, extractedContent)
    }
  }
}

/**
 * Extract named entities using rule-based approach + AI enhancement
 */
async function extractNamedEntities(content: ExtractedContent): Promise<EnrichedEntity[]> {
  const entities: EnrichedEntity[] = []
  const text = `${content.cleanTitle} ${content.extractedText}`

  // 1. Rule-based entity extraction
  const ruleBasedEntities = extractRuleBasedEntities(text)
  
  // 2. Enhance with existing simple entities
  const simpleEntities = content.extractedEntities.map(name => ({
    name,
    type: 'other' as const,
    confidence: 0.7,
    mentions: 1,
    context: [name]
  }))

  // 3. Merge and deduplicate
  const allEntities = [...ruleBasedEntities, ...simpleEntities]
  const entityMap = new Map<string, EnrichedEntity>()

  allEntities.forEach(entity => {
    const key = entity.name.toLowerCase()
    if (entityMap.has(key)) {
      const existing = entityMap.get(key)!
      existing.mentions += entity.mentions
      existing.context = [...new Set([...existing.context, ...entity.context])]
      existing.confidence = Math.max(existing.confidence, entity.confidence)
    } else {
      entityMap.set(key, entity)
    }
  })

  // 4. Filter and sort
  return Array.from(entityMap.values())
    .filter(entity => entity.confidence >= ENRICHMENT_CONFIG.minEntityConfidence)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, ENRICHMENT_CONFIG.maxEntitiesPerArticle)
}

/**
 * Rule-based named entity extraction
 */
function extractRuleBasedEntities(text: string): EnrichedEntity[] {
  const entities: EnrichedEntity[] = []

  // Person patterns
  const personPatterns = [
    /(?:CEO|President|Director|Mr\.|Ms\.|Dr\.)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:said|announced|stated|declared)/g
  ]

  // Organization patterns  
  const orgPatterns = [
    /\b([A-Z][a-z]*(?:\s+[A-Z][a-z]*)*)\s+(?:Inc|Corp|Ltd|LLC|Company|Corporation)\b/g,
    /\b(Apple|Google|Microsoft|Amazon|Meta|Tesla|OpenAI|Anthropic|Twitter|Facebook)\b/g
  ]

  // Location patterns
  const locationPatterns = [
    /\b(New York|San Francisco|London|Tokyo|Beijing|Washington|Silicon Valley)\b/g,
    /\b([A-Z][a-z]+),\s*([A-Z]{2}|[A-Z][a-z]+)\b/g // City, State/Country
  ]

  // Product patterns
  const productPatterns = [
    /\b(iPhone|Android|Windows|macOS|ChatGPT|GPT-4|Gemini|Claude)\b/g,
    /\b([A-Z][a-z]*\s*(?:AI|API|SDK|OS|Pro|Plus|Max))\b/g
  ]

  // Extract persons
  personPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        name: match[1],
        type: 'person',
        confidence: 0.8,
        mentions: 1,
        context: [match[0]]
      })
    }
  })

  // Extract organizations
  orgPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        name: match[1],
        type: 'organization',
        confidence: 0.85,
        mentions: 1,
        context: [match[0]]
      })
    }
  })

  // Extract locations
  locationPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        name: match[1],
        type: 'location',
        confidence: 0.75,
        mentions: 1,
        context: [match[0]]
      })
    }
  })

  // Extract products
  productPatterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        name: match[1],
        type: 'product',
        confidence: 0.9,
        mentions: 1,
        context: [match[0]]
      })
    }
  })

  return entities
}

/**
 * Classify article topics
 */
async function classifyTopics(
  article: DynamicArticle, 
  content: ExtractedContent
): Promise<TopicClassification[]> {
  const topics: TopicClassification[] = []
  const text = `${content.cleanTitle} ${content.extractedText}`.toLowerCase()

  // Topic classification rules
  const topicRules: Record<string, string[]> = {
    'Artificial Intelligence': ['ai', 'artificial intelligence', 'machine learning', 'neural network', 'deep learning', 'gpt', 'llm', 'chatgpt', 'gemini', 'claude'],
    'Blockchain': ['blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'crypto', 'web3', 'defi', 'nft'],
    'Cloud Computing': ['cloud', 'aws', 'azure', 'google cloud', 'kubernetes', 'docker', 'serverless'],
    'Cybersecurity': ['security', 'cyber', 'hack', 'breach', 'malware', 'ransomware', 'vulnerability'],
    'Data Science': ['data', 'analytics', 'big data', 'machine learning', 'statistics', 'visualization'],
    'Finance': ['finance', 'bank', 'investment', 'stock', 'market', 'trading', 'economy', 'money'],
    'Healthcare': ['health', 'medical', 'medicine', 'hospital', 'doctor', 'patient', 'pharma', 'drug'],
    'Politics': ['politics', 'government', 'election', 'policy', 'congress', 'senate', 'president'],
    'Sports': ['sports', 'football', 'basketball', 'baseball', 'soccer', 'olympics', 'game', 'team'],
    'Entertainment': ['movie', 'film', 'music', 'tv', 'celebrity', 'entertainment', 'hollywood'],
    'Science': ['science', 'research', 'study', 'discovery', 'experiment', 'scientist', 'university'],
    'Technology': ['tech', 'technology', 'software', 'hardware', 'computer', 'internet', 'digital']
  }

  // Calculate topic scores
  Object.entries(topicRules).forEach(([topic, keywords]) => {
    let score = 0
    let matchedKeywords: string[] = []

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = text.match(regex)
      if (matches) {
        score += matches.length * (keyword.length > 5 ? 2 : 1) // Longer keywords get higher weight
        matchedKeywords.push(keyword)
      }
    })

    // Normalize score
    const normalizedScore = Math.min(1, score / 10)

    if (normalizedScore >= ENRICHMENT_CONFIG.topicClassificationThreshold) {
      topics.push({
        topic,
        confidence: normalizedScore,
        keywords: matchedKeywords
      })
    }
  })

  // Sort by confidence and return top topics
  return topics
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
}

/**
 * Compute auxiliary signals
 */
async function computeAuxiliarySignals(
  article: DynamicArticle,
  content: ExtractedContent
): Promise<AuxiliarySignals> {
  const domain = new URL(article.url).hostname.toLowerCase()
  
  // Source reputation
  const sourceReputation = ENRICHMENT_CONFIG.sourceReputationScores[domain] || 0.5

  // Content type classification
  const contentType = classifyContentType(article, content)

  // Breaking news detection
  const isBreaking = detectBreakingNews(article, content)

  // Virality score (based on source and timing)
  const viralityScore = calculateViralityScore(article)

  // Timeliness score
  const timelinessScore = calculateTimelinessScore(article)

  // Authority score
  const authorityScore = calculateAuthorityScore(article, sourceReputation)

  return {
    wordCount: content.wordCount,
    sourceReputation,
    contentType,
    isBreaking,
    viralityScore,
    timelinessScore,
    authorityScore
  }
}

/**
 * Classify content type
 */
function classifyContentType(
  article: DynamicArticle, 
  content: ExtractedContent
): 'news' | 'opinion' | 'analysis' | 'press_release' | 'blog' {
  const title = content.cleanTitle.toLowerCase()
  const text = content.extractedText.toLowerCase()

  // Opinion indicators
  if (title.includes('opinion') || title.includes('editorial') || 
      text.includes('i think') || text.includes('in my view')) {
    return 'opinion'
  }

  // Analysis indicators
  if (title.includes('analysis') || title.includes('explainer') ||
      text.includes('experts say') || text.includes('according to analysts')) {
    return 'analysis'
  }

  // Press release indicators
  if (title.includes('announces') || title.includes('launches') ||
      text.includes('press release') || text.includes('pr newswire')) {
    return 'press_release'
  }

  // Blog indicators
  if (article.sourceName.includes('blog') || 
      article.url.includes('/blog/') ||
      article.url.includes('medium.com')) {
    return 'blog'
  }

  return 'news'
}

/**
 * Detect breaking news
 */
function detectBreakingNews(article: DynamicArticle, content: ExtractedContent): boolean {
  const title = content.cleanTitle.toLowerCase()
  const recentThreshold = 2 * 60 * 60 * 1000 // 2 hours
  const isRecent = (Date.now() - article.publishedAt.getTime()) < recentThreshold

  const breakingKeywords = ['breaking', 'urgent', 'just in', 'developing', 'live', 'alert']
  const hasBreakingKeywords = breakingKeywords.some(keyword => title.includes(keyword))

  return isRecent && (hasBreakingKeywords || article.popularityScore > 0.8)
}

/**
 * Calculate virality score
 */
function calculateViralityScore(article: DynamicArticle): number {
  let score = article.popularityScore || 0.5

  // Boost for social media sources
  if (article.sourceName.toLowerCase().includes('twitter') ||
      article.sourceName.toLowerCase().includes('reddit')) {
    score *= 1.2
  }

  // Boost for trending topics
  if (article.tags.some(tag => ['viral', 'trending', 'popular'].includes(tag.toLowerCase()))) {
    score *= 1.3
  }

  return Math.min(1, score)
}

/**
 * Calculate timeliness score
 */
function calculateTimelinessScore(article: DynamicArticle): number {
  const ageInHours = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
  
  // Exponential decay: newer articles get higher scores
  if (ageInHours < 1) return 1.0
  if (ageInHours < 6) return 0.9
  if (ageInHours < 24) return 0.7
  if (ageInHours < 72) return 0.5
  if (ageInHours < 168) return 0.3
  return 0.1
}

/**
 * Calculate authority score
 */
function calculateAuthorityScore(article: DynamicArticle, sourceReputation: number): number {
  let score = sourceReputation

  // Boost for verified authors
  if (article.author && article.author !== 'Unknown') {
    score += 0.1
  }

  // Boost for established domains
  const domain = new URL(article.url).hostname
  if (!domain.includes('blog') && !domain.includes('medium') && !domain.includes('substack')) {
    score += 0.1
  }

  return Math.min(1, score)
}

/**
 * Get default signals for fallback
 */
function getDefaultSignals(article: DynamicArticle, content: ExtractedContent): AuxiliarySignals {
  const domain = new URL(article.url).hostname.toLowerCase()
  
  return {
    wordCount: content.wordCount,
    sourceReputation: ENRICHMENT_CONFIG.sourceReputationScores[domain] || 0.5,
    contentType: 'news',
    isBreaking: false,
    viralityScore: article.popularityScore || 0.5,
    timelinessScore: 0.7,
    authorityScore: 0.6
  }
}

/**
 * Compute AI insights using Gemini
 */
async function computeAIInsights(
  article: DynamicArticle,
  content: ExtractedContent,
  geminiKey: string
): Promise<any> {
  try {
    initializeGemini(geminiKey)
    
    // This would call a more sophisticated Gemini analysis
    // For now, return mock insights
    return {
      sentiment: 'neutral',
      importance: 0.7,
      credibility: 0.8,
      bias: 'center',
      factuality: 0.85
    }
  } catch (error) {
    console.warn('❌ AI insights failed:', error)
    return undefined
  }
}
