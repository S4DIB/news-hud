/**
 * Enhanced Feedback & Learning System
 * Implements user feedback collection, learning algorithms, and personalization improvement
 */

import { DynamicArticle } from '@/types'

export interface UserFeedback {
  id: string
  userId: string
  articleId: string
  type: 'thumbs_up' | 'thumbs_down' | 'bookmark' | 'share' | 'hide' | 'not_interested' | 'more_like_this'
  timestamp: Date
  context: FeedbackContext
  metadata?: any
}

export interface FeedbackContext {
  position: number // Position in feed when action taken
  timeOnPage: number // Milliseconds
  scrollDepth: number // 0-1
  sourceView: 'feed' | 'search' | 'notification' | 'recommendation'
  deviceType: 'mobile' | 'desktop' | 'tablet'
  sessionLength: number // How long user has been active
  articlesViewedInSession: number
}

export interface UserInteraction {
  id: string
  userId: string
  articleId: string
  action: 'view' | 'click' | 'dwell' | 'scroll' | 'close'
  value: number // Duration for dwell, depth for scroll, etc.
  timestamp: Date
  context: InteractionContext
}

export interface InteractionContext {
  referrer: string
  userAgent: string
  viewportSize: { width: number; height: number }
  clickCoordinates?: { x: number; y: number }
  exitPoint?: string
}

export interface LearningInsights {
  topicPreferences: Record<string, number>
  sourcePreferences: Record<string, number>
  timePreferences: Record<string, number>
  contentLengthPreference: 'short' | 'medium' | 'long'
  engagementPatterns: EngagementPattern[]
  predictedInterests: string[]
  averageDwellTime: number
  readingSpeed: number
  attentionSpan: number
}

export interface EngagementPattern {
  pattern: string
  confidence: number
  examples: string[]
  recommendation: string
}

export interface FeedbackAnalytics {
  totalFeedbacks: number
  positiveFeedbackRate: number
  engagementScore: number
  topTopics: Array<{ topic: string; score: number }>
  topSources: Array<{ source: string; score: number }>
  behaviorTrends: Array<{ date: string; metric: string; value: number }>
  recommendations: string[]
}

/**
 * Enhanced Feedback & Learning Engine
 */
export class FeedbackLearningEngine {
  private feedbacks: UserFeedback[] = []
  private interactions: UserInteraction[] = []
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Record user feedback
   */
  async recordFeedback(
    articleId: string,
    type: UserFeedback['type'],
    context: FeedbackContext,
    metadata?: any
  ): Promise<UserFeedback> {
    const feedback: UserFeedback = {
      id: this.generateId(),
      userId: this.userId,
      articleId,
      type,
      timestamp: new Date(),
      context,
      metadata
    }

    this.feedbacks.push(feedback)
    
    // Trigger learning update
    await this.updateLearningModel(feedback)
    
    console.log(`📝 Feedback recorded: ${type} for article ${articleId}`)
    return feedback
  }

  /**
   * Record user interaction
   */
  async recordInteraction(
    articleId: string,
    action: UserInteraction['action'],
    value: number,
    context: InteractionContext
  ): Promise<UserInteraction> {
    const interaction: UserInteraction = {
      id: this.generateId(),
      userId: this.userId,
      articleId,
      action,
      value,
      timestamp: new Date(),
      context
    }

    this.interactions.push(interaction)

    // Analyze interaction patterns
    if (this.interactions.length % 10 === 0) {
      await this.analyzeInteractionPatterns()
    }

    console.log(`👆 Interaction recorded: ${action} (${value}) for article ${articleId}`)
    return interaction
  }

