/**
 * Notification System
 * Implements breaking news detection, threshold-based notifications, and user preferences
 */

import { DynamicArticle } from '@/types'
import { ArticleCluster } from './deduplication'
import { AuxiliarySignals } from './enrichment'

export interface NotificationRule {
  id: string
  name: string
  enabled: boolean
  conditions: NotificationCondition[]
  cooldownMinutes: number
  maxPerDay: number
  quietHours?: {
    start: string // "22:00"
    end: string   // "08:00"
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface NotificationCondition {
  type: 'topic' | 'keyword' | 'source' | 'score' | 'velocity' | 'breaking'
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than'
  value: string | number
  weight: number
}

export interface PendingNotification {
  id: string
  type: 'breaking' | 'trending' | 'personalized' | 'cluster_update'
  title: string
  body: string
  article?: DynamicArticle
  cluster?: ArticleCluster
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledFor: Date
  expiresAt: Date
  ruleId?: string
}

export interface NotificationHistory {
  userId: string
  notificationId: string
  sentAt: Date
  clicked: boolean
  dismissed: boolean
  ruleId?: string
}

export interface UserNotificationPreferences {
  userId: string
  enabled: boolean
  rules: NotificationRule[]
  globalCooldownMinutes: number
  maxNotificationsPerDay: number
  quietHours?: {
    start: string
    end: string
  }
  topics: string[]
  mutedSources: string[]
  deviceTokens: string[]
}

// Default notification rules
const DEFAULT_NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: 'breaking_news',
    name: 'Breaking News',
    enabled: true,
    conditions: [
      { type: 'breaking', operator: 'equals', value: true, weight: 1.0 },
      { type: 'score', operator: 'greater_than', value: 0.8, weight: 0.8 }
    ],
    cooldownMinutes: 30,
    maxPerDay: 5,
    priority: 'urgent'
  },
  {
    id: 'trending_topics',
    name: 'Trending in Your Interests',
    enabled: true,
    conditions: [
      { type: 'velocity', operator: 'greater_than', value: 3, weight: 0.9 },
      { type: 'score', operator: 'greater_than', value: 0.7, weight: 0.7 }
    ],
    cooldownMinutes: 120,
    maxPerDay: 3,
    priority: 'high'
  },
  {
    id: 'high_relevance',
    name: 'Highly Relevant Articles',
    enabled: true,
    conditions: [
      { type: 'score', operator: 'greater_than', value: 0.85, weight: 1.0 }
    ],
    cooldownMinutes: 180,
    maxPerDay: 2,
    priority: 'medium'
  }
]

/**
 * Main notification processor
 */
export class NotificationProcessor {
  private userPreferences: UserNotificationPreferences
  private history: NotificationHistory[] = []
  private pendingNotifications: PendingNotification[] = []

  constructor(userPreferences: UserNotificationPreferences) {
    this.userPreferences = userPreferences
  }

  /**
   * Process articles and generate notifications
   */
  async processArticles(
    articles: DynamicArticle[],
    clusters: ArticleCluster[],
    signals: AuxiliarySignals[]
  ): Promise<PendingNotification[]> {
    console.log(`🔔 Processing ${articles.length} articles for notifications`)

    if (!this.userPreferences.enabled) {
      console.log('📵 Notifications disabled for user')
      return []
    }

    const notifications: PendingNotification[] = []

    // Process breaking news
    const breakingNotifications = await this.processBreakingNews(articles, signals)
    notifications.push(...breakingNotifications)

    // Process trending clusters
    const trendingNotifications = await this.processTrendingClusters(clusters)
    notifications.push(...trendingNotifications)

    // Process personalized high-relevance articles
    const personalizedNotifications = await this.processPersonalizedArticles(articles)
    notifications.push(...personalizedNotifications)

    // Apply rate limiting and deduplication
    const finalNotifications = this.applyRateLimiting(notifications)

    console.log(`✅ Generated ${finalNotifications.length} notifications`)
    return finalNotifications
  }

  /**
   * Process breaking news notifications
   */
  private async processBreakingNews(
    articles: DynamicArticle[],
    signals: AuxiliarySignals[]
  ): Promise<PendingNotification[]> {
    const breakingRule = this.userPreferences.rules.find(r => r.id === 'breaking_news')
    if (!breakingRule?.enabled) return []

    const notifications: PendingNotification[] = []

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      const signal = signals[i]

      if (this.isBreakingNews(article, signal)) {
        const notification = this.createBreakingNewsNotification(article, breakingRule)
        
        if (this.shouldSendNotification(notification, breakingRule)) {
          notifications.push(notification)
        }
      }
    }

