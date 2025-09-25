/**
 * Deduplication & Event Clustering Service
 * Implements near-duplicate detection and event grouping for news articles
 */

import { DynamicArticle } from '@/types'

export interface ArticleCluster {
  id: string
  representativeArticle: DynamicArticle
  members: DynamicArticle[]
  clusterScore: number
  topic: string
  createdAt: Date
  updatedAt: Date
  velocity: number // How fast the cluster is growing
}

export interface DuplicateResult {
  isDuplicate: boolean
  similarity: number
  duplicateOf?: string
  reasoning: string
}

export interface ClusteringResult {
  clusters: ArticleCluster[]
  unclustered: DynamicArticle[]
  duplicatesRemoved: number
  clustersFormed: number
}

// Configuration
const DEDUP_CONFIG = {
  titleSimilarityThreshold: 0.85,
  contentSimilarityThreshold: 0.75,
  urlSimilarityThreshold: 0.90,
  clusterSimilarityThreshold: 0.70,
  maxClusterSize: 10,
  maxClustersToCheck: 50,
  timeWindowHours: 72, // Only cluster articles within 72 hours
}

/**
 * Main deduplication and clustering function
 */
export async function deduplicateAndCluster(
  articles: DynamicArticle[],
  existingClusters: ArticleCluster[] = []
): Promise<ClusteringResult> {
  console.log(`🔍 Deduplicating ${articles.length} articles and ${existingClusters.length} existing clusters`)

  try {
    // Step 1: Remove exact duplicates
    const { unique: uniqueArticles, duplicatesRemoved } = removeExactDuplicates(articles)
    console.log(`📝 Removed ${duplicatesRemoved} exact duplicates`)

    // Step 2: Detect near-duplicates
    const { articles: dedupedArticles, duplicates } = await detectNearDuplicates(uniqueArticles)
    console.log(`🔍 Detected ${duplicates.length} near-duplicates`)

    // Step 3: Cluster articles into events
    const { clusters, unclustered } = await clusterIntoEvents(dedupedArticles, existingClusters)
    console.log(`📊 Formed ${clusters.length} clusters, ${unclustered.length} unclustered`)

    // Step 4: Update cluster metrics
    const updatedClusters = updateClusterMetrics(clusters)

    return {
      clusters: updatedClusters,
      unclustered,
      duplicatesRemoved: duplicatesRemoved + duplicates.length,
      clustersFormed: clusters.length
    }

  } catch (error) {
    console.error('❌ Deduplication failed:', error)
    return {
      clusters: existingClusters,
      unclustered: articles,
      duplicatesRemoved: 0,
      clustersFormed: 0
    }
  }
}

/**
 * Remove exact duplicates based on URL and title
 */
function removeExactDuplicates(articles: DynamicArticle[]): { unique: DynamicArticle[], duplicatesRemoved: number } {
  const seen = new Set<string>()
  const unique: DynamicArticle[] = []
  let duplicatesRemoved = 0

  for (const article of articles) {
    // Create a key from normalized URL and title
    const normalizedUrl = normalizeUrl(article.url)
    const normalizedTitle = article.title.toLowerCase().trim()
    const key = `${normalizedUrl}::${normalizedTitle}`

    if (!seen.has(key)) {
      seen.add(key)
      unique.push(article)
    } else {
      duplicatesRemoved++
      console.log(`🗑️  Exact duplicate: ${article.title}`)
    }
  }

  return { unique, duplicatesRemoved }
}

/**
 * Detect near-duplicates using similarity algorithms
 */
async function detectNearDuplicates(articles: DynamicArticle[]): Promise<{ articles: DynamicArticle[], duplicates: DynamicArticle[] }> {
  const unique: DynamicArticle[] = []
  const duplicates: DynamicArticle[] = []

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    let isDuplicate = false

    // Check against already processed unique articles
    for (const uniqueArticle of unique) {
      const similarity = calculateArticleSimilarity(article, uniqueArticle)
      
      if (similarity.isDuplicate) {
        duplicates.push(article)
        isDuplicate = true
        console.log(`🔍 Near duplicate found: "${article.title}" similar to "${uniqueArticle.title}" (${similarity.similarity.toFixed(2)})`)
        break
      }
    }

    if (!isDuplicate) {
      unique.push(article)
    }
  }

  return { articles: unique, duplicates }
}

/**
 * Calculate similarity between two articles
 */