  /**
   * Generate learning insights from feedback and interactions
   */
  async generateLearningInsights(articles: DynamicArticle[]): Promise<LearningInsights> {
    console.log(`🧠 Generating learning insights from ${this.feedbacks.length} feedbacks and ${this.interactions.length} interactions`)

    const insights: LearningInsights = {
      topicPreferences: this.calculateTopicPreferences(articles),
      sourcePreferences: this.calculateSourcePreferences(articles),
      timePreferences: this.calculateTimePreferences(),
      contentLengthPreference: this.calculateContentLengthPreference(),
      engagementPatterns: this.identifyEngagementPatterns(),
      predictedInterests: this.predictNewInterests(articles),
      averageDwellTime: this.calculateAverageDwellTime(),
      readingSpeed: this.estimateReadingSpeed(),
      attentionSpan: this.calculateAttentionSpan()
    }

    console.log(`✅ Learning insights generated - ${Object.keys(insights.topicPreferences).length} topic preferences identified`)
    return insights
  }

  /**
   * Calculate topic preferences based on user feedback
   */
  private calculateTopicPreferences(articles: DynamicArticle[]): Record<string, number> {
    const topicScores: Record<string, number> = {}
    const topicCounts: Record<string, number> = {}

    // Create article lookup
    const articleMap = new Map(articles.map(a => [a.id, a]))

    for (const feedback of this.feedbacks) {
      const article = articleMap.get(feedback.articleId)
      if (!article) continue

      // Extract topics from article tags and title
      const topics = this.extractTopicsFromArticle(article)
      
      for (const topic of topics) {
        if (!topicScores[topic]) {
          topicScores[topic] = 0
          topicCounts[topic] = 0
        }

        // Weight feedback types differently
        const weight = this.getFeedbackWeight(feedback.type)
        const contextWeight = this.getContextWeight(feedback.context)
        
        topicScores[topic] += weight * contextWeight
        topicCounts[topic]++
      }
    }

    // Normalize scores
    const normalizedScores: Record<string, number> = {}
    for (const [topic, score] of Object.entries(topicScores)) {
      const count = topicCounts[topic]
      normalizedScores[topic] = score / Math.max(1, count)
    }

    return normalizedScores
  }

  /**
   * Calculate source preferences
   */
  private calculateSourcePreferences(articles: DynamicArticle[]): Record<string, number> {
    const sourceScores: Record<string, number> = {}
    const sourceCounts: Record<string, number> = {}
    
    const articleMap = new Map(articles.map(a => [a.id, a]))

    for (const feedback of this.feedbacks) {
      const article = articleMap.get(feedback.articleId)
      if (!article) continue

      const source = article.sourceName
      if (!sourceScores[source]) {
        sourceScores[source] = 0
        sourceCounts[source] = 0
      }

      const weight = this.getFeedbackWeight(feedback.type)
      const contextWeight = this.getContextWeight(feedback.context)
      
      sourceScores[source] += weight * contextWeight
      sourceCounts[source]++
    }

    // Normalize scores
    const normalizedScores: Record<string, number> = {}
    for (const [source, score] of Object.entries(sourceScores)) {
      const count = sourceCounts[source]
      normalizedScores[source] = score / Math.max(1, count)
    }

    return normalizedScores
  }

  /**
   * Calculate time preferences (what time of day user is most active)
   */
  private calculateTimePreferences(): Record<string, number> {
    const hourCounts: Record<string, number> = {}
    const hourEngagement: Record<string, number> = {}

    for (const feedback of this.feedbacks) {
      const hour = feedback.timestamp.getHours().toString()
      
      if (!hourCounts[hour]) {
        hourCounts[hour] = 0
        hourEngagement[hour] = 0
      }

      hourCounts[hour]++
      hourEngagement[hour] += this.getFeedbackWeight(feedback.type)
    }

    // Include interaction data
    for (const interaction of this.interactions) {
      const hour = interaction.timestamp.getHours().toString()
      
      if (!hourCounts[hour]) {
        hourCounts[hour] = 0
        hourEngagement[hour] = 0
      }

      hourCounts[hour]++
      if (interaction.action === 'dwell' && interaction.value > 30000) { // 30+ seconds
        hourEngagement[hour] += 0.5
      }
    }

    // Normalize by activity
    const preferences: Record<string, number> = {}
    for (const [hour, engagement] of Object.entries(hourEngagement)) {
      const count = hourCounts[hour] || 1
      preferences[hour] = engagement / count
    }

    return preferences
  }

