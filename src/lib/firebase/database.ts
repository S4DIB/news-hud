import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { db } from './config'
import { COLLECTIONS } from './firestore'

// ============================================
// BOOKMARKS
// ============================================

export interface Bookmark {
  id: string
  userId: string
  articleId: string
  title: string
  url: string
  summary?: string
  tags: string[]
  notes?: string
  folder?: string
  isFavorite: boolean
  isArchived: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  articleSnapshot: {
    title: string
    source: string
    publishedAt: Timestamp
    originalUrl: string
  }
}

export async function createBookmark(userId: string, articleId: string, articleData: any): Promise<string> {
  const bookmark: Omit<Bookmark, 'id'> = {
    userId,
    articleId,
    title: articleData.title,
    url: articleData.url,
    summary: articleData.summary,
    tags: [],
    notes: '',
    folder: 'default',
    isFavorite: false,
    isArchived: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    articleSnapshot: {
      title: articleData.title,
      source: articleData.sourceName || 'Unknown',
      publishedAt: articleData.publishedAt || Timestamp.now(),
      originalUrl: articleData.url
    }
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.BOOKMARKS), bookmark)
  return docRef.id
}

export async function getUserBookmarks(userId: string, archived = false): Promise<Bookmark[]> {
  const bookmarksQuery = query(
    collection(db, COLLECTIONS.BOOKMARKS),
    where('userId', '==', userId),
    where('isArchived', '==', archived),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(bookmarksQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Bookmark[]
}

export async function updateBookmark(bookmarkId: string, updates: Partial<Bookmark>): Promise<void> {
  const bookmarkRef = doc(db, COLLECTIONS.BOOKMARKS, bookmarkId)
  await updateDoc(bookmarkRef, {
    ...updates,
    updatedAt: Timestamp.now()
  })
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  const bookmarkRef = doc(db, COLLECTIONS.BOOKMARKS, bookmarkId)
  await deleteDoc(bookmarkRef)
}

// ============================================
// USER INTERACTIONS
// ============================================

export interface UserInteraction {
  id: string
  userId: string
  articleId: string
  type: 'view' | 'click' | 'like' | 'share' | 'bookmark' | 'hide' | 'report'
  duration?: number
  timestamp: Timestamp
  source: 'feed' | 'search' | 'bookmark' | 'recommendation'
  position?: number
  deviceType: 'desktop' | 'mobile' | 'tablet'
  scrollDepth?: number
  clickedElements?: string[]
  sessionId?: string
}

export async function trackUserInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<string> {
  const interactionData = {
    ...interaction,
    timestamp: Timestamp.now(),
    deviceType: getDeviceType(),
    sessionId: getSessionId()
  }

  const docRef = await addDoc(collection(db, 'userInteractions'), interactionData)
  return docRef.id
}

export async function getUserInteractions(userId: string, interactionType?: string, limitCount = 100): Promise<UserInteraction[]> {
  let interactionQuery = query(
    collection(db, 'userInteractions'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )

  if (interactionType) {
    interactionQuery = query(
      collection(db, 'userInteractions'),
      where('userId', '==', userId),
      where('type', '==', interactionType),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
  }

  const snapshot = await getDocs(interactionQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserInteraction[]
}

// ============================================
// USER TOPICS & INTERESTS
// ============================================

export interface UserTopic {
  id: string
  userId: string
  name: string
  keywords: string[]
  weight: number
  isActive: boolean
  engagementScore: number
  lastInteraction: Timestamp
  isAutoDetected: boolean
  confidence: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export async function createUserTopic(userId: string, topicData: Partial<UserTopic>): Promise<string> {
  const topic: Omit<UserTopic, 'id'> = {
    userId,
    name: topicData.name || '',
    keywords: topicData.keywords || [],
    weight: topicData.weight || 1.0,
    isActive: topicData.isActive ?? true,
    engagementScore: topicData.engagementScore || 0,
    lastInteraction: topicData.lastInteraction || Timestamp.now(),
    isAutoDetected: topicData.isAutoDetected || false,
    confidence: topicData.confidence || 1.0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }

  const docRef = await addDoc(collection(db, 'userTopics', userId, 'topics'), topic)
  return docRef.id
}

export async function getUserTopics(userId: string): Promise<UserTopic[]> {
  const topicsQuery = query(
    collection(db, 'userTopics', userId, 'topics'),
    where('isActive', '==', true),
    orderBy('weight', 'desc')
  )

  const snapshot = await getDocs(topicsQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserTopic[]
}

export async function updateUserTopic(userId: string, topicId: string, updates: Partial<UserTopic>): Promise<void> {
  const topicRef = doc(db, 'userTopics', userId, 'topics', topicId)
  await updateDoc(topicRef, {
    ...updates,
    updatedAt: Timestamp.now()
  })
}

// ============================================
// PERSONALIZED FEED
// ============================================

export interface UserFeedItem {
  articleId: string
  userId: string
  personalizedScore: number
  relevanceScore: number
  recencyScore: number
  rank: number
  feedCategory: 'trending' | 'recommended' | 'following' | 'interests'
  isRead: boolean
  isHidden: boolean
  showAgain: boolean
  addedAt: Timestamp
  lastUpdated: Timestamp
  expiresAt?: Timestamp
}

export async function addToUserFeed(userId: string, articleId: string, feedItemData: Partial<UserFeedItem>): Promise<void> {
  const feedItem: Omit<UserFeedItem, 'userId' | 'articleId'> = {
    personalizedScore: feedItemData.personalizedScore || 0.5,
    relevanceScore: feedItemData.relevanceScore || 0.5,
    recencyScore: feedItemData.recencyScore || 0.5,
    rank: feedItemData.rank || 0,
    feedCategory: feedItemData.feedCategory || 'recommended',
    isRead: false,
    isHidden: false,
    showAgain: true,
    addedAt: Timestamp.now(),
    lastUpdated: Timestamp.now(),
    expiresAt: feedItemData.expiresAt
  }

  const feedRef = doc(db, 'userFeed', userId, 'articles', articleId)
  await updateDoc(feedRef, feedItem)
}

export async function getUserFeed(userId: string, limitCount = 50): Promise<UserFeedItem[]> {
  const feedQuery = query(
    collection(db, 'userFeed', userId, 'articles'),
    where('isHidden', '==', false),
    orderBy('rank', 'asc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(feedQuery)
  return snapshot.docs.map(doc => ({
    articleId: doc.id,
    userId,
    ...doc.data()
  })) as UserFeedItem[]
}

export async function markFeedItemAsRead(userId: string, articleId: string): Promise<void> {
  const feedRef = doc(db, 'userFeed', userId, 'articles', articleId)
  await updateDoc(feedRef, {
    isRead: true,
    lastUpdated: Timestamp.now()
  })
}

export async function hideFeedItem(userId: string, articleId: string): Promise<void> {
  const feedRef = doc(db, 'userFeed', userId, 'articles', articleId)
  await updateDoc(feedRef, {
    isHidden: true,
    lastUpdated: Timestamp.now()
  })
}

// ============================================
// PERSONALIZATION ENGINE
// ============================================

export async function calculatePersonalizedScore(userId: string, articleId: string): Promise<number> {
  // Get user topics and interests
  const userTopics = await getUserTopics(userId)
  const recentInteractions = await getUserInteractions(userId, undefined, 50)
  
  // Get article data
  const articleRef = doc(db, COLLECTIONS.ARTICLES, articleId)
  const articleDoc = await getDoc(articleRef)
  
  if (!articleDoc.exists()) return 0
  
  const article = articleDoc.data()
  
  // Calculate relevance based on user topics
  let relevanceScore = 0
  const articleText = `${article.title} ${article.summary || ''} ${article.tags?.join(' ') || ''}`.toLowerCase()
  
  for (const topic of userTopics) {
    for (const keyword of topic.keywords) {
      if (articleText.includes(keyword.toLowerCase())) {
        relevanceScore += topic.weight * topic.engagementScore
      }
    }
  }
  
  // Normalize relevance score
  relevanceScore = Math.min(relevanceScore, 1.0)
  
  // Calculate recency score
  const now = Date.now()
  const publishedTime = article.publishedAt?.toDate?.()?.getTime() || now
  const ageHours = (now - publishedTime) / (1000 * 60 * 60)
  const recencyScore = Math.max(0, 1 - (ageHours / 72)) // Decay over 72 hours
  
  // Combine scores
  const finalScore = (
    relevanceScore * 0.4 +
    (article.popularityScore || 0.5) * 0.3 +
    recencyScore * 0.3
  )
  
  return Math.min(finalScore, 1.0)
}

export async function generatePersonalizedFeed(userId: string): Promise<void> {
  // Get recent articles
  const articlesQuery = query(
    collection(db, COLLECTIONS.ARTICLES),
    where('isActive', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(100)
  )
  
  const articlesSnapshot = await getDocs(articlesQuery)
  const articles = articlesSnapshot.docs
  
  // Calculate personalized scores
  const scoredArticles = []
  
  for (const articleDoc of articles) {
    const articleId = articleDoc.id
    const personalizedScore = await calculatePersonalizedScore(userId, articleId)
    
    scoredArticles.push({
      articleId,
      personalizedScore,
      data: articleDoc.data()
    })
  }
  
  // Sort by personalized score
  scoredArticles.sort((a, b) => b.personalizedScore - a.personalizedScore)
  
  // Add top articles to user feed
  const batch = writeBatch(db)
  
  scoredArticles.slice(0, 50).forEach((article, index) => {
    const feedRef = doc(db, 'userFeed', userId, 'articles', article.articleId)
    
    const feedItem: Omit<UserFeedItem, 'articleId' | 'userId'> = {
      personalizedScore: article.personalizedScore,
      relevanceScore: article.personalizedScore,
      recencyScore: Math.max(0, 1 - ((Date.now() - article.data.publishedAt?.toDate?.()?.getTime()) / (1000 * 60 * 60 * 72))),
      rank: index + 1,
      feedCategory: index < 10 ? 'trending' : 'recommended',
      isRead: false,
      isHidden: false,
      showAgain: true,
      addedAt: Timestamp.now(),
      lastUpdated: Timestamp.now()
    }
    
    batch.set(feedRef, feedItem)
  })
  
  await batch.commit()
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let sessionId = sessionStorage.getItem('hud-news-session')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('hud-news-session', sessionId)
  }
  return sessionId
}

// ============================================
// REAL-TIME LISTENERS
// ============================================

export function subscribeToUserFeed(userId: string, callback: (feedItems: UserFeedItem[]) => void) {
  const feedQuery = query(
    collection(db, 'userFeed', userId, 'articles'),
    where('isHidden', '==', false),
    orderBy('rank', 'asc'),
    limit(50)
  )
  
  return onSnapshot(feedQuery, (snapshot) => {
    const feedItems = snapshot.docs.map(doc => ({
      articleId: doc.id,
      userId,
      ...doc.data()
    })) as UserFeedItem[]
    
    callback(feedItems)
  })
}

export function subscribeToUserBookmarks(userId: string, callback: (bookmarks: Bookmark[]) => void) {
  const bookmarksQuery = query(
    collection(db, COLLECTIONS.BOOKMARKS),
    where('userId', '==', userId),
    where('isArchived', '==', false),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(bookmarksQuery, (snapshot) => {
    const bookmarks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Bookmark[]
    
    callback(bookmarks)
  })
}
