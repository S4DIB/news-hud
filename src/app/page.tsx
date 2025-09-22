'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface Article {
  id: string
  title: string
  summary: string
  url: string
  author: string
  sourceName: string
  publishedAt: any
  popularityScore: number
  finalScore: number
  tags: string[]
  metadata: any
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const [scrollSpeed, setScrollSpeed] = useState(60)
  const [mounted, setMounted] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
    setLastUpdate(new Date())
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Auto-aggregate content on first load if no articles
    const autoAggregateIfNeeded = async () => {
      try {
        console.log('🔄 Auto-aggregating fresh content...')
        const response = await fetch('/api/aggregation/auto', {
          method: 'POST'
        })
        const data = await response.json()
        if (data.success) {
          console.log(`✅ Auto-aggregated ${data.summary.total_articles} articles from ${data.summary.successful_sources} sources`)
        }
      } catch (error) {
        console.log('⚠️ Auto-aggregation skipped:', error)
      }
    }

    // Set up real-time listener for articles
    const articlesQuery = query(
      collection(db, 'articles'),
      orderBy('publishedAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(articlesQuery, async (snapshot) => {
      const newArticles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[]
      
      console.log(`Loaded ${newArticles.length} articles from Firebase`)
      
      // If no articles on first load, auto-aggregate fresh content
      if (newArticles.length === 0 && loading) {
        console.log('🔄 No articles found, fetching fresh content...')
        await autoAggregateIfNeeded()
      }
      
      setArticles(newArticles)
      setLoading(false)
      setLastUpdate(new Date())
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [mounted, loading])

  const getSourceIcon = (sourceName: string) => {
    if (sourceName.includes('Reddit')) return '🔴'
    if (sourceName.includes('HackerNews')) return '🌐'
    if (sourceName.includes('TLDR')) return '🤖'
    if (sourceName.includes('Twitter')) return '🐦'
    return '📡'
  }

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Unknown time'
    
    let date: Date
    if (timestamp.seconds) {
      // Firebase Timestamp
      date = new Date(timestamp.seconds * 1000)
    } else {
      // Regular Date
      date = new Date(timestamp)
    }
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
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

  const calculateScore = (article: Article) => {
    return Math.round((article.finalScore || article.popularityScore || 0.5) * 100)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      console.log('🔄 Refreshing all content...')
      const response = await fetch('/api/refresh', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        console.log(`✅ Refreshed: ${data.new_articles_added} new articles`)
        setLastUpdate(new Date())
      } else {
        console.error('❌ Refresh failed:', data.error)
      }
    } catch (error) {
      console.error('❌ Refresh error:', error)
    } finally {
      setRefreshing(false)
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
          <span>AI RANKING</span>
          <div className="status-dot accent"></div>
          <span>ARTICLES: {articles.length}</span>
          <div className="status-dot blue"></div>
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
          <button className="hud-button" title="Settings">⚙️</button>
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
              <article key={`${article.id}-${index}`} className="article-card">
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
