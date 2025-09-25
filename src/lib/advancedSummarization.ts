/**
 * Advanced Summarization Service
 * Implements AI-powered summarization with factuality checks and source grounding
 */

import { DynamicArticle } from '@/types'
import { ExtractedContent } from './contentExtraction'
import { EnrichedEntity } from './enrichment'
import { initializeGemini } from './gemini'

export interface SummaryResult {
  extractiveSummary: string
  abstractiveSummary?: string
  keyPoints: string[]
  entities: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  factualityScore: number
  credibilityScore: number
  bias: 'left' | 'right' | 'center'
  sourceGrounding: SourceCitation[]
  confidenceScore: number
  warningFlags: string[]
}

export interface SourceCitation {
  claim: string
  sourceText: string
  confidence: number
  lineNumber?: number
}

export interface FactCheckResult {
  claim: string
  verdict: 'supported' | 'unsupported' | 'uncertain'
  confidence: number
  reasoning: string
  evidence: string[]
}

export interface SummarizationConfig {
  maxSummaryLength: number
  minSummaryLength: number
  extractiveRatio: number // How much to extract vs generate
  factCheckThreshold: number
  biasDetectionEnabled: boolean
  sourceGroundingRequired: boolean
  enableAbstractiveSummary: boolean
}

const DEFAULT_CONFIG: SummarizationConfig = {
  maxSummaryLength: 200,
  minSummaryLength: 50,
  extractiveRatio: 0.7,
  factCheckThreshold: 0.8,
  biasDetectionEnabled: true,
  sourceGroundingRequired: true,
  enableAbstractiveSummary: true
}

/**
 * Advanced Summarization Engine
 */
export class AdvancedSummarizationEngine {
  private config: SummarizationConfig
  private geminiApiKey?: string

  constructor(config: SummarizationConfig = DEFAULT_CONFIG, geminiApiKey?: string) {
    this.config = config
    this.geminiApiKey = geminiApiKey
  }

