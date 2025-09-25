/**
 * Safety Filters & Abuse Detection System
 * Implements content safety, abuse detection, and quality control
 */

import { DynamicArticle } from '@/types'
import { ExtractedContent } from './contentExtraction'

export interface SafetyResult {
  isContentSafe: boolean
  safetyScore: number // 0-1, higher is safer
  flags: SafetyFlag[]
  recommendation: 'allow' | 'flag' | 'block'
  confidence: number
}

export interface SafetyFlag {
  type: SafetyFlagType
  severity: 'low' | 'medium' | 'high' | 'critical'
  reason: string
  confidence: number
  location?: string // Where in content the flag was triggered
}

export type SafetyFlagType = 
  | 'profanity'
  | 'hate_speech'
  | 'violence'
  | 'sexual_content'
  | 'misinformation'
  | 'spam'
  | 'clickbait'
  | 'low_quality'
  | 'ai_generated'
  | 'duplicate'
  | 'copyright'
  | 'malicious_link'
  | 'privacy_violation'

export interface AbuseDetectionResult {
  isAbusive: boolean
  abuseScore: number
  abuseTypes: AbuseType[]
  sourceReputationImpact: number
  recommendation: 'allow' | 'review' | 'block' | 'shadowban'
}

export type AbuseType = 
  | 'content_farm'
  | 'bot_generated'
  | 'plagiarism'
  | 'manipulation'
  | 'bias'
  | 'sensationalism'
  | 'conspiracy'

export interface QualityAssessment {
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor'
  qualityScore: number
  factors: QualityFactor[]
  recommendations: string[]
}

export interface QualityFactor {
  factor: string
  score: number
  weight: number
  description: string
}

export interface ContentModerationConfig {
  strictnessLevel: 'permissive' | 'balanced' | 'strict'
  enabledFilters: SafetyFlagType[]
  customKeywords: {
    block: string[]
    flag: string[]
  }
  trustedSources: string[]
  blockedSources: string[]
  autoModerationThreshold: number
  humanReviewThreshold: number
}

const DEFAULT_CONFIG: ContentModerationConfig = {
  strictnessLevel: 'balanced',
  enabledFilters: [
    'profanity', 'hate_speech', 'violence', 'misinformation', 
    'spam', 'clickbait', 'low_quality'
  ],
  customKeywords: {
    block: [],
    flag: []
  },
  trustedSources: [
    'reuters.com', 'apnews.com', 'bbc.com', 'bloomberg.com',
    'wsj.com', 'nytimes.com', 'theguardian.com'
  ],
  blockedSources: [],
  autoModerationThreshold: 0.8,
  humanReviewThreshold: 0.6
}

/**
 * Safety & Abuse Detection Engine
 */
export class SafetyEngine {
  private config: ContentModerationConfig

  constructor(config: ContentModerationConfig = DEFAULT_CONFIG) {
    this.config = config
  }

  /**
   * Comprehensive safety check for article
   */
  async checkContentSafety(
    article: DynamicArticle,
    extractedContent: ExtractedContent
  ): Promise<SafetyResult> {
    console.log(`🛡️ Safety check for: ${article.title}`)

    const flags: SafetyFlag[] = []
    let totalSeverityScore = 0

    // Run all enabled safety filters
    for (const filterType of this.config.enabledFilters) {
      const filterFlags = await this.runSafetyFilter(filterType, article, extractedContent)
      flags.push(...filterFlags)
      
      // Accumulate severity scores
      totalSeverityScore += filterFlags.reduce((sum, flag) => {
        const severityValues = { low: 0.25, medium: 0.5, high: 0.75, critical: 1.0 }
        return sum + severityValues[flag.severity] * flag.confidence
      }, 0)
    }

    // Calculate overall safety score
    const maxPossibleScore = this.config.enabledFilters.length
    const safetyScore = Math.max(0, 1 - (totalSeverityScore / maxPossibleScore))

    // Determine recommendation
    const recommendation = this.getSafetyRecommendation(safetyScore, flags)

    // Calculate confidence
    const confidence = this.calculateSafetyConfidence(flags)

    const result: SafetyResult = {
      isContentSafe: recommendation === 'allow',
      safetyScore,
      flags,
      recommendation,
      confidence
    }

    console.log(`🛡️ Safety check complete - Score: ${safetyScore.toFixed(2)}, Recommendation: ${recommendation}`)
    return result
  }