function calculateArticleSimilarity(article1: DynamicArticle, article2: DynamicArticle): DuplicateResult {
  // 1. URL similarity (highest weight)
  const urlSimilarity = calculateUrlSimilarity(article1.url, article2.url)
  if (urlSimilarity > DEDUP_CONFIG.urlSimilarityThreshold) {
    return {
      isDuplicate: true,
      similarity: urlSimilarity,
      duplicateOf: article2.id,
      reasoning: 'URL similarity'
    }
  }

  // 2. Title similarity
  const titleSimilarity = calculateTextSimilarity(article1.title, article2.title)
  
  // 3. Content similarity
  const contentSimilarity = calculateTextSimilarity(
    article1.summary || '', 
    article2.summary || ''
  )

  // 4. Time proximity (articles should be close in time)
  const timeDiff = Math.abs(article1.publishedAt.getTime() - article2.publishedAt.getTime())
  const timeProximity = Math.max(0, 1 - (timeDiff / (24 * 60 * 60 * 1000))) // 24 hour window

  // 5. Source similarity
  const sourceSimilarity = article1.sourceName === article2.sourceName ? 1 : 0

  // Weighted combination
  const overallSimilarity = (
    titleSimilarity * 0.4 +
    contentSimilarity * 0.3 +
    timeProximity * 0.2 +
    sourceSimilarity * 0.1
  )

  const isDuplicate = (
    titleSimilarity > DEDUP_CONFIG.titleSimilarityThreshold ||
    (titleSimilarity > 0.7 && contentSimilarity > DEDUP_CONFIG.contentSimilarityThreshold)
  )

  return {
    isDuplicate,
    similarity: overallSimilarity,
    duplicateOf: isDuplicate ? article2.id : undefined,
    reasoning: isDuplicate ? 
      `Title: ${titleSimilarity.toFixed(2)}, Content: ${contentSimilarity.toFixed(2)}` :
      'Below similarity threshold'
  }
}

/**
 * Cluster articles into events
 */
async function clusterIntoEvents(
  articles: DynamicArticle[], 
  existingClusters: ArticleCluster[]
): Promise<{ clusters: ArticleCluster[], unclustered: DynamicArticle[] }> {
  const clusters: ArticleCluster[] = [...existingClusters]
  const unclustered: DynamicArticle[] = []

  for (const article of articles) {
    let clustered = false

    // Try to add to existing cluster
    for (const cluster of clusters) {
      if (shouldAddToCluster(article, cluster)) {
        addToCluster(article, cluster)
        clustered = true
        console.log(`📊 Added "${article.title}" to cluster: ${cluster.topic}`)
        break
      }
    }

    // Create new cluster if no match found and we haven't hit the limit
    if (!clustered && clusters.length < DEDUP_CONFIG.maxClustersToCheck) {
      const newCluster = createNewCluster(article)
      clusters.push(newCluster)
      clustered = true
      console.log(`🆕 Created new cluster: ${newCluster.topic}`)
    }

    if (!clustered) {
      unclustered.push(article)
    }
  }

  // Sort clusters by update time (most recent first)
  clusters.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  return { clusters, unclustered }
}

/**
 * Check if article should be added to cluster
 */
function shouldAddToCluster(article: DynamicArticle, cluster: ArticleCluster): boolean {
  // Check time window
  const timeDiff = Math.abs(article.publishedAt.getTime() - cluster.createdAt.getTime())
  const maxTimeWindow = DEDUP_CONFIG.timeWindowHours * 60 * 60 * 1000
  
  if (timeDiff > maxTimeWindow) {
    return false
  }

  // Check cluster size limit
  if (cluster.members.length >= DEDUP_CONFIG.maxClusterSize) {
    return false
  }

  // Calculate similarity to cluster representative
  const similarity = calculateArticleSimilarity(article, cluster.representativeArticle)
  
  // Also check similarity to cluster topic/keywords
  const topicSimilarity = calculateTopicSimilarity(article, cluster)

  return similarity.similarity > DEDUP_CONFIG.clusterSimilarityThreshold || 
         topicSimilarity > DEDUP_CONFIG.clusterSimilarityThreshold
}

/**
 * Calculate topic similarity between article and cluster
 */
function calculateTopicSimilarity(article: DynamicArticle, cluster: ArticleCluster): number {
  // Extract keywords from article
  const articleKeywords = extractKeywords(article.title + ' ' + article.summary)
  
  // Extract keywords from cluster representative
  const clusterKeywords = extractKeywords(
    cluster.representativeArticle.title + ' ' + cluster.representativeArticle.summary
  )

  // Calculate Jaccard similarity
  const intersection = articleKeywords.filter(keyword => clusterKeywords.includes(keyword))
  const union = [...new Set([...articleKeywords, ...clusterKeywords])]

  return union.length > 0 ? intersection.length / union.length : 0
}

/**
 * Add article to existing cluster
 */
function addToCluster(article: DynamicArticle, cluster: ArticleCluster): void {
  cluster.members.push(article)
  cluster.updatedAt = new Date()

  // Update representative if this article is better
  if (shouldUpdateRepresentative(article, cluster.representativeArticle)) {
    cluster.representativeArticle = article
  }

  // Update cluster velocity
  cluster.velocity = cluster.members.length / 
    ((cluster.updatedAt.getTime() - cluster.createdAt.getTime()) / (1000 * 60 * 60) + 1) // articles per hour
}

/**
 * Create new cluster from article
 */
