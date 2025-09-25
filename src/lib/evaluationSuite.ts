/**
 * Evaluation Suite & A/B Testing Framework
 * Implements comprehensive metrics, A/B testing, and model evaluation
 */

import { DynamicArticle } from '@/types'
import { UserFeedback, UserInteraction } from './feedbackSystem'

export interface EvaluationMetrics {
  // Ranking metrics
  precisionAtK: Record<number, number> // P@1, P@5, P@10
  nDCGAtK: Record<number, number> // nDCG@1, nDCG@5, nDCG@10
  meanReciprocalRank: number
  
  // User engagement metrics
  clickThroughRate: number
  dwellTimeAverage: number
  completionRate: number
  saveRate: number
  shareRate: number
  
  // Personalization metrics
  diversityScore: number
  noveltyScore: number
  topicCoverage: number
  
  // System metrics
  latency: LatencyMetrics
  throughput: number
  errorRate: number
  
  // Quality metrics
  duplicateRate: number
  factualityScore: number
  sourceQualityScore: number
}

export interface LatencyMetrics {
  p50: number
  p95: number
  p99: number
  mean: number
}

export interface ABTestConfig {
  id: string
  name: string
  description: string
  variants: ABTestVariant[]
  trafficSplit: number[] // e.g., [50, 50] for 50/50 split
  startDate: Date
  endDate: Date
  primaryMetric: string
  secondaryMetrics: string[]
  minimumSampleSize: number
  statisticalSignificance: number // e.g., 0.95 for 95%
  status: 'draft' | 'running' | 'completed' | 'paused'
}

export interface ABTestVariant {
  id: string
  name: string
  description: string
  config: any // Variant-specific configuration
  userAllocation: number // Percentage of users
}

export interface ABTestResult {
  testId: string
  variant: string
  metrics: EvaluationMetrics
  sampleSize: number
  statisticalSignificance: number
  confidenceInterval: { lower: number; upper: number }
  isSignificant: boolean
  recommendation: 'adopt' | 'reject' | 'inconclusive'
}

export interface UserExperiment {
  userId: string
  testId: string
  variant: string
  assignedAt: Date
  exposureEvents: ExposureEvent[]
}

export interface ExposureEvent {
  timestamp: Date
  event: string
  value?: number
  metadata?: any
}

export interface ModelEvaluation {
  modelName: string
  version: string
  dataset: string
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    auc: number
  }
  confusionMatrix: number[][]
  featureImportance: Record<string, number>
  evaluatedAt: Date
}

/**
 * Evaluation Engine
 */
export class EvaluationEngine {
  private experiments: Map<string, ABTestConfig> = new Map()
  private userExperiments: Map<string, UserExperiment[]> = new Map()
  private results: Map<string, ABTestResult[]> = new Map()

  /**
   * Calculate comprehensive evaluation metrics
   */
  async calculateMetrics(
    articles: DynamicArticle[],
    userFeedbacks: UserFeedback[],
    userInteractions: UserInteraction[],
    groundTruthRelevance?: Map<string, number> // For offline evaluation
  ): Promise<EvaluationMetrics> {
    console.log(`📊 Calculating evaluation metrics for ${articles.length} articles`)

    // Ranking metrics
    const precisionAtK = this.calculatePrecisionAtK(articles, userFeedbacks, groundTruthRelevance)
    const nDCGAtK = this.calculateNDCGAtK(articles, userFeedbacks, groundTruthRelevance)
    const meanReciprocalRank = this.calculateMRR(articles, userFeedbacks)

    // Engagement metrics
    const clickThroughRate = this.calculateCTR(userInteractions)
    const dwellTimeAverage = this.calculateAverageDwellTime(userInteractions)
    const completionRate = this.calculateCompletionRate(userInteractions)
    const saveRate = this.calculateSaveRate(userFeedbacks)
    const shareRate = this.calculateShareRate(userFeedbacks)

    // Personalization metrics
    const diversityScore = this.calculateDiversityScore(articles)
    const noveltyScore = this.calculateNoveltyScore(articles, userFeedbacks)
    const topicCoverage = this.calculateTopicCoverage(articles)

    // System metrics
    const latency = await this.measureLatency()
    const throughput = this.calculateThroughput()
    const errorRate = this.calculateErrorRate()

    // Quality metrics
    const duplicateRate = this.calculateDuplicateRate(articles)
    const factualityScore = this.calculateFactualityScore(articles)
    const sourceQualityScore = this.calculateSourceQualityScore(articles)

    const metrics: EvaluationMetrics = {
      precisionAtK,
      nDCGAtK,
      meanReciprocalRank,
      clickThroughRate,
      dwellTimeAverage,
      completionRate,
      saveRate,
      shareRate,
      diversityScore,
      noveltyScore,
      topicCoverage,
      latency,
      throughput,
      errorRate,
      duplicateRate,
      factualityScore,
      sourceQualityScore
    }

    console.log(`✅ Metrics calculated - CTR: ${(clickThroughRate * 100).toFixed(1)}%, Diversity: ${diversityScore.toFixed(2)}`)
    return metrics
  }