  /**
   * Detect various forms of content abuse
   */
  async detectAbuse(
    article: DynamicArticle,
    extractedContent: ExtractedContent
  ): Promise<AbuseDetectionResult> {
    console.log(`🚨 Abuse detection for: ${article.title}`)

    const abuseTypes: AbuseType[] = []
    let abuseScore = 0

    // Check for content farm patterns
    if (this.isContentFarm(article, extractedContent)) {
      abuseTypes.push('content_farm')
      abuseScore += 0.4
    }

    // Check for bot-generated content
    if (this.isBotGenerated(article, extractedContent)) {
      abuseTypes.push('bot_generated')
      abuseScore += 0.3
    }

    // Check for plagiarism indicators
    if (this.hasPlagiarismIndicators(extractedContent)) {
      abuseTypes.push('plagiarism')
      abuseScore += 0.5
    }

    // Check for manipulation tactics
    if (this.hasManipulationTactics(article, extractedContent)) {
      abuseTypes.push('manipulation')
      abuseScore += 0.4
    }

    // Check for extreme bias
    if (this.hasExtremeBias(extractedContent)) {
      abuseTypes.push('bias')
      abuseScore += 0.3
    }

    // Check for sensationalism
    if (this.isSensationalized(article, extractedContent)) {
      abuseTypes.push('sensationalism')
      abuseScore += 0.2
    }

    // Check for conspiracy theories
    if (this.hasConspiracyIndicators(extractedContent)) {
      abuseTypes.push('conspiracy')
      abuseScore += 0.6
    }

    // Calculate source reputation impact
    const sourceReputationImpact = this.calculateSourceReputationImpact(abuseTypes, abuseScore)

    // Determine recommendation
    const recommendation = this.getAbuseRecommendation(abuseScore, abuseTypes)

    const result: AbuseDetectionResult = {
      isAbusive: abuseScore > 0.5,
      abuseScore: Math.min(1, abuseScore),
      abuseTypes,
      sourceReputationImpact,
      recommendation
    }

    console.log(`🚨 Abuse detection complete - Score: ${result.abuseScore.toFixed(2)}, Types: ${abuseTypes.join(', ')}`)
    return result
  }

  /**
   * Assess overall content quality
   */
  async assessQuality(
    article: DynamicArticle,
    extractedContent: ExtractedContent
  ): Promise<QualityAssessment> {
    const factors: QualityFactor[] = []

    // Writing quality
    const writingQuality = this.assessWritingQuality(extractedContent)
    factors.push({
      factor: 'Writing Quality',
      score: writingQuality,
      weight: 0.25,
      description: 'Grammar, readability, and structure'
    })

    // Information density
    const informationDensity = this.assessInformationDensity(extractedContent)
    factors.push({
      factor: 'Information Density',
      score: informationDensity,
      weight: 0.2,
      description: 'Amount of meaningful information'
    })

    // Source credibility
    const sourceCredibility = this.assessSourceCredibility(article)
    factors.push({
      factor: 'Source Credibility',
      score: sourceCredibility,
      weight: 0.2,
      description: 'Reputation and trustworthiness of source'
    })

    // Factual accuracy indicators
    const factualAccuracy = this.assessFactualAccuracy(extractedContent)
    factors.push({
      factor: 'Factual Accuracy',
      score: factualAccuracy,
      weight: 0.15,
      description: 'Presence of verifiable facts and citations'
    })

    // Timeliness and relevance
    const timeliness = this.assessTimeliness(article)
    factors.push({
      factor: 'Timeliness',
      score: timeliness,
      weight: 0.1,
      description: 'Recency and ongoing relevance'
    })

    // Uniqueness
    const uniqueness = this.assessUniqueness(extractedContent)
    factors.push({
      factor: 'Uniqueness',
      score: uniqueness,
      weight: 0.1,
      description: 'Original content vs. rehashed information'
    })

    // Calculate weighted quality score
    const qualityScore = factors.reduce((sum, factor) => 
      sum + (factor.score * factor.weight), 0
    )

    // Determine overall quality rating
    let overallQuality: QualityAssessment['overallQuality']
    if (qualityScore >= 0.8) overallQuality = 'excellent'
    else if (qualityScore >= 0.6) overallQuality = 'good'
    else if (qualityScore >= 0.4) overallQuality = 'fair'
    else overallQuality = 'poor'

    // Generate recommendations
    const recommendations = this.generateQualityRecommendations(factors)

    return {
      overallQuality,
      qualityScore,
      factors,
      recommendations
    }
  }