  /**
   * Generate comprehensive summary with factuality checks
   */
  async generateSummary(
    article: DynamicArticle,
    extractedContent: ExtractedContent,
    entities: EnrichedEntity[]
  ): Promise<SummaryResult> {
    console.log(`📝 Generating advanced summary for: ${article.title}`)

    try {
      // Step 1: Generate extractive summary
      const extractiveSummary = this.generateExtractiveSummary(
        extractedContent.extractedText,
        extractedContent.cleanTitle
      )

      // Step 2: Extract key points
      const keyPoints = this.extractKeyPoints(extractedContent.extractedText, entities)

      // Step 3: Analyze sentiment
      const sentiment = this.analyzeSentiment(extractedContent.extractedText)

      // Step 4: Generate abstractive summary (if enabled and API available)
      let abstractiveSummary: string | undefined
      let factualityScore = 0.7 // default
      let credibilityScore = 0.7 // default
      let bias: 'left' | 'right' | 'center' = 'center'
      let sourceGrounding: SourceCitation[] = []
      let warningFlags: string[] = []

      if (this.config.enableAbstractiveSummary && this.geminiApiKey) {
        try {
          initializeGemini(this.geminiApiKey)
          
          const aiSummaryResult = await this.generateAISummary(
            article,
            extractedContent,
            extractiveSummary
          )
          
          abstractiveSummary = aiSummaryResult.summary
          factualityScore = aiSummaryResult.factualityScore
          credibilityScore = aiSummaryResult.credibilityScore
          bias = aiSummaryResult.bias
          sourceGrounding = aiSummaryResult.sourceGrounding
          warningFlags = aiSummaryResult.warningFlags

        } catch (error) {
          console.warn('❌ AI summarization failed:', error)
          warningFlags.push('AI summarization unavailable')
        }
      }

      // Step 5: Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(
        extractiveSummary,
        abstractiveSummary,
        factualityScore,
        entities.length
      )

      const result: SummaryResult = {
        extractiveSummary,
        abstractiveSummary,
        keyPoints,
        entities: entities.map(e => e.name),
        sentiment,
        factualityScore,
        credibilityScore,
        bias,
        sourceGrounding,
        confidenceScore,
        warningFlags
      }

      console.log(`✅ Summary generated - Confidence: ${confidenceScore.toFixed(2)}, Factuality: ${factualityScore.toFixed(2)}`)
      return result

    } catch (error) {
      console.error('❌ Summary generation failed:', error)
      
      // Return minimal summary as fallback
      return {
        extractiveSummary: extractedContent.cleanSummary || 'Summary unavailable',
        keyPoints: [],
        entities: [],
        sentiment: 'neutral',
        factualityScore: 0.5,
        credibilityScore: 0.5,
        bias: 'center',
        sourceGrounding: [],
        confidenceScore: 0.3,
        warningFlags: ['Summary generation failed']
      }
    }
  }

  /**
   * Generate extractive summary using sentence ranking
   */
  private generateExtractiveSummary(text: string, title: string): string {
    const sentences = this.splitIntoSentences(text)
    
    if (sentences.length <= 2) {
      return sentences.join(' ')
    }

    // Score sentences based on multiple factors
    const scoredSentences = sentences.map((sentence, index) => ({
      sentence,
      score: this.scoreSentence(sentence, title, sentences, index)
    }))

    // Sort by score and select top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(3, Math.ceil(sentences.length * this.config.extractiveRatio)))
      .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence)) // Restore original order

    const summary = topSentences.map(s => s.sentence).join(' ')

    // Ensure summary is within length limits
    if (summary.length > this.config.maxSummaryLength) {
      return summary.substring(0, this.config.maxSummaryLength - 3) + '...'
    }

    return summary
  }

  /**
   * Score individual sentences for extractive summarization
   */
  private scoreSentence(sentence: string, title: string, allSentences: string[], position: number): number {
    let score = 0

    // Length factor (prefer medium-length sentences)
    const wordCount = sentence.split(' ').length
    if (wordCount >= 8 && wordCount <= 25) score += 0.3
    else if (wordCount < 5) score -= 0.2

    // Position factor (first few sentences often important)
    if (position === 0) score += 0.4
    else if (position === 1) score += 0.3
    else if (position === 2) score += 0.2

    // Title similarity
    const titleWords = title.toLowerCase().split(' ')
    const sentenceWords = sentence.toLowerCase().split(' ')
    const overlap = titleWords.filter(word => sentenceWords.includes(word)).length
    if (overlap > 0) score += (overlap / titleWords.length) * 0.4

    // Numeric data (often important)
    if (sentence.match(/\d+/)) score += 0.2

    // Key phrases
    const keyPhrases = ['according to', 'research shows', 'study finds', 'announced', 'reported']
    if (keyPhrases.some(phrase => sentence.toLowerCase().includes(phrase))) {
      score += 0.3
    }

    // Avoid quotes and less informative sentences
    if (sentence.includes('"') && sentence.split('"').length > 2) score -= 0.2
    if (sentence.toLowerCase().includes('said') || sentence.toLowerCase().includes('says')) {
      score -= 0.1
    }

    return score
  }

  /**
   * Extract key points from content
   */
  private extractKeyPoints(text: string, entities: EnrichedEntity[]): string[] {
    const sentences = this.splitIntoSentences(text)
    const keyPoints: string[] = []

    // Extract sentences with key entities
    const importantEntities = entities
      .filter(e => e.confidence > 0.7)
      .slice(0, 5)

    for (const entity of importantEntities) {
      const relevantSentence = sentences.find(sentence => 
        sentence.includes(entity.name) && 
        sentence.length > 20 && 
        sentence.length < 150
      )
      
      if (relevantSentence && !keyPoints.includes(relevantSentence)) {
        keyPoints.push(relevantSentence)
      }
    }

    // Extract sentences with numbers (often key facts)
    const numericSentences = sentences.filter(sentence => 
      /\d+/.test(sentence) && 
      sentence.length > 15 && 
      sentence.length < 120
    ).slice(0, 2)

    keyPoints.push(...numericSentences.filter(s => !keyPoints.includes(s)))

    return keyPoints.slice(0, 5)
  }

  /**
   * Analyze sentiment of content
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    // Simple sentiment analysis using word lists
    const positiveWords = ['good', 'great', 'excellent', 'success', 'positive', 'growth', 'increase', 'improve', 'benefit', 'breakthrough']
    const negativeWords = ['bad', 'terrible', 'crisis', 'problem', 'decline', 'decrease', 'failure', 'concern', 'issue', 'threat']

    const words = text.toLowerCase().split(/\s+/)
    
    const positiveCount = words.filter(word => positiveWords.includes(word)).length
    const negativeCount = words.filter(word => negativeWords.includes(word)).length

    if (positiveCount > negativeCount + 1) return 'positive'
    if (negativeCount > positiveCount + 1) return 'negative'
    return 'neutral'
  }

  /**
   * Generate AI-powered summary with factuality checks
   */
  private async generateAISummary(
    article: DynamicArticle,
    content: ExtractedContent,
    extractiveSummary: string
  ): Promise<{
    summary: string
    factualityScore: number
    credibilityScore: number
    bias: 'left' | 'right' | 'center'
    sourceGrounding: SourceCitation[]
    warningFlags: string[]
  }> {
    
    // This would use the Gemini API for advanced summarization
    // For now, return enhanced extractive summary with mock AI analysis
    
    const summary = this.enhanceExtractiveSummary(extractiveSummary, content)
    
    // Mock AI analysis results
    const factualityScore = this.estimateFactualityScore(content, article)
    const credibilityScore = this.estimateCredibilityScore(article)
    const bias = this.detectBias(content.extractedText)
    const sourceGrounding = this.generateSourceGrounding(summary, content)
    const warningFlags = this.detectWarningFlags(content, article)

    return {
      summary,
      factualityScore,
      credibilityScore,
      bias,
      sourceGrounding,
      warningFlags
    }
  }

  /**
   * Enhance extractive summary with AI insights
   */
  private enhanceExtractiveSummary(extractiveSummary: string, content: ExtractedContent): string {
    // Add context and smooth transitions
    let enhanced = extractiveSummary

    // Add key context if missing
    if (!enhanced.includes(content.cleanTitle.split(' ')[0])) {
      enhanced = `Regarding ${content.cleanTitle.split(' ').slice(0, 3).join(' ')}: ${enhanced}`
    }

    // Ensure proper length
    if (enhanced.length < this.config.minSummaryLength) {
      const additionalContext = content.extractedKeywords.slice(0, 3).join(', ')
      enhanced += ` Key topics include: ${additionalContext}.`
    }

    return enhanced
  }

  /**
   * Estimate factuality score based on content analysis
   */
  private estimateFactualityScore(content: ExtractedContent, article: DynamicArticle): number {
    let score = 0.7 // baseline

    // Source reputation boost
    const domain = new URL(article.url).hostname.toLowerCase()
    const reputableSources = ['reuters.com', 'apnews.com', 'bbc.com', 'bloomberg.com']
    if (reputableSources.some(source => domain.includes(source))) {
      score += 0.2
    }

    // Presence of specific facts/numbers
    const hasNumbers = /\d+/.test(content.extractedText)
    if (hasNumbers) score += 0.1

    // Presence of citations or quotes
    const hasCitations = content.extractedText.includes('according to') || 
                        content.extractedText.includes('"')
    if (hasCitations) score += 0.1

    // Content length (longer articles often more factual)
    if (content.wordCount > 300) score += 0.05

    return Math.min(1, score)
  }

  /**
   * Estimate credibility score
   */
  private estimateCredibilityScore(article: DynamicArticle): number {
    let score = 0.6 // baseline

    // Author credibility
    if (article.author && article.author !== 'Unknown') {
      score += 0.1
    }

    // Source reputation
    const domain = new URL(article.url).hostname.toLowerCase()
    if (!domain.includes('blog') && !domain.includes('personal')) {
      score += 0.2
    }

    // Recent publication
    const ageHours = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
    if (ageHours < 24) score += 0.1

    return Math.min(1, score)
  }

  /**
   * Detect potential bias in content
   */
  private detectBias(text: string): 'left' | 'right' | 'center' {
    const leftIndicators = ['progressive', 'liberal', 'social justice', 'climate change', 'inequality']
    const rightIndicators = ['conservative', 'traditional', 'free market', 'security', 'law and order']

    const lowerText = text.toLowerCase()
    
    const leftScore = leftIndicators.filter(indicator => lowerText.includes(indicator)).length
    const rightScore = rightIndicators.filter(indicator => lowerText.includes(indicator)).length

    if (leftScore > rightScore + 1) return 'left'
    if (rightScore > leftScore + 1) return 'right'
    return 'center'
  }

  /**
   * Generate source grounding citations
   */
  private generateSourceGrounding(summary: string, content: ExtractedContent): SourceCitation[] {
    const citations: SourceCitation[] = []
    const summaryPoints = summary.split('. ')

    for (const point of summaryPoints) {
      if (point.length < 10) continue

      // Find supporting text in original content
      const sentences = this.splitIntoSentences(content.extractedText)
      const supportingSentence = sentences.find(sentence => 
        this.calculateTextSimilarity(point, sentence) > 0.3
      )

      if (supportingSentence) {
        citations.push({
          claim: point,
          sourceText: supportingSentence,
          confidence: 0.8
        })
      }
    }

    return citations.slice(0, 3) // Limit to top 3 citations
  }

  /**
   * Detect warning flags in content
   */
  private detectWarningFlags(content: ExtractedContent, article: DynamicArticle): string[] {
    const flags: string[] = []

    // Low content quality
    if (content.contentQuality === 'low') {
      flags.push('Low content quality detected')
    }

    // Very recent (might be unverified)
    const ageMinutes = (Date.now() - article.publishedAt.getTime()) / (1000 * 60)
    if (ageMinutes < 30) {
      flags.push('Very recent - information may be preliminary')
    }

    // Suspicious patterns
    const suspiciousPatterns = ['you won\'t believe', 'doctors hate this', 'one weird trick']
    if (suspiciousPatterns.some(pattern => content.extractedText.toLowerCase().includes(pattern))) {
      flags.push('Contains clickbait patterns')
    }

    // Low readability
    if (content.readabilityScore < 30) {
      flags.push('Complex or unclear writing')
    }

    return flags
  }

  /**
   * Calculate confidence score for summary
   */
  private calculateConfidenceScore(
    extractiveSummary: string,
    abstractiveSummary?: string,
    factualityScore: number = 0.5,
    entityCount: number = 0
  ): number {
    let confidence = 0.5

    // Length factor
    if (extractiveSummary.length >= this.config.minSummaryLength) {
      confidence += 0.2
    }

    // AI summary available
    if (abstractiveSummary) {
      confidence += 0.2
    }

    // High factuality
    if (factualityScore > 0.8) {
      confidence += 0.2
    }

    // Rich entity extraction
    if (entityCount > 3) {
      confidence += 0.1
    }

    return Math.min(1, confidence)
  }

  /**
   * Utility functions
   */

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }
}

