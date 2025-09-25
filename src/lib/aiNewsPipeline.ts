/**
 * AI News Pipeline Integration Service
 * Orchestrates all pipeline components for comprehensive news processing
 */

import { DynamicArticle } from '@/types'
import { extractAndCleanContent, ExtractedContent } from './contentExtraction'
import { enrichArticle, EnrichmentResult } from './enrichment'
import { deduplicateAndCluster, ArticleCluster } from './deduplication'
import { EnhancedRankingEngine, RankingResult, createDefaultUserRankingProfile } from './enhancedRanking'
import { AdvancedSummarizationEngine, SummaryResult } from './advancedSummarization'
import { NotificationProcessor, createDefaultNotificationPreferences } from './notifications'
import { FeedbackLearningEngine } from './feedbackSystem'
import { EvaluationEngine } from './evaluationSuite'
import { SafetyEngine } from './safetyFilters'
import { monitoring, monitorFunction, trackMetric } from './monitoring'

export interface PipelineConfig {
  // Processing options
  enableContentExtraction: boolean
  enableEnrichment: boolean
  enableDeduplication: boolean
  enableRanking: boolean
  enableSummarization: boolean
  enableNotifications: boolean
  enableSafety: boolean
  
  // AI settings
  geminiApiKey?: string
  
  // User settings
  userId: string
  userInterests: string[]
  
  // Performance settings
  batchSize: number
  maxProcessingTime: number
  enableParallelProcessing: boolean
  
  // Quality thresholds
  minContentQuality: number
  maxDuplicateRate: number
  
  // Monitoring
  enableMetrics: boolean
  enableTracing: boolean
}

export interface PipelineResult {
  // Processed articles
  articles: DynamicArticle[]
  clusters: ArticleCluster[]
  
  // Analysis results
  rankings: RankingResult[]
  summaries: Map<string, SummaryResult>
  notifications: any[]
  
  // Quality metrics
  safetyResults: Map<string, any>
  duplicatesRemoved: number
  processingTime: number
  
  // Pipeline stats
  inputCount: number
  outputCount: number
  errorCount: number
  
  // Performance data
  metrics: {
    extractionTime: number
    enrichmentTime: number
    deduplicationTime: number
    rankingTime: number
    summarizationTime: number
    totalTime: number
  }
}

export interface PipelineError {
  stage: string
  error: Error
  articleId?: string
  recoverable: boolean
}

/**
 * Main AI News Pipeline
 */
export class AINewsPipeline {
  private config: PipelineConfig
  private rankingEngine: EnhancedRankingEngine
  private summarizationEngine: AdvancedSummarizationEngine
  private notificationProcessor: NotificationProcessor
  private feedbackEngine: FeedbackLearningEngine
  private evaluationEngine: EvaluationEngine
  private safetyEngine: SafetyEngine
  
  private existingClusters: ArticleCluster[] = []
  private processingErrors: PipelineError[] = []

  constructor(config: PipelineConfig) {
    this.config = config
    
    // Initialize engines
    this.initializeEngines()
    
    console.log(`🚀 AI News Pipeline initialized for user ${config.userId}`)
  }