  /**
   * Calculate preferred content length
   */
  private calculateContentLengthPreference(): 'short' | 'medium' | 'long' {
    const dwellTimes: number[] = []

    for (const interaction of this.interactions) {
      if (interaction.action === 'dwell' && interaction.value > 5000) { // 5+ seconds
        dwellTimes.push(interaction.value)
      }
    }

    if (dwellTimes.length === 0) return 'medium'

    const avgDwellTime = dwellTimes.reduce((sum, time) => sum + time, 0) / dwellTimes.length

    if (avgDwellTime < 30000) return 'short' // < 30 seconds
    if (avgDwellTime < 120000) return 'medium' // < 2 minutes
    return 'long' // 2+ minutes
  }

  /**
   * Identify engagement patterns
   */
  private identifyEngagementPatterns(): EngagementPattern[] {
    const patterns: EngagementPattern[] = []

    // Pattern 1: Quick scanner
    const quickViews = this.interactions.filter(i => 
      i.action === 'dwell' && i.value < 10000 // < 10 seconds
    ).length
    
    if (quickViews > this.interactions.length * 0.7) {
      patterns.push({
        pattern: 'Quick Scanner',
        confidence: 0.8,
        examples: ['Short dwell times', 'Rapid scrolling'],
        recommendation: 'Show more headlines and summaries, prioritize key points'
      })
    }

    // Pattern 2: Deep reader
    const longReads = this.interactions.filter(i => 
      i.action === 'dwell' && i.value > 120000 // > 2 minutes
    ).length
    
    if (longReads > this.interactions.length * 0.3) {
      patterns.push({
        pattern: 'Deep Reader',
        confidence: 0.7,
        examples: ['Long dwell times', 'High scroll depth'],
        recommendation: 'Provide detailed articles and in-depth analysis'
      })
    }

    // Pattern 3: Topic focused
    const topicPrefs = this.calculateTopicPreferences([])
    const dominantTopics = Object.entries(topicPrefs)
      .filter(([, score]) => score > 0.7)
      .length

    if (dominantTopics <= 3 && dominantTopics > 0) {
      patterns.push({
        pattern: 'Topic Focused',
        confidence: 0.9,
        examples: [`Strong preference for ${dominantTopics} topics`],
        recommendation: 'Increase content from preferred topics, reduce noise'
      })
    }

    return patterns
  }

  /**
   * Predict new interests based on engagement patterns
   */
  private predictNewInterests(articles: DynamicArticle[]): string[] {
    const currentInterests = new Set(Object.keys(this.calculateTopicPreferences(articles)))
    const relatedTopics: Record<string, number> = {}

    // Find topics that often appear together with user's interests
    const articleMap = new Map(articles.map(a => [a.id, a]))

    for (const feedback of this.feedbacks) {
      if (this.getFeedbackWeight(feedback.type) <= 0) continue

      const article = articleMap.get(feedback.articleId)
      if (!article) continue

      const topics = this.extractTopicsFromArticle(article)
      
      for (const topic of topics) {
        if (!currentInterests.has(topic)) {
          relatedTopics[topic] = (relatedTopics[topic] || 0) + 1
        }
      }
    }

    // Return top predicted interests
    return Object.entries(relatedTopics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)
  }

  /**
   * Calculate average dwell time
   */
  private calculateAverageDwellTime(): number {
    const dwellTimes = this.interactions
      .filter(i => i.action === 'dwell' && i.value > 1000) // > 1 second
      .map(i => i.value)

    if (dwellTimes.length === 0) return 30000 // 30 seconds default

    return dwellTimes.reduce((sum, time) => sum + time, 0) / dwellTimes.length
  }