  /**
   * Calculate Precision@K
   */
  private calculatePrecisionAtK(
    articles: DynamicArticle[],
    feedbacks: UserFeedback[],
    groundTruth?: Map<string, number>
  ): Record<number, number> {
    const kValues = [1, 5, 10]
    const precisionAtK: Record<number, number> = {}

    for (const k of kValues) {
      const topK = articles.slice(0, k)
      let relevant = 0

      for (const article of topK) {
        if (groundTruth?.has(article.id)) {
          // Use ground truth if available
          if (groundTruth.get(article.id)! >= 3) relevant++ // 3+ rating = relevant
        } else {
          // Use implicit feedback
          const positiveFeedback = feedbacks.find(f => 
            f.articleId === article.id && 
            ['thumbs_up', 'bookmark', 'share'].includes(f.type)
          )
          if (positiveFeedback) relevant++
        }
      }

      precisionAtK[k] = relevant / k
    }

    return precisionAtK
  }

  /**
   * Calculate nDCG@K (Normalized Discounted Cumulative Gain)
   */
  private calculateNDCGAtK(
    articles: DynamicArticle[],
    feedbacks: UserFeedback[],
    groundTruth?: Map<string, number>
  ): Record<number, number> {
    const kValues = [1, 5, 10]
    const nDCGAtK: Record<number, number> = {}

    for (const k of kValues) {
      const topK = articles.slice(0, k)
      
      // Calculate DCG
      let dcg = 0
      for (let i = 0; i < topK.length; i++) {
        const article = topK[i]
        let relevance = 0

        if (groundTruth?.has(article.id)) {
          relevance = groundTruth.get(article.id)!
        } else {
          // Convert feedback to relevance score
          const feedback = feedbacks.find(f => f.articleId === article.id)
          relevance = this.feedbackToRelevance(feedback)
        }

        dcg += relevance / Math.log2(i + 2) // +2 because log2(1) = 0
      }

      // Calculate IDCG (Ideal DCG)
      const idealRelevances = topK
        .map(a => groundTruth?.get(a.id) || this.feedbackToRelevance(
          feedbacks.find(f => f.articleId === a.id)
        ))
        .sort((a, b) => b - a)

      let idcg = 0
      for (let i = 0; i < idealRelevances.length; i++) {
        idcg += idealRelevances[i] / Math.log2(i + 2)
      }

      nDCGAtK[k] = idcg > 0 ? dcg / idcg : 0
    }

    return nDCGAtK
  }

  /**
   * Calculate Mean Reciprocal Rank
   */
  private calculateMRR(articles: DynamicArticle[], feedbacks: UserFeedback[]): number {
    const relevantItems = feedbacks.filter(f => 
      ['thumbs_up', 'bookmark', 'share'].includes(f.type)
    )

    if (relevantItems.length === 0) return 0

    let totalRR = 0
    let queries = 0

    for (const feedback of relevantItems) {
      const rank = articles.findIndex(a => a.id === feedback.articleId) + 1
      if (rank > 0) {
        totalRR += 1 / rank
        queries++
      }
    }

    return queries > 0 ? totalRR / queries : 0
  }

  /**
   * Calculate Click-Through Rate
   */
  private calculateCTR(interactions: UserInteraction[]): number {
    const views = interactions.filter(i => i.action === 'view').length
    const clicks = interactions.filter(i => i.action === 'click').length
    
    return views > 0 ? clicks / views : 0
  }