  /**
   * Run specific safety filter
   */
  private async runSafetyFilter(
    filterType: SafetyFlagType,
    article: DynamicArticle,
    content: ExtractedContent
  ): Promise<SafetyFlag[]> {
    const flags: SafetyFlag[] = []

    switch (filterType) {
      case 'profanity':
        flags.push(...this.checkProfanity(content))
        break
      case 'hate_speech':
        flags.push(...this.checkHateSpeech(content))
        break
      case 'violence':
        flags.push(...this.checkViolence(content))
        break
      case 'sexual_content':
        flags.push(...this.checkSexualContent(content))
        break
      case 'misinformation':
        flags.push(...this.checkMisinformation(content))
        break
      case 'spam':
        flags.push(...this.checkSpam(article, content))
        break
      case 'clickbait':
        flags.push(...this.checkClickbait(article))
        break
      case 'low_quality':
        flags.push(...this.checkLowQuality(content))
        break
      case 'ai_generated':
        flags.push(...this.checkAIGenerated(content))
        break
      case 'malicious_link':
        flags.push(...this.checkMaliciousLinks(article))
        break
    }

    return flags
  }

  /**
   * Individual safety check methods
   */

  private checkProfanity(content: ExtractedContent): SafetyFlag[] {
    const profanityWords = [
      'damn', 'shit', 'fuck', 'bitch', 'asshole', 'bastard'
      // Add more as needed - this is a basic list
    ]

    const text = `${content.cleanTitle} ${content.extractedText}`.toLowerCase()
    const flags: SafetyFlag[] = []

    for (const word of profanityWords) {
      if (text.includes(word)) {
        flags.push({
          type: 'profanity',
          severity: 'low',
          reason: `Contains profanity: "${word}"`,
          confidence: 0.8,
          location: 'content'
        })
      }
    }

    return flags
  }

  private checkHateSpeech(content: ExtractedContent): SafetyFlag[] {
    const hateSpeechPatterns = [
      /\b(hate|despise|loathe)\s+(all|every)\s+\w+/i,
      /\b\w+\s+(are|is)\s+(inferior|subhuman|animals)/i,
      /\b(kill|eliminate|destroy)\s+(all|every)\s+\w+/i
    ]

    const text = `${content.cleanTitle} ${content.extractedText}`
    const flags: SafetyFlag[] = []

    for (const pattern of hateSpeechPatterns) {
      if (pattern.test(text)) {
        flags.push({
          type: 'hate_speech',
          severity: 'high',
          reason: 'Contains potential hate speech patterns',
          confidence: 0.7
        })
      }
    }

    return flags
  }

  private checkViolence(content: ExtractedContent): SafetyFlag[] {
    const violenceKeywords = [
      'murder', 'kill', 'assassination', 'terrorist', 'bomb', 'explosion',
      'massacre', 'genocide', 'torture', 'violent', 'bloodshed'
    ]

    const text = `${content.cleanTitle} ${content.extractedText}`.toLowerCase()
    const flags: SafetyFlag[] = []
    let violenceScore = 0

    for (const keyword of violenceKeywords) {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length
      violenceScore += matches
    }

    if (violenceScore > 3) {
      flags.push({
        type: 'violence',
        severity: 'medium',
        reason: `High concentration of violence-related terms (${violenceScore} instances)`,
        confidence: 0.6
      })
    }

    return flags
  }

  private checkSexualContent(content: ExtractedContent): SafetyFlag[] {
    const sexualKeywords = [
      'porn', 'sex', 'nude', 'naked', 'adult content', 'explicit'
    ]

    const text = `${content.cleanTitle} ${content.extractedText}`.toLowerCase()
    const flags: SafetyFlag[] = []

    for (const keyword of sexualKeywords) {
      if (text.includes(keyword)) {
        flags.push({
          type: 'sexual_content',
          severity: 'medium',
          reason: `Contains sexual content keywords: "${keyword}"`,
          confidence: 0.5
        })
      }
    }

    return flags
  }