  /**
   * Estimate reading speed (words per minute)
   */
  private estimateReadingSpeed(): number {
    // This would need article word counts - simplified estimation
    const longDwells = this.interactions
      .filter(i => i.action === 'dwell' && i.value > 60000) // > 1 minute

    if (longDwells.length === 0) return 200 // default WPM

    // Estimate based on engagement patterns
    const avgLongDwell = longDwells.reduce((sum, i) => sum + i.value, 0) / longDwells.length
    const estimatedWords = (avgLongDwell / 1000) * 3 // rough estimation

    return Math.max(150, Math.min(300, estimatedWords))
  }

  /**
   * Calculate attention span
   */
  private calculateAttentionSpan(): number {
    const sessionInteractions = this.groupInteractionsBySessions()
    
    if (sessionInteractions.length === 0) return 600000 // 10 minutes default

    const sessionLengths = sessionInteractions.map(session => {
      const times = session.map(i => i.timestamp.getTime())
      return Math.max(...times) - Math.min(...times)
    })

    return sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length
  }

  /**
   * Update learning model based on new feedback
   */
  private async updateLearningModel(feedback: UserFeedback): Promise<void> {
    // In a real implementation, this would update ML models
    // For now, we'll just log the learning opportunity
    
    const weight = this.getFeedbackWeight(feedback.type)
    console.log(`🎯 Learning opportunity: ${feedback.type} (weight: ${weight})`)

    // Trigger model retraining if enough new data
    if (this.feedbacks.length % 50 === 0) {
      console.log('🔄 Triggering model update with new feedback data')
    }
  }

  /**
   * Analyze interaction patterns for insights
   */
  private async analyzeInteractionPatterns(): Promise<void> {
    const recentInteractions = this.interactions.slice(-20)
    
    // Detect rapid scrolling (possible disinterest)
    const rapidScrolls = recentInteractions.filter(i => 
      i.action === 'scroll' && i.value > 0.8 // High scroll depth quickly
    ).length

    if (rapidScrolls > 10) {
      console.log('📊 Pattern detected: Rapid scrolling - user may need more relevant content')
    }

    // Detect reading patterns
    const dwellTimes = recentInteractions
      .filter(i => i.action === 'dwell')
      .map(i => i.value)

    if (dwellTimes.length >= 5) {
      const avgDwell = dwellTimes.reduce((sum, t) => sum + t, 0) / dwellTimes.length
      console.log(`📊 Recent average dwell time: ${(avgDwell / 1000).toFixed(1)}s`)
    }
  }

  /**
   * Group interactions by sessions
   */
  private groupInteractionsBySessions(): UserInteraction[][] {
    const sessions: UserInteraction[][] = []
    const sortedInteractions = [...this.interactions].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    )

    let currentSession: UserInteraction[] = []
    let lastTime = 0

    for (const interaction of sortedInteractions) {
      const timeDiff = interaction.timestamp.getTime() - lastTime
      
      // New session if gap > 30 minutes
      if (timeDiff > 30 * 60 * 1000 && currentSession.length > 0) {
        sessions.push(currentSession)
        currentSession = []
      }

      currentSession.push(interaction)
      lastTime = interaction.timestamp.getTime()
    }

    if (currentSession.length > 0) {
      sessions.push(currentSession)
    }