  /**
   * Calculate average dwell time
   */
  private calculateAverageDwellTime(interactions: UserInteraction[]): number {
    const dwellTimes = interactions
      .filter(i => i.action === 'dwell')
      .map(i => i.value)

    if (dwellTimes.length === 0) return 0
    return dwellTimes.reduce((sum, time) => sum + time, 0) / dwellTimes.length
  }

  /**
   * Calculate completion rate (users who read articles fully)
   */
  private calculateCompletionRate(interactions: UserInteraction[]): number {
    const scrollInteractions = interactions.filter(i => i.action === 'scroll')
    const completions = scrollInteractions.filter(i => i.value > 0.8).length // 80%+ scroll
    
    return scrollInteractions.length > 0 ? completions / scrollInteractions.length : 0
  }

  /**
   * Calculate save/bookmark rate
   */
  private calculateSaveRate(feedbacks: UserFeedback[]): number {
    const totalFeedbacks = feedbacks.length
    const saves = feedbacks.filter(f => f.type === 'bookmark').length
    
    return totalFeedbacks > 0 ? saves / totalFeedbacks : 0
  }

  /**
   * Calculate share rate
   */
  private calculateShareRate(feedbacks: UserFeedback[]): number {
    const totalFeedbacks = feedbacks.length
    const shares = feedbacks.filter(f => f.type === 'share').length
    
    return totalFeedbacks > 0 ? shares / totalFeedbacks : 0
  }

  /**
   * Calculate diversity score (topic diversity in recommendations)
   */
  private calculateDiversityScore(articles: DynamicArticle[]): number {
    const topics = new Set<string>()
    
    for (const article of articles) {
      article.tags.forEach(tag => topics.add(tag.toLowerCase()))
    }

    // Shannon entropy for diversity
    const topicCounts = new Map<string, number>()
    
    for (const article of articles) {
      for (const tag of article.tags) {
        const topic = tag.toLowerCase()
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
      }
    }

    let entropy = 0
    const totalArticles = articles.length

    Array.from(topicCounts.values()).forEach(count => {
      const probability = count / totalArticles
      entropy -= probability * Math.log2(probability)
    })

    // Normalize by maximum possible entropy
    const maxEntropy = Math.log2(topics.size)
    return maxEntropy > 0 ? entropy / maxEntropy : 0
  }

  /**
   * Calculate novelty score (how much new content vs seen before)
   */
  private calculateNoveltyScore(articles: DynamicArticle[], feedbacks: UserFeedback[]): number {
    const seenArticles = new Set(feedbacks.map(f => f.articleId))
    const newArticles = articles.filter(a => !seenArticles.has(a.id)).length
    
    return articles.length > 0 ? newArticles / articles.length : 0
  }

  /**
   * Calculate topic coverage
   */
  private calculateTopicCoverage(articles: DynamicArticle[]): number {
    const availableTopics = new Set([
      'technology', 'politics', 'sports', 'entertainment', 'science', 
      'health', 'business', 'finance', 'education', 'environment'
    ])
    
    const coveredTopics = new Set<string>()
    
    for (const article of articles) {
      for (const tag of article.tags) {
        const topic = tag.toLowerCase()
        if (availableTopics.has(topic)) {
          coveredTopics.add(topic)
        }
      }
    }

    return coveredTopics.size / availableTopics.size
  }

  /**
   * Measure system latency
   */
  private async measureLatency(): Promise<LatencyMetrics> {
    // This would measure actual system response times
    // For now, return mock measurements
    return {
      p50: 150,
      p95: 500,
      p99: 1000,
      mean: 200
    }
  }

  /**
   * Calculate system throughput
   */
  private calculateThroughput(): number {
    // Articles processed per second
    return 50 // Mock value
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    // Percentage of failed requests
    return 0.01 // 1% mock error rate
  }