  /**
   * Main pipeline processing method
   */
  async process(articles: DynamicArticle[]): Promise<PipelineResult> {
    const startTime = performance.now()
    console.log(`⚡ Processing ${articles.length} articles through AI pipeline`)

    // Initialize metrics
    const metrics = {
      extractionTime: 0,
      enrichmentTime: 0,
      deduplicationTime: 0,
      rankingTime: 0,
      summarizationTime: 0,
      totalTime: 0
    }

    const result: PipelineResult = {
      articles: [],
      clusters: [],
      rankings: [],
      summaries: new Map(),
      notifications: [],
      safetyResults: new Map(),
      duplicatesRemoved: 0,
      processingTime: 0,
      inputCount: articles.length,
      outputCount: 0,
      errorCount: 0,
      metrics
    }

    this.processingErrors = []

    try {
      // Stage 1: Content Extraction & Cleanup
      let processedArticles = articles
      let extractedContents: ExtractedContent[] = []
      
      if (this.config.enableContentExtraction) {
        const extractionStart = performance.now()
        const extractionResults = await this.runContentExtraction(processedArticles)
        processedArticles = extractionResults.articles
        extractedContents = extractionResults.contents
        metrics.extractionTime = performance.now() - extractionStart
        console.log(`📄 Content extraction completed in ${metrics.extractionTime.toFixed(0)}ms`)
      }

      // Stage 2: Safety Filtering
      if (this.config.enableSafety) {
        const safetyResults = await this.runSafetyFiltering(processedArticles, extractedContents)
        processedArticles = safetyResults.safeArticles
        result.safetyResults = safetyResults.results
        console.log(`🛡️ Safety filtering: ${safetyResults.blockedCount} articles blocked`)
      }

      // Stage 3: Content Enrichment
      let enrichmentResults: EnrichmentResult[] = []
      
      if (this.config.enableEnrichment) {
        const enrichmentStart = performance.now()
        enrichmentResults = await this.runEnrichment(processedArticles, extractedContents)
        metrics.enrichmentTime = performance.now() - enrichmentStart
        console.log(`🔍 Enrichment completed in ${metrics.enrichmentTime.toFixed(0)}ms`)
      }

      // Stage 4: Deduplication & Clustering
      if (this.config.enableDeduplication) {
        const deduplicationStart = performance.now()
        const deduplicationResult = await this.runDeduplication(processedArticles)
        processedArticles = [...deduplicationResult.clusters.flatMap(c => c.members), ...deduplicationResult.unclustered]
        result.clusters = deduplicationResult.clusters
        result.duplicatesRemoved = deduplicationResult.duplicatesRemoved
        metrics.deduplicationTime = performance.now() - deduplicationStart
        console.log(`🔍 Deduplication completed: ${result.duplicatesRemoved} duplicates removed`)
      }

      // Stage 5: Enhanced Ranking
      if (this.config.enableRanking) {
        const rankingStart = performance.now()
        result.rankings = await this.runRanking(processedArticles, enrichmentResults, result.clusters)
        processedArticles = result.rankings.map(r => r.article)
        metrics.rankingTime = performance.now() - rankingStart
        console.log(`🏆 Ranking completed in ${metrics.rankingTime.toFixed(0)}ms`)
      }

      // Stage 6: Advanced Summarization
      if (this.config.enableSummarization) {
        const summarizationStart = performance.now()
        result.summaries = await this.runSummarization(processedArticles, extractedContents, enrichmentResults)
        metrics.summarizationTime = performance.now() - summarizationStart
        console.log(`📝 Summarization completed for ${result.summaries.size} articles`)
      }

      // Stage 7: Notification Processing
      if (this.config.enableNotifications) {
        result.notifications = await this.runNotificationProcessing(processedArticles, result.clusters, enrichmentResults)
        console.log(`🔔 Generated ${result.notifications.length} notifications`)
      }

      // Finalize results
      result.articles = processedArticles
      result.outputCount = processedArticles.length
      result.errorCount = this.processingErrors.length
      
      const totalTime = performance.now() - startTime
      result.processingTime = totalTime
      metrics.totalTime = totalTime

      // Record metrics
      if (this.config.enableMetrics) {
        this.recordPipelineMetrics(result)
      }

      console.log(`✅ Pipeline completed: ${result.inputCount} → ${result.outputCount} articles (${totalTime.toFixed(0)}ms)`)
      return result

    } catch (error) {
      console.error('❌ Pipeline processing failed:', error)
      
      this.processingErrors.push({
        stage: 'pipeline',
        error: error as Error,
        recoverable: false
      })

      result.errorCount = this.processingErrors.length
      result.processingTime = performance.now() - startTime
      
      return result
    }
  }