  private checkMisinformation(content: ExtractedContent): SafetyFlag[] {
    const misinformationIndicators = [
      /\b(they don't want you to know|hidden truth|secret|conspiracy)/i,
      /\b(doctors hate this|scientists don't want)/i,
      /\b(proven to be false|debunked|hoax)/i,
      /\b(alternative facts|fake news)/i
    ]

    const text = `${content.cleanTitle} ${content.extractedText}`
    const flags: SafetyFlag[] = []

    for (const pattern of misinformationIndicators) {
      if (pattern.test(text)) {
        flags.push({
          type: 'misinformation',
          severity: 'high',
          reason: 'Contains potential misinformation indicators',
          confidence: 0.6
        })
      }
    }

    return flags
  }

  private checkSpam(article: DynamicArticle, content: ExtractedContent): SafetyFlag[] {
    const flags: SafetyFlag[] = []

    // Check for excessive capitalization
    const uppercaseRatio = (article.title.match(/[A-Z]/g) || []).length / article.title.length
    if (uppercaseRatio > 0.5) {
      flags.push({
        type: 'spam',
        severity: 'medium',
        reason: 'Excessive capitalization in title',
        confidence: 0.7
      })
    }

    // Check for repeated phrases
    const words = content.extractedText.split(' ')
    const repeatedPhrases = this.findRepeatedPhrases(words)
    if (repeatedPhrases.length > 3) {
      flags.push({
        type: 'spam',
        severity: 'medium',
        reason: 'Excessive repetition of phrases',
        confidence: 0.6
      })
    }

    return flags
  }

  private checkClickbait(article: DynamicArticle): SafetyFlag[] {
    const clickbaitPatterns = [
      /\b(you won't believe|shocking|amazing|incredible)\b/i,
      /\b(this will change your life|doctors hate this)\b/i,
      /\b(one weird trick|secret that)\b/i,
      /\b(number \d+ will shock you)\b/i,
      /\?\s*$/ // Ends with question mark
    ]

    const flags: SafetyFlag[] = []

    for (const pattern of clickbaitPatterns) {
      if (pattern.test(article.title)) {
        flags.push({
          type: 'clickbait',
          severity: 'low',
          reason: 'Title contains clickbait patterns',
          confidence: 0.8
        })
        break // Only flag once for clickbait
      }
    }

    return flags
  }

  private checkLowQuality(content: ExtractedContent): SafetyFlag[] {
    const flags: SafetyFlag[] = []

    // Check content length
    if (content.wordCount < 50) {
      flags.push({
        type: 'low_quality',
        severity: 'medium',
        reason: 'Very short content (less than 50 words)',
        confidence: 0.9
      })
    }

    // Check readability
    if (content.readabilityScore < 20) {
      flags.push({
        type: 'low_quality',
        severity: 'low',
        reason: 'Poor readability score',
        confidence: 0.6
      })
    }

    return flags
  }

  private checkAIGenerated(content: ExtractedContent): SafetyFlag[] {
    const aiIndicators = [
      /\b(as an ai|i am an artificial intelligence)\b/i,
      /\b(generated by ai|ai-generated)\b/i,
      /\b(according to my training data)\b/i
    ]

    const text = content.extractedText
    const flags: SafetyFlag[] = []

    for (const pattern of aiIndicators) {
      if (pattern.test(text)) {
        flags.push({
          type: 'ai_generated',
          severity: 'low',
          reason: 'Contains AI-generated content indicators',
          confidence: 0.8
        })
        break
      }
    }

    return flags
  }

  private checkMaliciousLinks(article: DynamicArticle): SafetyFlag[] {
    const flags: SafetyFlag[] = []
    
    // Check for suspicious domains
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 't.co' // Shortened URLs can be suspicious
    ]

    try {
      const domain = new URL(article.url).hostname.toLowerCase()
      if (suspiciousDomains.some(suspicious => domain.includes(suspicious))) {
        flags.push({
          type: 'malicious_link',
          severity: 'medium',
          reason: 'Contains shortened or potentially suspicious URL',
          confidence: 0.5
        })
      }
    } catch (error) {
      flags.push({
        type: 'malicious_link',
        severity: 'high',
        reason: 'Invalid or malformed URL',
        confidence: 0.9
      })
    }

    return flags
  }

  /**
   * Abuse detection helper methods
   */

  private isContentFarm(article: DynamicArticle, content: ExtractedContent): boolean {
    // Check for content farm indicators
    const contentFarmSigns = [
      content.wordCount < 200, // Very short articles
      article.author === 'Unknown' || !article.author, // No byline
      content.extractedKeywords.length < 3, // Low keyword density
      article.title.split(' ').length < 5 // Very short titles
    ]

    return contentFarmSigns.filter(Boolean).length >= 2
  }

  private isBotGenerated(article: DynamicArticle, content: ExtractedContent): boolean {
    // Check for bot generation patterns
    const botIndicators = [
      /\b(generated automatically|auto-generated)\b/i.test(content.extractedText),
      /\b(this article was created by|powered by)\b/i.test(content.extractedText),
      content.readabilityScore > 90, // Suspiciously perfect readability
      !article.author || article.author.toLowerCase().includes('bot')
    ]

    return botIndicators.filter(Boolean).length >= 2
  }

  private hasPlagiarismIndicators(content: ExtractedContent): boolean {
    // Simple plagiarism detection (in production, would use more sophisticated methods)
    const sentences = content.extractedText.split(/[.!?]+/)
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()))
    
    // High repetition might indicate copying
    return sentences.length > 5 && uniqueSentences.size < sentences.length * 0.7
  }