  /**
   * Calculate duplicate rate
   */
  private calculateDuplicateRate(articles: DynamicArticle[]): number {
    const urls = new Set<string>()
    let duplicates = 0

    for (const article of articles) {
      const normalizedUrl = article.url.toLowerCase().replace(/[?#].*$/, '')
      if (urls.has(normalizedUrl)) {
        duplicates++
      } else {
        urls.add(normalizedUrl)
      }
    }

    return articles.length > 0 ? duplicates / articles.length : 0
  }

  /**
   * Calculate factuality score
   */
  private calculateFactualityScore(articles: DynamicArticle[]): number {
    // Average AI factuality score if available
    const factualityScores = articles
      .map(a => a.aiRelevanceScore)
      .filter(score => score !== undefined) as number[]

    if (factualityScores.length === 0) return 0.7 // Default

    return factualityScores.reduce((sum, score) => sum + score, 0) / factualityScores.length / 100
  }

  /**
   * Calculate source quality score
   */
  private calculateSourceQualityScore(articles: DynamicArticle[]): number {
    const reputableSources = new Set([
      'reuters.com', 'apnews.com', 'bbc.com', 'bloomberg.com', 
      'wsj.com', 'nytimes.com', 'theguardian.com'
    ])

    const qualityArticles = articles.filter(article => {
      const domain = new URL(article.url).hostname.toLowerCase()
      return Array.from(reputableSources).some(source => domain.includes(source))
    }).length

    return articles.length > 0 ? qualityArticles / articles.length : 0
  }

  /**
   * Convert feedback to relevance score
   */
  private feedbackToRelevance(feedback?: UserFeedback): number {
    if (!feedback) return 0

    const relevanceMap = {
      'thumbs_up': 4,
      'bookmark': 5,
      'share': 5,
      'more_like_this': 4,
      'thumbs_down': 1,
      'hide': 0,
      'not_interested': 0
    }

    return relevanceMap[feedback.type] || 2
  }

  /**
   * A/B Testing Methods
   */

  /**
   * Create A/B test
   */
  createABTest(config: ABTestConfig): void {
    this.experiments.set(config.id, config)
    console.log(`🧪 A/B test created: ${config.name}`)
  }

  /**
   * Assign user to experiment variant
   */
  assignUserToVariant(userId: string, testId: string): string {
    const test = this.experiments.get(testId)
    if (!test || test.status !== 'running') {
      return 'control' // Default variant
    }

    // Use deterministic assignment based on user ID
    const hash = this.hashUserId(userId, testId)
    const bucket = hash % 100

    let cumulative = 0
    for (let i = 0; i < test.variants.length; i++) {
      cumulative += test.trafficSplit[i]
      if (bucket < cumulative) {
        const variant = test.variants[i].id
        
        // Record assignment
        this.recordUserExperiment(userId, testId, variant)
        
        return variant
      }
    }

    return test.variants[0].id // Fallback to first variant
  }

  /**
   * Record user experiment assignment
   */
  private recordUserExperiment(userId: string, testId: string, variant: string): void {
    const userExperiments = this.userExperiments.get(userId) || []
    
    // Check if already assigned
    const existing = userExperiments.find(exp => exp.testId === testId)
    if (existing) return

    const experiment: UserExperiment = {
      userId,
      testId,
      variant,
      assignedAt: new Date(),
      exposureEvents: []
    }

    userExperiments.push(experiment)
    this.userExperiments.set(userId, userExperiments)
  }

  /**
   * Record exposure event
   */
  recordExposure(userId: string, testId: string, event: string, value?: number, metadata?: any): void {
    const userExperiments = this.userExperiments.get(userId) || []
    const experiment = userExperiments.find(exp => exp.testId === testId)
    
    if (!experiment) return

    experiment.exposureEvents.push({
      timestamp: new Date(),
      event,
      value,
      metadata
    })
  }

  /**
   * Analyze A/B test results
   */
  async analyzeABTest(testId: string): Promise<ABTestResult[]> {
    const test = this.experiments.get(testId)
    if (!test) throw new Error(`Test ${testId} not found`)

    const results: ABTestResult[] = []

    for (const variant of test.variants) {
      // Get users in this variant
      const variantUsers = Array.from(this.userExperiments.values())
        .flat()
        .filter(exp => exp.testId === testId && exp.variant === variant.id)

      // Calculate metrics for this variant
      const metrics = await this.calculateVariantMetrics(variantUsers)
      
      // Statistical significance testing
      const significance = this.calculateStatisticalSignificance(variantUsers, test.primaryMetric)
      
      results.push({
        testId,
        variant: variant.id,
        metrics,
        sampleSize: variantUsers.length,
        statisticalSignificance: significance.pValue,
        confidenceInterval: significance.confidenceInterval,
        isSignificant: significance.pValue < (1 - test.statisticalSignificance),
        recommendation: this.getRecommendation(significance, variantUsers.length, test.minimumSampleSize)
      })
    }

    this.results.set(testId, results)
    return results
  }

  /**
   * Calculate metrics for experiment variant
   */
  private async calculateVariantMetrics(userExperiments: UserExperiment[]): Promise<EvaluationMetrics> {
    // This would calculate metrics specific to the variant
    // For now, return mock metrics
    return {
      precisionAtK: { 1: 0.8, 5: 0.7, 10: 0.6 },
      nDCGAtK: { 1: 0.8, 5: 0.75, 10: 0.7 },
      meanReciprocalRank: 0.65,
      clickThroughRate: 0.12,
      dwellTimeAverage: 45000,
      completionRate: 0.35,
      saveRate: 0.08,
      shareRate: 0.03,
      diversityScore: 0.85,
      noveltyScore: 0.6,
      topicCoverage: 0.9,
      latency: { p50: 150, p95: 500, p99: 1000, mean: 200 },
      throughput: 50,
      errorRate: 0.01,
      duplicateRate: 0.02,
      factualityScore: 0.85,
      sourceQualityScore: 0.75
    }
  }

  /**
   * Calculate statistical significance
   */
  private calculateStatisticalSignificance(
    userExperiments: UserExperiment[], 
    primaryMetric: string
  ): { pValue: number; confidenceInterval: { lower: number; upper: number } } {
    // Simplified statistical testing
    // In production, would use proper statistical tests (t-test, chi-square, etc.)
    
    const sampleSize = userExperiments.length
    const effectSize = Math.random() * 0.1 // Mock effect size
    
    // Mock p-value calculation
    const pValue = sampleSize > 100 ? 0.03 : 0.15
    
    return {
      pValue,
      confidenceInterval: {
        lower: effectSize - 0.02,
        upper: effectSize + 0.02
      }
    }
  }

  /**
   * Get recommendation based on test results
   */
  private getRecommendation(
    significance: { pValue: number; confidenceInterval: { lower: number; upper: number } },
    sampleSize: number,
    minimumSampleSize: number
  ): 'adopt' | 'reject' | 'inconclusive' {
    if (sampleSize < minimumSampleSize) return 'inconclusive'
    if (significance.pValue < 0.05 && significance.confidenceInterval.lower > 0) return 'adopt'
    if (significance.pValue < 0.05 && significance.confidenceInterval.upper < 0) return 'reject'
    return 'inconclusive'
  }

  /**
   * Hash user ID for consistent variant assignment
   */
  private hashUserId(userId: string, testId: string): number {
    let hash = 0
    const str = userId + testId
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash)
  }

  /**
   * Get experiment configuration for user
   */
  getExperimentConfig(userId: string, testId: string): any {
    const test = this.experiments.get(testId)
    if (!test) return null

    const userExperiments = this.userExperiments.get(userId) || []
    const experiment = userExperiments.find(exp => exp.testId === testId)
    
    if (!experiment) return null

    const variant = test.variants.find(v => v.id === experiment.variant)
    return variant?.config || null
  }

  /**
   * Export evaluation report
   */
  exportEvaluationReport(metrics: EvaluationMetrics): string {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        clickThroughRate: `${(metrics.clickThroughRate * 100).toFixed(2)}%`,
        averageDwellTime: `${(metrics.dwellTimeAverage / 1000).toFixed(1)}s`,
        diversityScore: metrics.diversityScore.toFixed(3),
        factualityScore: metrics.factualityScore.toFixed(3)
      },
      rankingMetrics: {
        precisionAt5: metrics.precisionAtK[5]?.toFixed(3),
        nDCGAt10: metrics.nDCGAtK[10]?.toFixed(3),
        meanReciprocalRank: metrics.meanReciprocalRank.toFixed(3)
      },
      systemMetrics: {
        latencyP95: `${metrics.latency.p95}ms`,
        errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
        throughput: `${metrics.throughput} articles/sec`
      },
      qualityMetrics: {
        duplicateRate: `${(metrics.duplicateRate * 100).toFixed(2)}%`,
        sourceQuality: `${(metrics.sourceQualityScore * 100).toFixed(1)}%`
      }
    }

    return JSON.stringify(report, null, 2)
  }
}
