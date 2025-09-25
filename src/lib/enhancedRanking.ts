/**
 * Enhanced Ranking System
 * Implements advanced scoring with multiple signals, AI enhancement, and personalization
 */

import { DynamicArticle } from '@/types'
import { EnrichmentResult, AuxiliarySignals } from './enrichment'
import { ArticleCluster } from './deduplication'
import { initializeGemini, analyzeArticleRelevance } from './gemini'

export interface RankingSignals {
  // Content signals
  contentQuality: number
  readability: number
  wordCount: number
  
  // Authority signals
  sourceReputation: number
  authorCredibility: number
  
  // Engagement signals
  popularityScore: number
  viralityScore: number
  
  // Relevance signals
  topicRelevance: number
  userInterestMatch: number
  
  // Temporal signals
  recency: number
  timeliness: number
  
  // AI signals
  aiRelevanceScore?: number
  aiImportance?: number
  aiCredibility?: number
  
  // Cluster signals
  clusterVelocity?: number
  clusterSize?: number
  
  // User signals
  clickProbability: number
  dwellTimePredict: number
}

export interface RankingWeights {
  contentQuality: number
  sourceReputation: number
  popularityScore: number
  topicRelevance: number
  recency: number
  aiRelevanceScore: number
  userInterestMatch: number
  viralityScore: number
  authorCredibility: number
  readability: number
}

export interface RankingResult {
  article: DynamicArticle
  finalScore: number
  signals: RankingSignals
  explanation: string[]
  confidence: number
}

export interface UserRankingProfile {
  userId: string
  interests: string[]
  clickHistory: ClickEvent[]
  dwellTimePreferences: Record<string, number>
  sourcePreferences: Record<string, number>
  topicPreferences: Record<string, number>
  readingSpeed: number
  preferredContentLength: 'short' | 'medium' | 'long'
  timeOfDayPreferences: Record<string, number>
}

export interface ClickEvent {
  articleId: string
  timestamp: Date
  dwellTime: number
  topic: string
  source: string
  score: number
}

// Default ranking weights
const DEFAULT_WEIGHTS: RankingWeights = {
  contentQuality: 0.15,
  sourceReputation: 0.12,
  popularityScore: 0.10,
  topicRelevance: 0.15,
  recency: 0.08,
  aiRelevanceScore: 0.20,
  userInterestMatch: 0.12,
  viralityScore: 0.05,
  authorCredibility: 0.02,
  readability: 0.01
}

/**
 * Enhanced Ranking Engine
 */
export class EnhancedRankingEngine {
  private weights: RankingWeights
  private userProfile?: UserRankingProfile
  private geminiApiKey?: string

  constructor(
    weights: RankingWeights = DEFAULT_WEIGHTS, 
    userProfile?: UserRankingProfile,
    geminiApiKey?: string
  ) {
    this.weights = weights
    this.userProfile = userProfile
    this.geminiApiKey = geminiApiKey
  }

  /**
   * Rank articles with enhanced signals
   */
  async rankArticles(
    articles: DynamicArticle[],
    enrichments: EnrichmentResult[],
    clusters: ArticleCluster[] = []
  ): Promise<RankingResult[]> {
    console.log(`🏆 Enhanced ranking for ${articles.length} articles`)

    // Initialize Gemini if available
    if (this.geminiApiKey) {
      initializeGemini(this.geminiApiKey)
    }

    const results: RankingResult[] = []

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      const enrichment = enrichments[i]
      
      try {
        // Calculate all ranking signals
        const signals = await this.calculateRankingSignals(article, enrichment, clusters)
        
        // Calculate final score
        const finalScore = this.calculateFinalScore(signals)
        
        // Generate explanation
        const explanation = this.generateExplanation(signals, finalScore)
        
        // Calculate confidence
        const confidence = this.calculateConfidence(signals)

        results.push({
          article: { ...article, finalScore },
          finalScore,
          signals,
          explanation,
          confidence
        })

      } catch (error) {
        console.error(`❌ Ranking failed for article: ${article.title}`, error)
        
        // Fallback to basic score
        results.push({
          article,
          finalScore: article.popularityScore || 0.5,
          signals: this.getDefaultSignals(article),
          explanation: ['Basic scoring (enhanced ranking failed)'],
          confidence: 0.3
        })
      }
    }