  private hasManipulationTactics(article: DynamicArticle, content: ExtractedContent): boolean {
    const manipulationPatterns = [
      /\b(act now|limited time|urgent|hurry)\b/i,
      /\b(don't let them|they don't want)\b/i,
      /\b(everyone is talking about|viral|trending now)\b/i
    ]

    const text = `${article.title} ${content.extractedText}`
    return manipulationPatterns.some(pattern => pattern.test(text))
  }

  private hasExtremeBias(content: ExtractedContent): boolean {
    const extremeLanguage = [
      'always', 'never', 'all', 'none', 'completely', 'totally',
      'absolutely', 'definitely', 'certainly', 'obviously'
    ]

    const words = content.extractedText.toLowerCase().split(/\s+/)
    const extremeCount = words.filter(word => extremeLanguage.includes(word)).length

    return extremeCount > words.length * 0.05 // More than 5% extreme language
  }

  private isSensationalized(article: DynamicArticle, content: ExtractedContent): boolean {
    const sensationalWords = [
      'shocking', 'stunning', 'amazing', 'incredible', 'unbelievable',
      'explosive', 'bombshell', 'devastating', 'jaw-dropping'
    ]

    const title = article.title.toLowerCase()
    return sensationalWords.some(word => title.includes(word))
  }

  private hasConspiracyIndicators(content: ExtractedContent): boolean {
    const conspiracyPatterns = [
      /\b(deep state|illuminati|new world order)\b/i,
      /\b(cover[- ]?up|conspiracy|hidden agenda)\b/i,
      /\b(wake up|sheep|sheeple)\b/i,
      /\b(false flag|inside job)\b/i
    ]

    const text = content.extractedText
    return conspiracyPatterns.some(pattern => pattern.test(text))
  }

  /**
   * Quality assessment helper methods
   */