/**
 * Fact-checking utilities
 */

export async function performFactCheck(
  claims: string[],
  sourceText: string,
  geminiApiKey?: string
): Promise<FactCheckResult[]> {
  // Simplified fact-checking - in production would use specialized fact-checking APIs
  
  const results: FactCheckResult[] = []

  for (const claim of claims) {
    const isSupported = sourceText.toLowerCase().includes(claim.toLowerCase())
    
    results.push({
      claim,
      verdict: isSupported ? 'supported' : 'uncertain',
      confidence: isSupported ? 0.8 : 0.3,
      reasoning: isSupported ? 'Claim found in source text' : 'Claim not directly supported',
      evidence: isSupported ? [sourceText] : []
    })
  }

  return results
}

/**
 * Source grounding verification
 */
export function verifySourceGrounding(
  summary: string,
  originalText: string,
  threshold: number = 0.3
): { isGrounded: boolean; coverage: number; citations: SourceCitation[] } {
  const summaryPoints = summary.split('. ').filter(p => p.length > 10)
  const originalSentences = originalText.split(/[.!?]+/).filter(s => s.length > 10)
  
  const citations: SourceCitation[] = []
  let groundedPoints = 0

  for (const point of summaryPoints) {
    let bestMatch = ''
    let bestSimilarity = 0

    for (const sentence of originalSentences) {
      const similarity = calculateJaccardSimilarity(point, sentence)
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity
        bestMatch = sentence
      }
    }

    if (bestSimilarity >= threshold) {
      groundedPoints++
      citations.push({
        claim: point,
        sourceText: bestMatch,
        confidence: bestSimilarity
      })
    }
  }

  const coverage = summaryPoints.length > 0 ? groundedPoints / summaryPoints.length : 0

  return {
    isGrounded: coverage >= 0.7,
    coverage,
    citations
  }
}

function calculateJaccardSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(text1.toLowerCase().split(/\s+/))
  const tokens2 = new Set(text2.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...tokens1].filter(x => tokens2.has(x)))
  const union = new Set([...tokens1, ...tokens2])
  
  return union.size > 0 ? intersection.size / union.size : 0
}