    return notifications
  }

  /**
   * Process trending cluster notifications
   */
  private async processTrendingClusters(clusters: ArticleCluster[]): Promise<PendingNotification[]> {
    const trendingRule = this.userPreferences.rules.find(r => r.id === 'trending_topics')
    if (!trendingRule?.enabled) return []

    const notifications: PendingNotification[] = []

    // Find fast-growing clusters
    const trendingClusters = clusters
      .filter(cluster => cluster.velocity > 3 && cluster.members.length >= 3)
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 3)

    for (const cluster of trendingClusters) {
      if (this.isRelevantToUser(cluster.topic)) {
        const notification = this.createTrendingClusterNotification(cluster, trendingRule)
        
        if (this.shouldSendNotification(notification, trendingRule)) {
          notifications.push(notification)
        }
      }
    }

    return notifications
  }

  /**
   * Process personalized high-relevance notifications
   */
  private async processPersonalizedArticles(articles: DynamicArticle[]): Promise<PendingNotification[]> {
    const personalizedRule = this.userPreferences.rules.find(r => r.id === 'high_relevance')
    if (!personalizedRule?.enabled) return []

    const notifications: PendingNotification[] = []

    const highRelevanceArticles = articles
      .filter(article => {
        const score = this.calculateArticleScore(article)
        return score > 0.85 && this.isRelevantToUserInterests(article)
      })
      .sort((a, b) => this.calculateArticleScore(b) - this.calculateArticleScore(a))
      .slice(0, 2)

    for (const article of highRelevanceArticles) {
      const notification = this.createPersonalizedNotification(article, personalizedRule)
      
      if (this.shouldSendNotification(notification, personalizedRule)) {
        notifications.push(notification)
      }
    }

    return notifications
  }

  /**
   * Check if article qualifies as breaking news
   */
  private isBreakingNews(article: DynamicArticle, signal: AuxiliarySignals): boolean {
    // Check if marked as breaking
    if (signal.isBreaking) return true

    // Check recency (within last 2 hours)
    const ageInHours = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
    if (ageInHours > 2) return false

    // Check title for breaking keywords
    const breakingKeywords = ['breaking', 'urgent', 'just in', 'developing', 'live', 'alert', 'emergency']
    const title = article.title.toLowerCase()
    const hasBreakingKeywords = breakingKeywords.some(keyword => title.includes(keyword))

    // Check high popularity + authority
    const highImpact = article.popularityScore > 0.8 && signal.authorityScore > 0.7

    return hasBreakingKeywords || highImpact
  }

  /**
   * Check if topic is relevant to user
   */
  private isRelevantToUser(topic: string): boolean {
    return this.userPreferences.topics.some(userTopic => 
      topic.toLowerCase().includes(userTopic.toLowerCase()) ||
      userTopic.toLowerCase().includes(topic.toLowerCase())
    )
  }

  /**
   * Check if article is relevant to user interests
   */
  private isRelevantToUserInterests(article: DynamicArticle): boolean {
    // Check against user topics
    const relevantToTopics = this.userPreferences.topics.some(topic => {
      const title = article.title.toLowerCase()
      const summary = (article.summary || '').toLowerCase()
      const topicLower = topic.toLowerCase()
      
      return title.includes(topicLower) || summary.includes(topicLower)
    })

    // Check if source is not muted
    const sourceNotMuted = !this.userPreferences.mutedSources.some(source => 
      article.sourceName.toLowerCase().includes(source.toLowerCase())
    )

    return relevantToTopics && sourceNotMuted
  }

  /**
   * Calculate article score for notifications
   */
  private calculateArticleScore(article: DynamicArticle): number {
    if (article.aiRelevanceScore !== undefined) {
      // AI-enhanced scoring
      const aiScore = article.aiRelevanceScore / 100
      const relevanceScore = article.relevanceScore || 0
      const popularityScore = article.popularityScore || 0.5
      return aiScore * 0.5 + relevanceScore * 0.3 + popularityScore * 0.2
    } else {
      // Fallback scoring
      const relevanceBonus = (article.relevanceScore || 0) * 0.3
      return (article.finalScore || article.popularityScore || 0.5) + relevanceBonus
    }
  }

  /**
   * Create breaking news notification
   */
  private createBreakingNewsNotification(article: DynamicArticle, rule: NotificationRule): PendingNotification {
    return {
      id: `breaking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'breaking',
      title: '🚨 Breaking News',
      body: this.truncateText(article.title, 100),
      article,
      priority: rule.priority,
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      ruleId: rule.id
    }
  }

  /**
   * Create trending cluster notification
   */
  private createTrendingClusterNotification(cluster: ArticleCluster, rule: NotificationRule): PendingNotification {
    return {
      id: `trending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'trending',
      title: `📈 Trending: ${cluster.topic}`,
      body: `${cluster.members.length} new articles about ${cluster.topic}`,
      cluster,
      article: cluster.representativeArticle,
      priority: rule.priority,
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      ruleId: rule.id
    }
  }

  /**
   * Create personalized notification
   */
  private createPersonalizedNotification(article: DynamicArticle, rule: NotificationRule): PendingNotification {
    return {
      id: `personalized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'personalized',
      title: '⭐ Highly Relevant',
      body: this.truncateText(article.title, 100),
      article,
      priority: rule.priority,
      scheduledFor: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      ruleId: rule.id
    }
  }

  /**
   * Check if notification should be sent based on rules and rate limiting
   */
  private shouldSendNotification(notification: PendingNotification, rule: NotificationRule): boolean {
    // Check quiet hours
    if (this.isQuietHours()) {
      console.log('🔇 Notification blocked: quiet hours')
      return false
    }

    // Check rule cooldown
    if (this.isInCooldown(rule)) {
      console.log(`⏰ Notification blocked: rule ${rule.id} in cooldown`)
      return false
    }

    // Check daily limit for rule
    if (this.hasExceededDailyLimit(rule)) {
      console.log(`📊 Notification blocked: rule ${rule.id} daily limit exceeded`)
      return false
    }

    // Check global daily limit
    if (this.hasExceededGlobalDailyLimit()) {
      console.log('📊 Notification blocked: global daily limit exceeded')
      return false
    }

    return true
  }

  /**
   * Apply rate limiting and deduplication
   */
  private applyRateLimiting(notifications: PendingNotification[]): PendingNotification[] {
    // Remove duplicates based on article URL
    const seen = new Set<string>()
    const unique = notifications.filter(notification => {
      if (notification.article) {
        const key = notification.article.url
        if (seen.has(key)) return false
        seen.add(key)
      }
      return true
    })

    // Sort by priority and limit total
    return unique
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority))
      .slice(0, 5) // Max 5 notifications at once
  }

  /**
   * Check if it's currently quiet hours
   */
  private isQuietHours(): boolean {
    const quietHours = this.userPreferences.quietHours
    if (!quietHours) return false

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    return currentTime >= quietHours.start || currentTime <= quietHours.end
  }

  /**
   * Check if rule is in cooldown
   */
  private isInCooldown(rule: NotificationRule): boolean {
    const cutoff = Date.now() - (rule.cooldownMinutes * 60 * 1000)
    
    return this.history.some(h => 
      h.ruleId === rule.id && 
      h.sentAt.getTime() > cutoff
    )
  }

  /**
   * Check if rule has exceeded daily limit
   */
  private hasExceededDailyLimit(rule: NotificationRule): boolean {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const todayCount = this.history.filter(h => 
      h.ruleId === rule.id && 
      h.sentAt >= startOfDay
    ).length
    
    return todayCount >= rule.maxPerDay
  }

  /**
   * Check if global daily limit exceeded
   */
  private hasExceededGlobalDailyLimit(): boolean {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    
    const todayCount = this.history.filter(h => h.sentAt >= startOfDay).length
    
    return todayCount >= this.userPreferences.maxNotificationsPerDay
  }

  /**
   * Get priority weight for sorting
   */
  private getPriorityWeight(priority: string): number {
    const weights = { urgent: 4, high: 3, medium: 2, low: 1 }
    return weights[priority as keyof typeof weights] || 1
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  /**
   * Add notification to history
   */
  addToHistory(notification: PendingNotification, clicked: boolean = false): void {
    this.history.push({
      userId: this.userPreferences.userId,
      notificationId: notification.id,
      sentAt: new Date(),
      clicked,
      dismissed: false,
      ruleId: notification.ruleId
    })

    // Keep only last 1000 history entries
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000)
    }
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserNotificationPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences }
  }

  /**
   * Get notification analytics
   */
  getAnalytics(days: number = 7): any {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    const recentHistory = this.history.filter(h => h.sentAt.getTime() > cutoff)

    return {
      totalSent: recentHistory.length,
      clickRate: recentHistory.length > 0 ? 
        recentHistory.filter(h => h.clicked).length / recentHistory.length : 0,
      byRule: this.groupBy(recentHistory, 'ruleId'),
      byDay: this.groupByDay(recentHistory)
    }
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown'
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {})
  }

  private groupByDay(history: NotificationHistory[]): Record<string, number> {
    return history.reduce((groups, item) => {
      const day = item.sentAt.toISOString().split('T')[0]
      groups[day] = (groups[day] || 0) + 1
      return groups
    }, {} as Record<string, number>)
  }
}

/**
 * Create default user notification preferences
 */
export function createDefaultNotificationPreferences(userId: string): UserNotificationPreferences {
  return {
    userId,
    enabled: true,
    rules: DEFAULT_NOTIFICATION_RULES,
    globalCooldownMinutes: 15,
    maxNotificationsPerDay: 10,
    quietHours: {
      start: "22:00",
      end: "08:00"
    },
    topics: [],
    mutedSources: [],
    deviceTokens: []
  }
}

/**
 * Browser notification API wrapper
 */
export async function sendBrowserNotification(notification: PendingNotification): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('🚫 Browser notifications not supported')
    return false
  }

  if (Notification.permission === 'denied') {
    console.warn('🚫 Notification permission denied')
    return false
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('🚫 Notification permission not granted')
      return false
    }
  }

  try {
    const browserNotification = new Notification(notification.title, {
      body: notification.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: notification.priority === 'low'
    })

    browserNotification.onclick = () => {
      window.focus()
      if (notification.article) {
        window.open(notification.article.url, '_blank')
      }
      browserNotification.close()
    }

    return true
  } catch (error) {
    console.error('❌ Failed to send browser notification:', error)
    return false
  }
}