  private assessWritingQuality(content: ExtractedContent): number {
    let score = 0.5 // Base score

    // Readability
    if (content.readabilityScore > 60) score += 0.2
    else if (content.readabilityScore < 30) score -= 0.2

    // Proper capitalization
    if (/^[A-Z]/.test(content.cleanTitle)) score += 0.1

    // Sentence structure variety
    const sentences = content.extractedText.split(/[.!?]+/)
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length
    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 0.1

    // Grammar indicators (simplified)
    const grammarErrors = (content.extractedText.match(/\b(your|you're)\b/g) || []).length
    if (grammarErrors === 0) score += 0.1

    return Math.max(0, Math.min(1, score))
  }

  private assessInformationDensity(content: ExtractedContent): number {
    let score = 0.5

    // Keyword richness
    if (content.extractedKeywords.length > 5) score += 0.2
    
    // Entity richness
    if (content.extractedEntities.length > 3) score += 0.2

    // Factual content indicators
    const hasNumbers = /\d+/.test(content.extractedText)
    const hasPercentages = /%/.test(content.extractedText)
    const hasDates = /\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{4})\b/i.test(content.extractedText)
    
    if (hasNumbers) score += 0.1
    if (hasPercentages) score += 0.1
    if (hasDates) score += 0.1

    return Math.max(0, Math.min(1, score))
  }

  private assessSourceCredibility(article: DynamicArticle): number {
    const domain = new URL(article.url).hostname.toLowerCase()
    
    if (this.config.trustedSources.some(source => domain.includes(source))) {
      return 0.9
    }

    if (this.config.blockedSources.some(source => domain.includes(source))) {
      return 0.1
    }

    // Default scoring based on domain characteristics
    let score = 0.5

    if (domain.includes('.edu') || domain.includes('.gov')) score += 0.3
    if (domain.includes('.org')) score += 0.2
    if (domain.includes('blog') || domain.includes('personal')) score -= 0.2
    if (domain.split('.').length > 3) score -= 0.1 // Subdomain penalty

    return Math.max(0, Math.min(1, score))
  }

  private assessFactualAccuracy(content: ExtractedContent): number {
    let score = 0.5

    // Citation indicators
    const hasCitations = /\b(according to|source:|via|reports)\b/i.test(content.extractedText)
    if (hasCitations) score += 0.2

    // Quote indicators
    const hasQuotes = content.extractedText.includes('"')
    if (hasQuotes) score += 0.1

    // Specific facts
    const hasSpecificFacts = /\b\d+(\.\d+)?%?\b/.test(content.extractedText)
    if (hasSpecificFacts) score += 0.2

    return Math.max(0, Math.min(1, score))
  }

  private assessTimeliness(article: DynamicArticle): number {
    const ageInHours = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
    
    if (ageInHours < 24) return 1.0
    if (ageInHours < 72) return 0.8
    if (ageInHours < 168) return 0.6
    if (ageInHours < 720) return 0.4
    return 0.2
  }

  private assessUniqueness(content: ExtractedContent): number {
    // Simple uniqueness assessment
    // In production, would compare against existing content database
    
    let score = 0.7 // Assume reasonably unique by default

    // Check for generic content patterns
    const genericPhrases = [
      'in this article', 'as we all know', 'it is important to note',
      'studies have shown', 'experts say'
    ]

    const genericCount = genericPhrases.filter(phrase => 
      content.extractedText.toLowerCase().includes(phrase)
    ).length

    score -= genericCount * 0.1

    return Math.max(0.1, Math.min(1, score))
  }

  /**
   * Helper methods
   */

  private findRepeatedPhrases(words: string[]): string[] {
    const phrases = new Map<string, number>()
    
    // Check 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ').toLowerCase()
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1)
    }

    return Array.from(phrases.entries())
      .filter(([, count]) => count > 2)
      .map(([phrase]) => phrase)
  }

  private getSafetyRecommendation(
    safetyScore: number, 
    flags: SafetyFlag[]
  ): 'allow' | 'flag' | 'block' {
    const criticalFlags = flags.filter(f => f.severity === 'critical')
    const highFlags = flags.filter(f => f.severity === 'high')

    if (criticalFlags.length > 0) return 'block'
    if (highFlags.length > 1 || safetyScore < 0.3) return 'block'
    if (safetyScore < 0.6 || flags.length > 2) return 'flag'
    return 'allow'
  }

  private getAbuseRecommendation(
    abuseScore: number, 
    abuseTypes: AbuseType[]
  ): 'allow' | 'review' | 'block' | 'shadowban' {
    if (abuseScore > 0.8) return 'block'
    if (abuseTypes.includes('misinformation') || abuseTypes.includes('conspiracy')) return 'block'
    if (abuseScore > 0.6) return 'shadowban'
    if (abuseScore > 0.4) return 'review'
    return 'allow'
  }

  private calculateSourceReputationImpact(abuseTypes: AbuseType[], abuseScore: number): number {
    let impact = 0

    if (abuseTypes.includes('content_farm')) impact += 0.3
    if (abuseTypes.includes('plagiarism')) impact += 0.4
    if (abuseTypes.includes('misinformation')) impact += 0.5

    return Math.min(1, impact + abuseScore * 0.2)
  }

  private calculateSafetyConfidence(flags: SafetyFlag[]): number {
    if (flags.length === 0) return 0.8

    const avgConfidence = flags.reduce((sum, flag) => sum + flag.confidence, 0) / flags.length
    return avgConfidence
  }

  private generateQualityRecommendations(factors: QualityFactor[]): string[] {
    const recommendations: string[] = []
    
    factors.forEach(factor => {
      if (factor.score < 0.5) {
        switch (factor.factor) {
          case 'Writing Quality':
            recommendations.push('Improve readability and grammar')
            break
          case 'Information Density':
            recommendations.push('Add more factual content and specific details')
            break
          case 'Source Credibility':
            recommendations.push('Verify source reputation and authority')
            break
          case 'Factual Accuracy':
            recommendations.push('Include more citations and verifiable facts')
            break
        }
      }
    })

    return recommendations.slice(0, 3) // Limit to top 3 recommendations
  }
}
