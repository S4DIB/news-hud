'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { trackUserInteraction } from '@/lib/firebase/database'
import { fetchDynamicNews, calculateRelevanceForDynamic, type DynamicArticle } from '@/lib/dynamicNews'

// Using DynamicArticle from dynamicNews.ts

export default function Home() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<DynamicArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const [scrollSpeed, setScrollSpeed] = useState(60)
  const [mounted, setMounted] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Use user preferences for scroll settings
  useEffect(() => {
    if (userProfile?.preferences) {
      setIsAutoScroll(userProfile.preferences.autoScroll)
      setScrollSpeed(userProfile.preferences.scrollSpeed)
    }
  }, [userProfile])

  // Fetch dynamic news based on user interests
  const fetchNews = async () => {
    setLoading(true)
    try {
      const interests = userProfile?.interests || []
      console.log('🎯 STARTING FRESH NEWS FETCH')
      console.log('🎯 Current user interests:', interests)
      console.log('🎯 User profile:', userProfile)
      
      if (interests.length === 0) {
        console.log('⚠️ No interests set, using default content')
      }
      
      let fetchedArticles = await fetchDynamicNews(interests)
      console.log('📰 Raw fetched articles:', fetchedArticles.length)
      console.log('📰 First few articles:', fetchedArticles.slice(0, 3).map(a => ({ title: a.title, source: a.sourceName })))
      
      // Calculate relevance for each article
      fetchedArticles = fetchedArticles.map(article => 
        calculateRelevanceForDynamic(article, interests)
      )
      
      // Sort by relevance and popularity
      fetchedArticles.sort((a, b) => {
        const scoreA = (a.relevanceScore || 0) * 0.6 + a.popularityScore * 0.4
        const scoreB = (b.relevanceScore || 0) * 0.6 + b.popularityScore * 0.4
        return scoreB - scoreA
      })
      
      console.log('🎯 Final articles after sorting:', fetchedArticles.slice(0, 3).map(a => ({ 
        title: a.title, 
        source: a.sourceName, 
        relevance: a.relevanceScore,
        popularity: a.popularityScore 
      })))
      
      // Set articles immediately without delay to prevent glitches
      setArticles(fetchedArticles)
      setLastUpdate(new Date())
      console.log(`✅ COMPLETED: Loaded ${fetchedArticles.length} personalized articles`)
      
      console.log(`🔄 PROCESSING: About to load ${fetchedArticles.length} personalized articles`)
    } catch (error) {
      console.error('❌ Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch news when component mounts or user profile changes
  useEffect(() => {
    if (!authLoading && user && userProfile) {
      console.log('🔄 User profile changed, fetching fresh news...')
      fetchNews()
    }
  }, [user, userProfile?.interests, authLoading]) // Added userProfile?.interests dependency

  // Auto-refresh news every 5 minutes
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing news...')
      fetchNews()
    }, 15 * 60 * 1000) // 15 minutes - HackerNews doesn't change that frequently
    
    return () => clearInterval(interval)
  }, [user, userProfile?.interests]) // Added userProfile?.interests dependency

  const getSourceIcon = (sourceName: string) => {
    if (sourceName.includes('Reddit')) return '🔴'
    if (sourceName.includes('HackerNews')) return '🌐'
    if (sourceName.includes('TLDR')) return '🤖'
    if (sourceName.includes('Twitter')) return '🐦'
    return '📡'
  }

    const formatTimeAgo = (timestamp: Date) => {
      if (!timestamp) return 'Unknown time'

      const now = new Date()
      const diffMs = now.getTime() - timestamp.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffMs / (1000 * 60))

      if (diffHours > 24) {
        const diffDays = Math.floor(diffHours / 24)
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
      } else {
        return 'Just now'
      }
    }

    const calculateScore = (article: DynamicArticle) => {
      const relevanceBonus = (article.relevanceScore || 0) * 0.3
      return Math.round(((article.finalScore || article.popularityScore || 0.5) + relevanceBonus) * 100)
    }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      console.log('🔄 MANUAL REFRESH')
      
      // Fetch fresh content immediately
      await fetchNews()
      
      console.log('✅ Manual refresh completed!')
    } catch (error) {
      console.error('❌ Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleArticleClick = async (article: DynamicArticle, position: number) => {
    if (user) {
      try {
        await trackUserInteraction({
          userId: user.uid,
          articleId: article.id,
          type: 'click',
          source: 'feed',
          position,
          deviceType: 'desktop'
        })
      } catch (error) {
        console.error('Failed to track interaction:', error)
      }
    }
  }

  return (
    <main>
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <div style={{ fontSize: '32px' }}>⚡</div>
          <h1 className="header-title">HUD NEWS</h1>
          <div className="header-status">
            <div className="status-dot"></div>
            <span>LIVE FEED ACTIVE</span>
          </div>
        </div>
        
            <div className="header-status" style={{ fontSize: '12px' }}>
              <div className="status-dot"></div>
              <span>LIVE PERSONALIZED</span>
              <div className="status-dot accent"></div>
              <span>ARTICLES: {articles.length}</span>
              <div className="status-dot blue"></div>
              <span>INTERESTS: {userProfile?.interests?.length || 0}</span>
              <div className="status-dot"></div>
              <span>LAST UPDATE: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Loading...'}</span>
            </div>

            <div className="header-actions">
              <button
                className="hud-button"
                title="Refresh Content"
                onClick={handleRefresh}
                disabled={refreshing}
                style={{ opacity: refreshing ? 0.6 : 1 }}
              >
                {refreshing ? '🔄' : '🔃'}
              </button>
              <button className="hud-button" title="Bookmarks">🔖</button>
              <button 
                className="hud-button" 
                title="AI Features"
                onClick={() => router.push('/ai-features')}
              >
                🤖
              </button>
              <button 
                className="hud-button" 
                title="Settings"
                onClick={() => router.push('/settings')}
              >
                ⚙️
              </button>
          {userProfile && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginLeft: '16px',
              padding: '6px 12px',
              background: 'rgba(0, 212, 255, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(0, 212, 255, 0.3)'
            }}>
              {userProfile.photoURL && (
                <img 
                  src={userProfile.photoURL} 
                  alt="Profile"
                  style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                />
              )}
              <span style={{ fontSize: '12px', color: 'var(--hud-primary)' }}>
                {userProfile.displayName || 'User'}
              </span>
              <button
                className="hud-button"
                title="Sign Out"
                onClick={signOut}
                style={{ fontSize: '10px', padding: '2px 6px' }}
              >
                🚪
              </button>
            </div>
          )}
        </div>
      </header>

      {/* News Feed */}
      <div className="news-feed-container">
        <div className="grid-bg"></div>
        <div className="fade-top"></div>
        <div className="fade-bottom"></div>
        
        <div 
          className="news-feed"
          style={{
            animationDuration: `${scrollSpeed}s`,
            animationPlayState: isAutoScroll ? 'running' : 'paused'
          }}
        >
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#00d4ff',
              fontSize: '18px'
            }}>
              <div style={{ marginBottom: '16px' }}>🔄 Loading live articles...</div>
              <div style={{ fontSize: '14px', opacity: 0.7 }}>
                If no articles appear, visit /test-reddit and click "Aggregate Reddit Content"
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#00d4ff',
              fontSize: '18px'
            }}>
              <div style={{ marginBottom: '16px' }}>📰 No articles found</div>
              <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>
                Get started by adding some content!
              </div>
              <a 
                href="/test-reddit" 
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'rgba(0, 255, 100, 0.3)',
                  border: '1px solid #00ff64',
                  borderRadius: '4px',
                  color: '#00ff64',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                🔴 Add Reddit Content
              </a>
            </div>
          ) : (
                // Repeat articles for continuous scroll effect
                [...articles, ...articles, ...articles].map((article, index) => (
              <article key={`${article.id}-${index}-${lastUpdate?.getTime()}`} className="article-card">
                <div className="article-score">{calculateScore(article)}%</div>
                <div className="article-meta">
                  <span>{getSourceIcon(article.sourceName)}</span>
                  <span className="article-source">{article.sourceName}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(article.publishedAt)}</span>
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>👤 {article.author}</span>
                    </>
                  )}
                </div>
                <h2 className="article-title">
                  {article.title}
                </h2>
                <p className="article-summary">
                  {article.summary || 'No summary available'}
                </p>
                <div className="article-footer">
                  <div className="article-stats">
                    {article.metadata?.score && <span>📈 {article.metadata.score}</span>}
                    {article.metadata?.comments && <span>💬 {article.metadata.comments}</span>}
                    {article.metadata?.upvote_ratio && (
                      <span>👍 {Math.round(article.metadata.upvote_ratio * 100)}%</span>
                    )}
                  </div>
                         <a
                           href={article.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           onClick={() => handleArticleClick(article, index)}
                           style={{ color: 'rgba(0, 212, 255, 0.7)', fontSize: '12px' }}
                         >
                           Read more →
                         </a>
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="article-tags">
                    {article.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">{tag}</span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="tag">+{article.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button 
          className="control-button" 
          title="Slower"
          onClick={() => setScrollSpeed(Math.min(scrollSpeed + 15, 120))}
        >
          ⏪
        </button>
        <button 
          className={`control-button ${isAutoScroll ? 'active' : ''}`}
          title={isAutoScroll ? "Pause" : "Play"}
          onClick={() => setIsAutoScroll(!isAutoScroll)}
        >
          {isAutoScroll ? '⏸️' : '▶️'}
        </button>
        <button 
          className="control-button" 
          title="Faster"
          onClick={() => setScrollSpeed(Math.max(scrollSpeed - 15, 30))}
        >
          ⏩
        </button>
        <div className="speed-indicator">
          <div className="speed-value">{scrollSpeed}s</div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>CYCLE</div>
        </div>
        <button 
          className="control-button" 
          title="Reset"
          onClick={() => setScrollSpeed(60)}
        >
          🔄
        </button>
      </div>
    </main>
  )
}