  /**
   * Content Extraction Stage
   */
  private async runContentExtraction(articles: DynamicArticle[]): Promise<{
    articles: DynamicArticle[]
    contents: ExtractedContent[]
  }> {
    const contents: ExtractedContent[] = []
    const processedArticles: DynamicArticle[] = []

    const tasks = articles.map(async (article, index) => {
      try {
        const content = await extractAndCleanContent(article)
        
        // Update article with extracted content
        const updatedArticle = {
          ...article,
          summary: content.cleanSummary || article.summary,
          tags: [...new Set([...article.tags, ...content.extractedKeywords])]
        }

        return { article: updatedArticle, content, index }
      } catch (error) {
        this.processingErrors.push({
          stage: 'content_extraction',
          error: error as Error,
          articleId: article.id,
          recoverable: true
        })
        return { article, content: null, index }
      }
    })

    const results = await this.executeWithTimeout(tasks, 'content extraction')
    
    for (const result of results) {
      if (result.content) {
        processedArticles.push(result.article)
        contents.push(result.content)
      } else {
        // Keep original article if extraction failed
        processedArticles.push(result.article)
        contents.push({
          cleanTitle: result.article.title,
          cleanSummary: result.article.summary || '',
          extractedText: result.article.summary || result.article.title,
          language: 'en',
          wordCount: (result.article.summary || result.article.title).split(' ').length,
          readabilityScore: 50,
          contentQuality: 'medium',
          extractedEntities: [],
          extractedKeywords: [],
          ogTags: {}
        })
      }
    }

    return { articles: processedArticles, contents }
  }

  /**
   * Safety Filtering Stage
   */
  private async runSafetyFiltering(
    articles: DynamicArticle[], 
    contents: ExtractedContent[]
  ): Promise<{
    safeArticles: DynamicArticle[]
    results: Map<string, any>
    blockedCount: number
  }> {
    const safeArticles: DynamicArticle[] = []
    const results = new Map<string, any>()
    let blockedCount = 0

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      const content = contents[i]

      try {
        const safetyResult = await this.safetyEngine.checkContentSafety(article, content)
        results.set(article.id, safetyResult)

        if (safetyResult.recommendation === 'allow') {
          safeArticles.push(article)
        } else {
          blockedCount++
          console.log(`🚫 Article blocked: ${article.title} (${safetyResult.recommendation})`)
        }
      } catch (error) {
        // On safety check error, allow article but log error
        this.processingErrors.push({
          stage: 'safety_filtering',
          error: error as Error,
          articleId: article.id,
          recoverable: true
        })
        safeArticles.push(article)
      }
    }