    return sessions
  }

  /**
   * Get analytics summary
   */
  async getFeedbackAnalytics(): Promise<FeedbackAnalytics> {
    const positiveFeedbacks = this.feedbacks.filter(f => 
      ['thumbs_up', 'bookmark', 'share', 'more_like_this'].includes(f.type)
    ).length

    const totalFeedbacks = this.feedbacks.length
    const positiveFeedbackRate = totalFeedbacks > 0 ? positiveFeedbacks / totalFeedbacks : 0

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore()

    return {
      totalFeedbacks,
      positiveFeedbackRate,
      engagementScore,
      topTopics: this.getTopTopics(),
      topSources: this.getTopSources(),
      behaviorTrends: this.getBehaviorTrends(),
      recommendations: this.generateRecommendations()
    }
  }

  /**
   * Utility functions
   */

  private extractTopicsFromArticle(article: DynamicArticle): string[] {
    const topics = [...article.tags]
    
    // Extract topics from title (simple keyword matching)
    const title = article.title.toLowerCase()
    const keywords = ['ai', 'tech', 'finance', 'health', 'politics', 'sports', 'science']
    
    for (const keyword of keywords) {
      if (title.includes(keyword) && !topics.includes(keyword)) {
        topics.push(keyword)
      }
    }

    return topics
  }

  private getFeedbackWeight(type: UserFeedback['type']): number {
    const weights = {
      'thumbs_up': 1.0,
      'bookmark': 1.2,
      'share': 1.5,
      'more_like_this': 1.3,
      'thumbs_down': -0.8,
      'hide': -1.0,
      'not_interested': -1.2
    }
    return weights[type] || 0
  }

  private getContextWeight(context: FeedbackContext): number {
    let weight = 1.0

    // Higher weight for engaged users
    if (context.timeOnPage > 30000) weight += 0.2 // 30+ seconds
    if (context.scrollDepth > 0.5) weight += 0.1 // 50%+ scroll
    
    // Position matters (higher positions get slightly lower weight)
    if (context.position > 10) weight -= 0.1

    return Math.max(0.1, weight)
  }

  private calculateEngagementScore(): number {
    const totalInteractions = this.interactions.length
    if (totalInteractions === 0) return 0

    const meaningfulInteractions = this.interactions.filter(i => 
      (i.action === 'dwell' && i.value > 10000) || // 10+ seconds
      (i.action === 'scroll' && i.value > 0.3) // 30%+ scroll
    ).length

    return meaningfulInteractions / totalInteractions
  }

  private getTopTopics(): Array<{ topic: string; score: number }> {
    const topicPrefs = this.calculateTopicPreferences([])
    return Object.entries(topicPrefs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, score]) => ({ topic, score }))
  }

  private getTopSources(): Array<{ source: string; score: number }> {
    const sourcePrefs = this.calculateSourcePreferences([])
    return Object.entries(sourcePrefs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, score]) => ({ source, score }))
  }

  private getBehaviorTrends(): Array<{ date: string; metric: string; value: number }> {
    // Simplified trend analysis
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    })

    return last7Days.flatMap(date => {
      const dayFeedbacks = this.feedbacks.filter(f => 
        f.timestamp.toISOString().split('T')[0] === date
      )

      return [
        { date, metric: 'feedbacks', value: dayFeedbacks.length },
        { date, metric: 'positive_rate', value: this.calculateDayPositiveRate(dayFeedbacks) }
      ]
    })
  }

  private calculateDayPositiveRate(feedbacks: UserFeedback[]): number {
    if (feedbacks.length === 0) return 0
    
    const positive = feedbacks.filter(f => this.getFeedbackWeight(f.type) > 0).length
    return positive / feedbacks.length
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    const insights = this.identifyEngagementPatterns()
    recommendations.push(...insights.map(p => p.recommendation))

    if (this.feedbacks.length < 10) {
      recommendations.push('Continue using the app to improve personalization')
    }

    if (this.calculateEngagementScore() < 0.3) {
      recommendations.push('Try exploring different topics to find content you enjoy')
    }

    return recommendations.slice(0, 3)
  }

  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Create feedback context from browser/app state
 */
export function createFeedbackContext(
  position: number,
  startTime: number,
  scrollElement?: Element
): FeedbackContext {
  const timeOnPage = Date.now() - startTime
  const scrollDepth = scrollElement ? 
    scrollElement.scrollTop / (scrollElement.scrollHeight - scrollElement.clientHeight) : 0

  return {
    position,
    timeOnPage,
    scrollDepth: Math.max(0, Math.min(1, scrollDepth)),
    sourceView: 'feed', // Default, should be passed in
    deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
    sessionLength: timeOnPage, // Simplified
    articlesViewedInSession: 1 // Simplified
  }
}
