/**
 * Content Extraction & Cleanup Service
 * Implements readability extraction, HTML sanitization, and content enhancement
 */

import { DynamicArticle } from '@/types'

// Content extraction configuration
const EXTRACTION_CONFIG = {
  maxContentLength: 5000,
  minContentLength: 100,
  imageQualityThreshold: 200, // min width/height for images
  bannedDomains: ['spam-site.com', 'clickbait.net'],
  suspiciousPatterns: [
    /click here/i,
    /you won't believe/i,
    /doctors hate this/i,
    /one weird trick/i
  ]
}

export interface ExtractedContent {
  cleanTitle: string
  cleanSummary: string
  extractedText: string
  mainImage?: string
  language: string
  wordCount: number
  readabilityScore: number
  contentQuality: 'high' | 'medium' | 'low'
  extractedEntities: string[]
  extractedKeywords: string[]
  canonicalUrl?: string
  ogTags: Record<string, string>
}

/**
 * Extract and clean content from article
 */
export async function extractAndCleanContent(
  article: DynamicArticle,
  fullHtml?: string
): Promise<ExtractedContent> {
  console.log(`🧹 Extracting content for: ${article.title}`)

  try {
    // 1. Clean and normalize title
    const cleanTitle = cleanTitle(article.title)
    
    // 2. Extract and clean summary
    const cleanSummary = cleanSummary(article.summary)
    
    // 3. Extract main content if full HTML provided
    let extractedText = cleanSummary
    if (fullHtml) {
      extractedText = await extractMainContent(fullHtml)
    }
    
    // 4. Detect language
    const language = detectLanguage(extractedText)
    
    // 5. Calculate readability metrics
    const wordCount = countWords(extractedText)
    const readabilityScore = calculateReadabilityScore(extractedText)
    
    // 6. Assess content quality
    const contentQuality = assessContentQuality(article, extractedText)
    
    // 7. Extract entities and keywords
    const extractedEntities = extractSimpleEntities(extractedText)
    const extractedKeywords = extractKeywords(extractedText)
    
    // 8. Extract Open Graph tags
    const ogTags = fullHtml ? extractOGTags(fullHtml) : {}
    
    // 9. Find canonical URL
    const canonicalUrl = fullHtml ? extractCanonicalUrl(fullHtml) : article.url
    
    // 10. Extract main image
    const mainImage = findMainImage(fullHtml, ogTags)

    const result: ExtractedContent = {
      cleanTitle,
      cleanSummary,
      extractedText,
      mainImage,
      language,
      wordCount,
      readabilityScore,
      contentQuality,
      extractedEntities,
      extractedKeywords,
      canonicalUrl,
      ogTags
    }

    console.log(`✅ Content extracted - Quality: ${contentQuality}, Words: ${wordCount}`)
    return result

  } catch (error) {
    console.error('❌ Content extraction failed:', error)
    
    // Return basic extraction as fallback
    return {
      cleanTitle: cleanTitle(article.title),
      cleanSummary: cleanSummary(article.summary),
      extractedText: article.summary || article.title,
      language: 'en',
      wordCount: countWords(article.summary || article.title),
      readabilityScore: 50,
      contentQuality: 'low',
      extractedEntities: [],
      extractedKeywords: [],
      ogTags: {}
    }
  }
}

/**
 * Clean and normalize article title
 */
function cleanTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ') // normalize whitespace
    .replace(/^(.*?)\s*[-|–—]\s*(.*)$/, '$1') // remove site names after dash
    .replace(/\[.*?\]|\(.*?\)/g, '') // remove brackets/parentheses
    .trim()
}

/**
 * Clean and normalize summary text
 */
function cleanSummary(summary: string): string {
  if (!summary) return ''
  
  return summary
    .trim()
    .replace(/\s+/g, ' ') // normalize whitespace
    .replace(/^.*?[:–-]\s*/, '') // remove prefixes
    .slice(0, 500) // limit length
    .trim()
}

/**
 * Extract main content from HTML using readability heuristics
 */
async function extractMainContent(html: string): Promise<string> {
  // Simple content extraction - in a real implementation, 
  // you'd use libraries like @mozilla/readability
  
  // Remove script and style tags
  let content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Extract text from paragraphs
  const paragraphs = content.match(/<p[^>]*>(.*?)<\/p>/gi) || []
  const mainText = paragraphs
    .map(p => p.replace(/<[^>]*>/g, '')) // strip HTML tags
    .filter(text => text.length > 20) // filter short paragraphs
    .join('\n\n')
  
  return mainText.slice(0, EXTRACTION_CONFIG.maxContentLength)
}

/**
 * Simple language detection
 */