    return { safeArticles, results, blockedCount }
  }

  /**
   * Enrichment Stage
   */
  private async runEnrichment(
    articles: DynamicArticle[], 
    contents: ExtractedContent[]
  ): Promise<EnrichmentResult[]> {
    const enrichmentResults: EnrichmentResult[] = []

    const tasks = articles.map(async (article, index) => {
      try {
        const content = contents[index]
        const result = await enrichArticle(article, content, { 
          preferences: { ai_api_keys: { gemini: this.config.geminiApiKey } } 
        })
        return { result, index }
      } catch (error) {
        this.processingErrors.push({
          stage: 'enrichment',
          error: error as Error,
          articleId: article.id,
          recoverable: true
        })
        
        // Return minimal enrichment result
        return {
          result: {
            entities: [],
            topics: [],
            signals: {
              wordCount: contents[index]?.wordCount || 100,
              sourceReputation: 0.5,
              contentType: 'news' as const,
              isBreaking: false,
              viralityScore: 0.5,
              timelinessScore: 0.5,
              authorityScore: 0.5
            }
          },
          index
        }
      }
    })

    const results = await this.executeWithTimeout(tasks, 'enrichment')
    
    // Sort results back to original order
    results.sort((a, b) => a.index - b.index)
    
    return results.map(r => r.result)
  }

  /**
   * Deduplication Stage
   */
  private async runDeduplication(articles: DynamicArticle[]) {
    try {
      return await deduplicateAndCluster(articles, this.existingClusters)
    } catch (error) {
      this.processingErrors.push({
        stage: 'deduplication',
        error: error as Error,
        recoverable: true
      })
      
      // Return minimal clustering result
      return {
        clusters: [],
        unclustered: articles,
        duplicatesRemoved: 0,
        clustersFormed: 0
      }
    }
  }

  /**
   * Ranking Stage
   */
  private async runRanking(
    articles: DynamicArticle[], 
    enrichments: EnrichmentResult[], 
    clusters: ArticleCluster[]
  ): Promise<RankingResult[]> {
    try {
      return await this.rankingEngine.rankArticles(articles, enrichments, clusters)
    } catch (error) {
      this.processingErrors.push({
        stage: 'ranking',
        error: error as Error,
        recoverable: true
      })
      
      // Return basic ranking results
      return articles.map(article => ({
        article,
        finalScore: article.popularityScore || 0.5,
        signals: {
          contentQuality: 0.5,
          readability: 0.5,
          wordCount: 100,
          sourceReputation: 0.5,
          authorCredibility: 0.5,
          popularityScore: article.popularityScore || 0.5,
          viralityScore: 0.5,
          topicRelevance: 0.5,
          userInterestMatch: 0.5,
          recency: 0.5,
          timeliness: 0.5,
          clickProbability: 0.5,
          dwellTimePredict: 0.5
        },
        explanation: ['Basic ranking applied'],
        confidence: 0.3
      }))
    }
  }

  /**
   * Summarization Stage
   */
  private async runSummarization(
    articles: DynamicArticle[], 
    contents: ExtractedContent[], 
    enrichments: EnrichmentResult[]
  ): Promise<Map<string, SummaryResult>> {
    const summaries = new Map<string, SummaryResult>()

    // Only summarize top articles to save processing time
    const topArticles = articles.slice(0, Math.min(10, articles.length))

    const tasks = topArticles.map(async (article, index) => {
      try {
        const content = contents[index]
        const enrichment = enrichments[index]
        
        if (content && enrichment) {
          const summary = await this.summarizationEngine.generateSummary(
            article, 
            content, 
            enrichment.entities
          )
          return { articleId: article.id, summary }
        }
        return null
      } catch (error) {
        this.processingErrors.push({
          stage: 'summarization',
          error: error as Error,
          articleId: article.id,
          recoverable: true
        })
        return null
      }
    })

    const results = await this.executeWithTimeout(tasks, 'summarization')
    
    for (const result of results) {
      if (result) {
        summaries.set(result.articleId, result.summary)
      }
    }

    return summaries
  }

  /**
   * Notification Processing Stage
   */
  private async runNotificationProcessing(
    articles: DynamicArticle[], 
    clusters: ArticleCluster[], 
    enrichments: EnrichmentResult[]
  ): Promise<any[]> {
    try {
      const signals = enrichments.map(e => e.signals)
      return await this.notificationProcessor.processArticles(articles, clusters, signals)
    } catch (error) {
      this.processingErrors.push({
        stage: 'notifications',
        error: error as Error,
        recoverable: true
      })
      return []
    }
  }

  /**
   * Initialize all pipeline engines
   */
  private initializeEngines(): void {
    // Enhanced ranking engine
    const userProfile = createDefaultUserRankingProfile(this.config.userId, this.config.userInterests)
    this.rankingEngine = new EnhancedRankingEngine(undefined, userProfile, this.config.geminiApiKey)

    // Summarization engine
    this.summarizationEngine = new AdvancedSummarizationEngine(undefined, this.config.geminiApiKey)

    // Notification processor
    const notificationPrefs = createDefaultNotificationPreferences(this.config.userId)
    notificationPrefs.topics = this.config.userInterests
    this.notificationProcessor = new NotificationProcessor(notificationPrefs)

    // Feedback learning engine
    this.feedbackEngine = new FeedbackLearningEngine(this.config.userId)

    // Evaluation engine
    this.evaluationEngine = new EvaluationEngine()

    // Safety engine
    this.safetyEngine = new SafetyEngine()
  }

  /**
   * Execute tasks with timeout and parallel processing
   */
  private async executeWithTimeout<T>(
    tasks: Promise<T>[],
    stageName: string
  ): Promise<T[]> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${stageName} timeout`)), this.config.maxProcessingTime)
    )

    try {
      if (this.config.enableParallelProcessing) {
        // Process in batches
        const batches = this.chunkArray(tasks, this.config.batchSize)
        const results: T[] = []

        for (const batch of batches) {
          const batchResults = await Promise.race([
            Promise.allSettled(batch),
            timeoutPromise
          ]) as PromiseSettledResult<T>[]

          for (const result of batchResults) {
            if (result.status === 'fulfilled') {
              results.push(result.value)
            }
          }
        }

        return results
      } else {
        // Sequential processing
        const results: T[] = []
        for (const task of tasks) {
          try {
            const result = await Promise.race([task, timeoutPromise])
            results.push(result)
          } catch (error) {
            // Log error but continue processing
            console.warn(`Task failed in ${stageName}:`, error)
          }
        }
        return results
      }
    } catch (error) {
      console.error(`Timeout in ${stageName}:`, error)
      return []
    }
  }

  /**
   * Utility: Chunk array into batches
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * Record pipeline metrics
   */
  private recordPipelineMetrics(result: PipelineResult): void {
    monitoring.recordMetrics({
      responseTime: result.processingTime,
      throughput: result.outputCount / (result.processingTime / 1000), // articles per second
      errorRate: result.errorCount / result.inputCount,
      articlesProcessed: result.outputCount,
      averageRelevanceScore: result.rankings.length > 0 
        ? result.rankings.reduce((sum, r) => sum + r.finalScore, 0) / result.rankings.length 
        : 0
    })
  }

  /**
   * Get pipeline statistics
   */
  getStatistics(): any {
    return {
      config: this.config,
      clustersCount: this.existingClusters.length,
      errorsCount: this.processingErrors.length,
      lastErrors: this.processingErrors.slice(-5)
    }
  }

  /**
   * Update pipeline configuration
   */
  updateConfig(newConfig: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Reinitialize engines if needed
    if (newConfig.geminiApiKey || newConfig.userInterests) {
      this.initializeEngines()
    }
    
    console.log('⚙️ Pipeline configuration updated')
  }

  /**
   * Get processing errors
   */
  getErrors(): PipelineError[] {
    return this.processingErrors
  }

  /**
   * Clear processing errors
   */
  clearErrors(): void {
    this.processingErrors = []
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    const checks = {
      rankingEngine: !!this.rankingEngine,
      summarizationEngine: !!this.summarizationEngine,
      notificationProcessor: !!this.notificationProcessor,
      safetyEngine: !!this.safetyEngine,
      geminiConfigured: !!this.config.geminiApiKey,
      errorsCount: this.processingErrors.length
    }

    const isHealthy = Object.values(checks).every(check => 
      typeof check === 'boolean' ? check : check < 10
    )

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: checks
    }
  }
}

/**
 * Factory function to create pipeline with default configuration
 */
export function createAINewsPipeline(
  userId: string, 
  userInterests: string[], 
  geminiApiKey?: string
): AINewsPipeline {
  const config: PipelineConfig = {
    enableContentExtraction: true,
    enableEnrichment: true,
    enableDeduplication: true,
    enableRanking: true,
    enableSummarization: true,
    enableNotifications: true,
    enableSafety: true,
    
    geminiApiKey,
    userId,
    userInterests,
    
    batchSize: 10,
    maxProcessingTime: 30000, // 30 seconds
    enableParallelProcessing: true,
    
    minContentQuality: 0.3,
    maxDuplicateRate: 0.1,
    
    enableMetrics: true,
    enableTracing: true
  }

  return new AINewsPipeline(config)
}

/**
 * Quick pipeline for basic processing
 */
export async function processArticlesQuick(
  articles: DynamicArticle[],
  userInterests: string[],
  geminiApiKey?: string
): Promise<DynamicArticle[]> {
  const pipeline = createAINewsPipeline('quick_user', userInterests, geminiApiKey)
  
  // Disable heavy processing for quick mode
  pipeline.updateConfig({
    enableContentExtraction: false,
    enableSummarization: false,
    enableNotifications: false,
    batchSize: 20,
    maxProcessingTime: 10000
  })

  const result = await pipeline.process(articles)
  return result.articles
}
