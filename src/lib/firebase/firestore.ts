import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore'
import { db } from './config'
import type { Article, UserInterest, Bookmark, UserPreferences } from '@/types'

// Collections
export const COLLECTIONS = {
  ARTICLES: 'articles',
  USERS: 'users',
  FEED_SOURCES: 'feedSources',
  USER_INTERESTS: 'userInterests',
  BOOKMARKS: 'bookmarks',
  USER_PREFERENCES: 'userPreferences',
  USER_INTERACTIONS: 'userInteractions'
}

// Articles
export async function getArticles(limitCount: number = 50) {
  const articlesQuery = query(
    collection(db, COLLECTIONS.ARTICLES),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  )
  
  const snapshot = await getDocs(articlesQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Article[]
}

export async function addArticle(article: Omit<Article, 'id'>) {
  const docRef = await addDoc(collection(db, COLLECTIONS.ARTICLES), {
    ...article,
    publishedAt: Timestamp.fromDate(new Date(article.published_at)),
    scrapedAt: Timestamp.fromDate(new Date(article.scraped_at)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  return docRef.id
}

// User Interests
export async function getUserInterests(userId: string) {
  const interestsQuery = query(
    collection(db, COLLECTIONS.USER_INTERESTS),
    where('userId', '==', userId),
    where('isActive', '==', true)
  )
  
  const snapshot = await getDocs(interestsQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserInterest[]
}

export async function addUserInterest(interest: Omit<UserInterest, 'id'>) {
  const docRef = await addDoc(collection(db, COLLECTIONS.USER_INTERESTS), {
    ...interest,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  return docRef.id
}

// Bookmarks
export async function getUserBookmarks(userId: string) {
  const bookmarksQuery = query(
    collection(db, COLLECTIONS.BOOKMARKS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(bookmarksQuery)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Bookmark[]
}

export async function addBookmark(bookmark: Omit<Bookmark, 'id'>) {
  const docRef = await addDoc(collection(db, COLLECTIONS.BOOKMARKS), {
    ...bookmark,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  return docRef.id
}

export async function removeBookmark(bookmarkId: string) {
  await deleteDoc(doc(db, COLLECTIONS.BOOKMARKS, bookmarkId))
}

// User Preferences
export async function getUserPreferences(userId: string) {
  const docRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserPreferences
  }
  
  // Create default preferences if they don't exist
  const defaultPrefs: Omit<UserPreferences, 'id'> = {
    user_id: userId,
    scroll_speed: 60,
    content_mix_ratio: {
      interests: 0.7,
      popular: 0.2,
      serendipity: 0.1
    },
    ai_api_keys: {},
    notification_settings: {
      email: false,
      push: false,
      digest_frequency: 'weekly'
    },
    theme: 'hud',
    auto_scroll: true,
    show_source_icons: true,
    article_preview_length: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  await updateDoc(docRef, {
    ...defaultPrefs,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  })
  
  return { id: userId, ...defaultPrefs } as UserPreferences
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
  const docRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId)
  await updateDoc(docRef, {
    ...preferences,
    updatedAt: Timestamp.now()
  })
}

// Real-time listeners
export function subscribeToArticles(callback: (articles: Article[]) => void, limitCount: number = 50) {
  const articlesQuery = query(
    collection(db, COLLECTIONS.ARTICLES),
    orderBy('publishedAt', 'desc'),
    limit(limitCount)
  )
  
  return onSnapshot(articlesQuery, (snapshot) => {
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Article[]
    callback(articles)
  })
}

export function subscribeToUserBookmarks(userId: string, callback: (bookmarks: Bookmark[]) => void) {
  const bookmarksQuery = query(
    collection(db, COLLECTIONS.BOOKMARKS),
    where('userId', '==', userId),
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