function detectLanguage(text: string): string {
  // Simple heuristic - in production you'd use a proper language detection library
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  const words = text.toLowerCase().split(/\s+/).slice(0, 50)
  
  const englishWordCount = words.filter(word => englishWords.includes(word)).length
  const englishRatio = englishWordCount / Math.min(words.length, 50)
  
  return englishRatio > 0.3 ? 'en' : 'unknown'
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Calculate simple readability score (0-100)
 */
function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)
  
  if (sentences.length === 0 || words.length === 0) return 50
  
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length
  
  // Simplified Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  
  const vowels = word.match(/[aeiouy]+/g)
  const syllableCount = vowels ? vowels.length : 1
  
  // Adjust for common patterns
  if (word.endsWith('e')) return Math.max(1, syllableCount - 1)
  return Math.max(1, syllableCount)
}

/**
 * Assess overall content quality
 */
function assessContentQuality(
  article: DynamicArticle, 
  extractedText: string
): 'high' | 'medium' | 'low' {
  let qualityScore = 0
  
  // Check content length
  const wordCount = countWords(extractedText)
  if (wordCount > 200) qualityScore += 2
  else if (wordCount > 50) qualityScore += 1
  
  // Check for suspicious patterns
  const hasSuspiciousContent = EXTRACTION_CONFIG.suspiciousPatterns.some(
    pattern => pattern.test(article.title) || pattern.test(extractedText)
  )
  if (hasSuspiciousContent) qualityScore -= 2
  
  // Check source reputation (basic)
  const domain = new URL(article.url).hostname
  if (EXTRACTION_CONFIG.bannedDomains.includes(domain)) qualityScore -= 3
  
  // Check for proper capitalization
  const hasProperCapitalization = /^[A-Z]/.test(article.title)
  if (hasProperCapitalization) qualityScore += 1
  
  // Check for complete sentences
  const hasCompleteSentences = extractedText.includes('.')
  if (hasCompleteSentences) qualityScore += 1
  
  if (qualityScore >= 3) return 'high'
  if (qualityScore >= 0) return 'medium'
  return 'low'
}

/**
 * Extract named entities (simple implementation)
 */
function extractSimpleEntities(text: string): string[] {
  const entities: string[] = []
  
  // Extract capitalized words (potential proper nouns)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []
  
  // Filter and deduplicate
  const uniqueEntities = [...new Set(capitalizedWords)]
    .filter(entity => entity.length > 2 && entity.length < 50)
    .slice(0, 10) // limit to top 10
  
  return uniqueEntities
}

/**
 * Extract keywords using simple TF-IDF approximation
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'a', 'an', 'as', 'are', 'was', 'is', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
  ])
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
  
  // Count word frequencies
  const wordCounts = new Map<string, number>()
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
  })
  
  // Sort by frequency and return top keywords
  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word)
}

/**
 * Extract Open Graph tags from HTML
 */
function extractOGTags(html: string): Record<string, string> {
  const ogTags: Record<string, string> = {}
  
  const ogRegex = /<meta\s+property="og:([^"]+)"\s+content="([^"]+)"/gi
  let match
  
  while ((match = ogRegex.exec(html)) !== null) {
    ogTags[match[1]] = match[2]
  }
  
  return ogTags
}

/**
 * Extract canonical URL from HTML
 */
function extractCanonicalUrl(html: string): string | undefined {
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)
  return canonicalMatch ? canonicalMatch[1] : undefined
}

/**
 * Find main image from HTML and OG tags
 */
function findMainImage(html?: string, ogTags: Record<string, string> = {}): string | undefined {
  // Try OG image first
  if (ogTags.image) return ogTags.image
  
  if (!html) return undefined
  
  // Find images in HTML
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi
  const images: string[] = []
  let match
  
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1])
  }
  
  // Return first reasonable image
  return images.find(img => 
    !img.includes('icon') && 
    !img.includes('logo') && 
    !img.includes('avatar') &&
    (img.includes('http') || img.startsWith('/'))
  )
}

/**
 * Check if article needs full content extraction
 */
export function shouldExtractFullContent(article: DynamicArticle): boolean {
  // Extract full content for high-value articles
  return (
    article.popularityScore > 0.7 ||
    (article.relevanceScore && article.relevanceScore > 0.8) ||
    article.sourceName.toLowerCase().includes('reuters') ||
    article.sourceName.toLowerCase().includes('associated press')
  )
}

/**
 * Fetch full HTML content for extraction
 */
export async function fetchFullContent(url: string): Promise<string | null> {
  try {
    // In a real implementation, you'd use a proper web scraping service
    // For now, return null to skip full content extraction
    console.log(`🌐 Would fetch full content for: ${url}`)
    return null
  } catch (error) {
    console.error('❌ Failed to fetch full content:', error)
    return null
  }
}