    // Sort by final score
    results.sort((a, b) => b.finalScore - a.finalScore)

    console.log(`✅ Ranking complete - Top score: ${results[0]?.finalScore?.toFixed(3)}`)
    return results
  }

  /**
   * Calculate comprehensive ranking signals
   */
  private async calculateRankingSignals(
    article: DynamicArticle,
    enrichment: EnrichmentResult,
    clusters: ArticleCluster[]
  ): Promise<RankingSignals> {
    
    // Content quality signals
    const contentQuality = this.calculateContentQuality(enrichment)
    const readability = enrichment.signals.wordCount > 0 ? 
      Math.min(1, enrichment.signals.wordCount / 500) : 0.5
    
    // Authority signals
    const sourceReputation = enrichment.signals.sourceReputation
    const authorCredibility = enrichment.signals.authorityScore
    
    // Engagement signals
    const popularityScore = article.popularityScore || 0.5
    const viralityScore = enrichment.signals.viralityScore
    
    // Relevance signals
    const topicRelevance = this.calculateTopicRelevance(article, enrichment)
    const userInterestMatch = this.calculateUserInterestMatch(article)
    
    // Temporal signals
    const recency = this.calculateRecencyScore(article.publishedAt)
    const timeliness = enrichment.signals.timelinessScore
    
    // AI signals
    let aiRelevanceScore = article.aiRelevanceScore ? article.aiRelevanceScore / 100 : undefined
    let aiImportance = enrichment.aiInsights?.importance
    let aiCredibility = enrichment.aiInsights?.credibility
    
        // Enhanced AI scoring for top articles
    if (this.geminiApiKey && !aiRelevanceScore && this.shouldEnhanceWithAI(article)) {
      try {
        console.log(`🧠 Calling Gemini AI for article: ${article.title}`)
        const aiAnalysis = await analyzeArticleRelevance(
          article.title,
          article.summary || '',
          this.userProfile?.interests || []
        )
        if (aiAnalysis) {
          aiRelevanceScore = aiAnalysis.score / 100
          // Set the AI score on the article object so it can be detected
          article.aiRelevanceScore = aiAnalysis.score
          article.aiRelevanceReasoning = aiAnalysis.reasoning
          console.log(`✅ AI analysis complete: score=${aiAnalysis.score}, reasoning="${aiAnalysis.reasoning}"`)
        } else {
          console.warn('❌ AI analysis returned null')
        }
      } catch (error) {
        console.warn('❌ AI enhancement failed:', error)
      }
    }
    
    // Cluster signals
    const cluster = this.findArticleCluster(article, clusters)
    const clusterVelocity = cluster?.velocity
    const clusterSize = cluster?.members.length
    
    // User behavior prediction
    const clickProbability = this.predictClickProbability(article)
    const dwellTimePredict = this.predictDwellTime(article)

    return {
      contentQuality,
      readability,
      wordCount: enrichment.signals.wordCount,
      sourceReputation,
      authorCredibility,
      popularityScore,
      viralityScore,
      topicRelevance,
      userInterestMatch,
      recency,
      timeliness,
      aiRelevanceScore,
      aiImportance,
      aiCredibility,
      clusterVelocity,
      clusterSize,
      clickProbability,
      dwellTimePredict
    }
  }

  /**
   * Calculate final weighted score
   */
  private calculateFinalScore(signals: RankingSignals): number {
    let score = 0
    let totalWeight = 0

    // Apply weights to available signals
    if (signals.contentQuality !== undefined) {
      score += signals.contentQuality * this.weights.contentQuality
      totalWeight += this.weights.contentQuality
    }

    if (signals.sourceReputation !== undefined) {
      score += signals.sourceReputation * this.weights.sourceReputation
      totalWeight += this.weights.sourceReputation
    }

    if (signals.popularityScore !== undefined) {
      score += signals.popularityScore * this.weights.popularityScore
      totalWeight += this.weights.popularityScore
    }

    if (signals.topicRelevance !== undefined) {
      score += signals.topicRelevance * this.weights.topicRelevance
      totalWeight += this.weights.topicRelevance
    }

    if (signals.recency !== undefined) {
      score += signals.recency * this.weights.recency
      totalWeight += this.weights.recency
    }

    if (signals.aiRelevanceScore !== undefined) {
      score += signals.aiRelevanceScore * this.weights.aiRelevanceScore
      totalWeight += this.weights.aiRelevanceScore
    }

    if (signals.userInterestMatch !== undefined) {
      score += signals.userInterestMatch * this.weights.userInterestMatch
      totalWeight += this.weights.userInterestMatch
    }

    if (signals.viralityScore !== undefined) {
      score += signals.viralityScore * this.weights.viralityScore
      totalWeight += this.weights.viralityScore
    }

    if (signals.authorCredibility !== undefined) {
      score += signals.authorCredibility * this.weights.authorCredibility
      totalWeight += this.weights.authorCredibility
    }

    if (signals.readability !== undefined) {
      score += signals.readability * this.weights.readability
      totalWeight += this.weights.readability
    }

    // Normalize by total weight
    const normalizedScore = totalWeight > 0 ? score / totalWeight : 0.5

    // Apply boost factors
    let finalScore = normalizedScore

    // Breaking news boost
    if (signals.timeliness > 0.9 && signals.recency > 0.8) {
      finalScore *= 1.2
    }

    // High engagement boost
    if (signals.viralityScore > 0.8 && signals.clusterVelocity && signals.clusterVelocity > 3) {
      finalScore *= 1.15
    }

    // User personalization boost
    if (signals.userInterestMatch > 0.8 && signals.clickProbability > 0.7) {
      finalScore *= 1.1
    }

    // Quality penalty for low-quality content
    if (signals.contentQuality < 0.3 || signals.sourceReputation < 0.4) {
      finalScore *= 0.8
    }

    return Math.max(0, Math.min(1, finalScore))
  }

  /**
   * Calculate content quality score
   */
  private calculateContentQuality(enrichment: EnrichmentResult): number {
    let qualityScore = 0.5

    // Word count factor
    const wordCount = enrichment.signals.wordCount
    if (wordCount > 200) qualityScore += 0.2
    else if (wordCount > 100) qualityScore += 0.1
    else if (wordCount < 50) qualityScore -= 0.2

    // Entity richness
    const entityCount = enrichment.entities.length
    if (entityCount > 5) qualityScore += 0.15
    else if (entityCount > 2) qualityScore += 0.1

    // Topic classification confidence
    const topicConfidence = enrichment.topics.reduce((sum, topic) => sum + topic.confidence, 0) / enrichment.topics.length
    if (topicConfidence > 0.8) qualityScore += 0.1

    // AI insights boost
    if (enrichment.aiInsights?.factuality && enrichment.aiInsights.factuality > 0.8) {
      qualityScore += 0.1
    }

    return Math.max(0, Math.min(1, qualityScore))
  }

  /**
   * Calculate topic relevance score
   */
  private calculateTopicRelevance(article: DynamicArticle, enrichment: EnrichmentResult): number {
    if (!this.userProfile?.interests.length) return 0.5

    let relevanceScore = 0
    const userInterests = this.userProfile.interests.map(i => i.toLowerCase())

    // Check title relevance
    const title = article.title.toLowerCase()
    const titleMatches = userInterests.filter(interest => title.includes(interest)).length
    relevanceScore += (titleMatches / userInterests.length) * 0.4

    // Check summary relevance
    const summary = (article.summary || '').toLowerCase()
    const summaryMatches = userInterests.filter(interest => summary.includes(interest)).length
    relevanceScore += (summaryMatches / userInterests.length) * 0.3

    // Check enriched topics
    const enrichedTopics = enrichment.topics.map(t => t.topic.toLowerCase())
    const topicMatches = userInterests.filter(interest => 
      enrichedTopics.some(topic => topic.includes(interest) || interest.includes(topic))
    ).length
    relevanceScore += (topicMatches / userInterests.length) * 0.3

    return Math.min(1, relevanceScore)
  }

  /**
   * Calculate user interest match
   */
  private calculateUserInterestMatch(article: DynamicArticle): number {
    if (!this.userProfile) return 0.5

    // Use existing relevance score if available
    if (article.relevanceScore !== undefined) {
      return article.relevanceScore
    }

    // Calculate based on historical preferences
    let matchScore = 0.5

    // Source preference
    const sourcePreference = this.userProfile.sourcePreferences[article.sourceName] || 0.5
    matchScore += sourcePreference * 0.3

    // Topic preference (simplified)
    const title = article.title.toLowerCase()
    const topicScores = Object.entries(this.userProfile.topicPreferences)
      .filter(([topic]) => title.includes(topic.toLowerCase()))
      .map(([, score]) => score)
    
    if (topicScores.length > 0) {
      const avgTopicScore = topicScores.reduce((sum, score) => sum + score, 0) / topicScores.length
      matchScore += avgTopicScore * 0.4
    }

    // Time of day preference
    const hour = new Date().getHours()
    const timePreference = this.userProfile.timeOfDayPreferences[hour.toString()] || 0.5
    matchScore += timePreference * 0.1

    return Math.max(0, Math.min(1, matchScore))
  }

  /**
   * Calculate recency score
   */
  private calculateRecencyScore(publishedAt: Date): number {
    const ageInHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
    
    // Exponential decay over 48 hours
    if (ageInHours < 1) return 1.0
    if (ageInHours < 6) return 0.9
    if (ageInHours < 12) return 0.8
    if (ageInHours < 24) return 0.6
    if (ageInHours < 48) return 0.4
    if (ageInHours < 168) return 0.2
    return 0.1
  }

  /**
   * Predict click probability
   */
  private predictClickProbability(article: DynamicArticle): number {
    if (!this.userProfile?.clickHistory.length) return 0.5

    // Simple ML-like prediction based on historical patterns
    const similarClicks = this.userProfile.clickHistory.filter(click => 
      click.source === article.sourceName ||
      article.title.toLowerCase().includes(click.topic.toLowerCase())
    )

    if (similarClicks.length === 0) return 0.5

    const avgScore = similarClicks.reduce((sum, click) => sum + click.score, 0) / similarClicks.length
    const recentBonus = similarClicks.filter(click => 
      (Date.now() - click.timestamp.getTime()) < 7 * 24 * 60 * 60 * 1000 // 7 days
    ).length / similarClicks.length

    return Math.min(1, (avgScore + recentBonus) / 2)
  }

  /**
   * Predict dwell time
   */
  private predictDwellTime(article: DynamicArticle): number {
    if (!this.userProfile) return 0.5

    // Base prediction on content length and user preferences
    const wordCount = article.summary?.split(' ').length || 100
    const readingTimeMinutes = wordCount / (this.userProfile.readingSpeed || 200) // words per minute

    // Normalize to 0-1 scale (0-10 minutes reading time)
    return Math.min(1, readingTimeMinutes / 10)
  }

  /**
   * Check if article should get AI enhancement
   */
  private shouldEnhanceWithAI(article: DynamicArticle): boolean {
    // For testing purposes, enhance all articles if Gemini API is available
    if (this.geminiApiKey) {
      console.log(`🤖 AI enhancement check for: ${article.title} (source: ${article.sourceName}, popularity: ${article.popularityScore})`)
      return true
    }
    
    return (
      article.popularityScore > 0.6 ||
      (article.relevanceScore && article.relevanceScore > 0.7) ||
      article.sourceName.toLowerCase().includes('reuters') ||
      article.sourceName.toLowerCase().includes('bloomberg')
    )
  }

  /**
   * Find cluster containing article
   */
  private findArticleCluster(article: DynamicArticle, clusters: ArticleCluster[]): ArticleCluster | undefined {
    return clusters.find(cluster => 
      cluster.members.some(member => member.id === article.id) ||
      cluster.representativeArticle.id === article.id
    )
  }

  /**
   * Generate explanation for ranking decision
   */
  private generateExplanation(signals: RankingSignals, finalScore: number): string[] {
    const explanations: string[] = []

    if (signals.aiRelevanceScore && signals.aiRelevanceScore > 0.8) {
      explanations.push(`High AI relevance score (${(signals.aiRelevanceScore * 100).toFixed(0)}%)`)
    }

    if (signals.userInterestMatch > 0.8) {
      explanations.push('Matches your interests strongly')
    }

    if (signals.sourceReputation > 0.8) {
      explanations.push('From highly reputable source')
    }

    if (signals.recency > 0.9) {
      explanations.push('Very recent article')
    }

    if (signals.viralityScore > 0.8) {
      explanations.push('Trending/viral content')
    }

    if (signals.clusterVelocity && signals.clusterVelocity > 3) {
      explanations.push('Part of rapidly developing story')
    }

    if (signals.contentQuality > 0.8) {
      explanations.push('High content quality')
    }

    if (finalScore > 0.8) {
      explanations.push('Overall excellent match for you')
    } else if (finalScore < 0.3) {
      explanations.push('Lower relevance for your interests')
    }

    return explanations.length > 0 ? explanations : ['Standard ranking applied']
  }

  /**
   * Calculate confidence in ranking decision
   */
  private calculateConfidence(signals: RankingSignals): number {
    let confidence = 0.5
    let factors = 0

    // AI enhancement boosts confidence
    if (signals.aiRelevanceScore !== undefined) {
      confidence += 0.3
      factors++
    }

    // User profile data boosts confidence
    if (this.userProfile?.clickHistory.length > 10) {
      confidence += 0.2
      factors++
    }

    // Multiple signal sources boost confidence
    const signalCount = Object.values(signals).filter(v => v !== undefined).length
    if (signalCount > 8) {
      confidence += 0.2
      factors++
    }

    // High-quality enrichment boosts confidence
    if (signals.contentQuality > 0.7) {
      confidence += 0.1
      factors++
    }

    return factors > 0 ? Math.min(1, confidence) : 0.5
  }

  /**
   * Get default signals for fallback
   */
  private getDefaultSignals(article: DynamicArticle): RankingSignals {
    return {
      contentQuality: 0.5,
      readability: 0.5,
      wordCount: 100,
      sourceReputation: 0.5,
      authorCredibility: 0.5,
      popularityScore: article.popularityScore || 0.5,
      viralityScore: 0.5,
      topicRelevance: 0.5,
      userInterestMatch: 0.5,
      recency: this.calculateRecencyScore(article.publishedAt),
      timeliness: 0.5,
      clickProbability: 0.5,
      dwellTimePredict: 0.5
    }
  }

  /**
   * Update user profile with click event
   */
  updateUserProfile(clickEvent: ClickEvent): void {
    if (!this.userProfile) return

    this.userProfile.clickHistory.push(clickEvent)

    // Keep only last 1000 clicks
    if (this.userProfile.clickHistory.length > 1000) {
      this.userProfile.clickHistory = this.userProfile.clickHistory.slice(-1000)
    }

    // Update preferences based on click
    const source = clickEvent.source
    const topic = clickEvent.topic.toLowerCase()

    // Update source preference (exponential moving average)
    const currentPref = this.userProfile.sourcePreferences[source] || 0.5
    this.userProfile.sourcePreferences[source] = currentPref * 0.9 + clickEvent.score * 0.1

    // Update topic preference
    const currentTopicPref = this.userProfile.topicPreferences[topic] || 0.5
    this.userProfile.topicPreferences[topic] = currentTopicPref * 0.9 + clickEvent.score * 0.1

    // Update time preference
    const hour = clickEvent.timestamp.getHours().toString()
    const currentTimePref = this.userProfile.timeOfDayPreferences[hour] || 0.5
    this.userProfile.timeOfDayPreferences[hour] = currentTimePref * 0.9 + 0.1
  }
}

/**
 * Create default user ranking profile
 */
export function createDefaultUserRankingProfile(userId: string, interests: string[]): UserRankingProfile {
  return {
    userId,
    interests,
    clickHistory: [],
    dwellTimePreferences: {},
    sourcePreferences: {},
    topicPreferences: {},
    readingSpeed: 200, // words per minute
    preferredContentLength: 'medium',
    timeOfDayPreferences: {}
  }
}