function createNewCluster(article: DynamicArticle): ArticleCluster {
  const topic = extractMainTopic(article)
  
  return {
    id: generateClusterId(),
    representativeArticle: article,
    members: [article],
    clusterScore: article.popularityScore || 0.5,
    topic,
    createdAt: new Date(),
    updatedAt: new Date(),
    velocity: 1
  }
}

/**
 * Check if article should be the new representative
 */
function shouldUpdateRepresentative(newArticle: DynamicArticle, currentRep: DynamicArticle): boolean {
  // Prefer higher popularity score
  if ((newArticle.popularityScore || 0) > (currentRep.popularityScore || 0)) {
    return true
  }

  // Prefer better source reputation
  const newSourceScore = getSourceScore(newArticle.sourceName)
  const currentSourceScore = getSourceScore(currentRep.sourceName)
  
  return newSourceScore > currentSourceScore
}

/**
 * Update cluster metrics
 */
function updateClusterMetrics(clusters: ArticleCluster[]): ArticleCluster[] {
  return clusters.map(cluster => {
    // Update cluster score based on member scores
    const avgScore = cluster.members.reduce((sum, article) => 
      sum + (article.popularityScore || 0.5), 0
    ) / cluster.members.length

    cluster.clusterScore = avgScore

    // Update velocity
    const ageInHours = (Date.now() - cluster.createdAt.getTime()) / (1000 * 60 * 60)
    cluster.velocity = cluster.members.length / Math.max(1, ageInHours)

    return cluster
  })
}

/**
 * Utility functions
 */

function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove tracking parameters and fragments
    urlObj.search = ''
    urlObj.hash = ''
    return urlObj.toString().toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

function calculateUrlSimilarity(url1: string, url2: string): number {
  const norm1 = normalizeUrl(url1)
  const norm2 = normalizeUrl(url2)
  
  if (norm1 === norm2) return 1
  
  // Check if one URL is a variant of another (e.g., AMP vs canonical)
  const domain1 = new URL(norm1).hostname
  const domain2 = new URL(norm2).hostname
  
  if (domain1 === domain2) {
    const path1 = new URL(norm1).pathname
    const path2 = new URL(norm2).pathname
    return calculateTextSimilarity(path1, path2)
  }
  
  return 0
}

function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0
  
  const tokens1 = tokenize(text1.toLowerCase())
  const tokens2 = tokenize(text2.toLowerCase())
  
  // Jaccard similarity
  const set1 = new Set(tokens1)
  const set2 = new Set(tokens2)
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return union.size > 0 ? intersection.size / union.size : 0
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2)
}

function extractKeywords(text: string): string[] {
  const tokens = tokenize(text.toLowerCase())
  const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
  
  return tokens
    .filter(token => !stopWords.has(token) && token.length > 3)
    .slice(0, 10)
}

function extractMainTopic(article: DynamicArticle): string {
  // Simple topic extraction based on title keywords
  const title = article.title.toLowerCase()
  
  const topicKeywords = {
    'AI & Technology': ['ai', 'artificial intelligence', 'tech', 'software', 'computer'],
    'Finance & Markets': ['stock', 'market', 'finance', 'investment', 'economy'],
    'Politics & Government': ['politics', 'government', 'election', 'policy', 'congress'],
    'Health & Medicine': ['health', 'medical', 'medicine', 'hospital', 'doctor'],
    'Science & Research': ['science', 'research', 'study', 'discovery', 'experiment'],
    'Business & Industry': ['business', 'company', 'industry', 'corporate', 'enterprise'],
    'Sports & Entertainment': ['sports', 'game', 'movie', 'music', 'entertainment']
  }

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => title.includes(keyword))) {
      return topic
    }
  }

  return 'General News'
}

function getSourceScore(sourceName: string): number {
  const scores: Record<string, number> = {
    'Reuters': 0.95,
    'Associated Press': 0.95,
    'BBC News': 0.90,
    'CNN': 0.80,
    'The New York Times': 0.90,
    'The Wall Street Journal': 0.88,
    'Bloomberg': 0.87,
    'TechCrunch': 0.75,
    'Hacker News': 0.85,
    'Reddit': 0.60
  }

  return scores[sourceName] || 0.5
}

function generateClusterId(): string {
  return `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get cluster by ID
 */
export function getClusterById(clusters: ArticleCluster[], id: string): ArticleCluster | undefined {
  return clusters.find(cluster => cluster.id === id)
}

/**
 * Get top clusters by velocity (trending)
 */
export function getTopClustersByVelocity(clusters: ArticleCluster[], limit: number = 5): ArticleCluster[] {
  return clusters
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, limit)
}

/**
 * Get recent clusters
 */
export function getRecentClusters(clusters: ArticleCluster[], hoursBack: number = 24): ArticleCluster[] {
  const cutoff = Date.now() - (hoursBack * 60 * 60 * 1000)
  
  return clusters
    .filter(cluster => cluster.updatedAt.getTime() > cutoff)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}
