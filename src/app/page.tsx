'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { trackUserInteraction } from '@/lib/firebase/database'
import { fetchDynamicNews, calculateRelevanceForDynamic, type DynamicArticle } from '@/lib/dynamicNews'
import { initializeGemini, analyzeArticleRelevance } from '@/lib/gemini'

export default function Dashboard() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [articles, setArticles] = useState<DynamicArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const [scrollSpeed, setScrollSpeed] = useState(60)
  const [mounted, setMounted] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'feed' | 'hud' | 'analytics' | 'settings'>('hud')

  // Redirect to landing page if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/landing')
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
      
      // Apply AI-enhanced ranking if Gemini is available
      fetchedArticles = await enhanceWithAIRanking(fetchedArticles, interests)
      console.log(`🔍 After AI enhancement: ${fetchedArticles.length} articles`)
      console.log('🔍 Articles with AI scores:', fetchedArticles.filter(a => a.aiRelevanceScore).length)
      
      // Sort by final AI-enhanced score
      fetchedArticles.sort((a, b) => {
        // If AI scoring is available, use it with higher weight
        if (a.aiRelevanceScore !== undefined && b.aiRelevanceScore !== undefined) {
          const scoreA = (a.aiRelevanceScore / 100) * 0.5 + (a.relevanceScore || 0) * 0.3 + a.popularityScore * 0.2
          const scoreB = (b.aiRelevanceScore / 100) * 0.5 + (b.relevanceScore || 0) * 0.3 + b.popularityScore * 0.2
          return scoreB - scoreA
        } else {
          // Fallback to original scoring
          const scoreA = (a.relevanceScore || 0) * 0.6 + a.popularityScore * 0.4
          const scoreB = (b.relevanceScore || 0) * 0.6 + b.popularityScore * 0.4
          return scoreB - scoreA
        }
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
  }, [user, userProfile?.interests, authLoading])

  // Auto-refresh news every 5 minutes
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing news...')
      fetchNews()
    }, 15 * 60 * 1000) // 15 minutes
    
    return () => clearInterval(interval)
  }, [user, userProfile?.interests])

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
    if (article.aiRelevanceScore !== undefined) {
      // AI-enhanced scoring
      const aiScore = article.aiRelevanceScore / 100
      const relevanceScore = article.relevanceScore || 0
      const popularityScore = article.popularityScore || 0.5
      return Math.round((aiScore * 0.5 + relevanceScore * 0.3 + popularityScore * 0.2) * 100)
    } else {
      // Fallback scoring
      const relevanceBonus = (article.relevanceScore || 0) * 0.3
      return Math.round(((article.finalScore || article.popularityScore || 0.5) + relevanceBonus) * 100)
    }
  }

  const enhanceWithAIRanking = async (articles: DynamicArticle[], interests: string[]): Promise<DynamicArticle[]> => {
    // Debug user profile structure
    console.log('🔍 DEBUG: Full user profile:', userProfile)
    console.log('🔍 DEBUG: User profile preferences:', userProfile?.preferences)
    console.log('🔍 DEBUG: AI API keys:', userProfile?.preferences?.ai_api_keys)
    
    // Check if user has Gemini API key configured
    const geminiKey = userProfile?.preferences?.ai_api_keys?.gemini
    console.log('🔍 DEBUG: Gemini key found:', geminiKey ? 'YES' : 'NO')
    console.log('🔍 DEBUG: Interests length:', interests.length)
    
    if (!geminiKey || !interests.length) {
      console.log('⚠️ No Gemini API key or interests - skipping AI enhancement')
      console.log('  - Gemini key:', geminiKey ? 'PROVIDED' : 'MISSING')
      console.log('  - Interests:', interests.length > 0 ? `${interests.length} interests` : 'NO INTERESTS')
      return articles
    }

    console.log('🤖 Enhancing articles with AI relevance scoring...')
    
    // Initialize Gemini if not already done
    initializeGemini(geminiKey)

    // Enhance top articles with AI scoring (limit to top 10 for performance)
    const topArticles = articles.slice(0, 10)
    console.log(`🤖 Starting AI enhancement for ${topArticles.length} articles`)
    
    const enhancedArticles = await Promise.all(
      topArticles.map(async (article, index) => {
        try {
          console.log(`🤖 Processing article ${index + 1}/${topArticles.length}: "${article.title.substring(0, 50)}..."`)
          const aiAnalysis = await analyzeArticleRelevance(
            article.title,
            article.summary || '',
            interests
          )

          if (aiAnalysis) {
            article.aiRelevanceScore = aiAnalysis.score
            article.aiRelevanceReasoning = aiAnalysis.reasoning
            console.log(`✅ AI scored "${article.title.substring(0, 30)}...": ${aiAnalysis.score}/100`)
          } else {
            console.log(`⚠️ No AI analysis for "${article.title.substring(0, 30)}..."`)
          }

          return article
        } catch (error) {
          console.warn(`❌ AI analysis failed for "${article.title.substring(0, 30)}...":`, error)
          return article
        }
      })
    )
    
    console.log(`🤖 AI enhancement completed: ${enhancedArticles.length} articles processed`)

    // Return enhanced articles + remaining articles
    const finalArticles = [...enhancedArticles, ...articles.slice(10)]
    console.log(`🔍 AI Enhancement complete: ${enhancedArticles.length} enhanced + ${articles.slice(10).length} remaining = ${finalArticles.length} total`)
    return finalArticles
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      console.log('🔄 MANUAL REFRESH')
      
      // Fetch fresh content immediately
      await fetchNews()
      
      console.log('Manual refresh completed!')
    } catch (error) {
      console.error('Refresh error:', error)
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

  const renderAnalytics = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
          <div className="text-3xl font-bold text-blue-400 mb-2">{articles.length}</div>
          <div className="text-gray-300">Total Articles</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-xl border border-green-500/30">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {articles.filter(a => a.aiRelevanceScore).length}
          </div>
          <div className="text-gray-300">AI Enhanced</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-500/30">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {userProfile?.interests?.length || 0}
          </div>
          <div className="text-gray-300">Active Interests</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-6 rounded-xl border border-yellow-500/30">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {lastUpdate ? formatTimeAgo(lastUpdate) : 'N/A'}
          </div>
          <div className="text-gray-300">Last Update</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Source Distribution</h3>
          <div className="space-y-3">
            {Array.from(new Set(articles.map(a => a.sourceName))).map(source => {
              const count = articles.filter(a => a.sourceName === source).length
              const percentage = articles.length > 0 ? (count / articles.length) * 100 : 0
              return (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-gray-300">{getSourceIcon(source)} {source}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm w-12 text-right">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Top Performing Articles</h3>
          <div className="space-y-3">
            {articles.slice(0, 5).map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm truncate">{article.title}</div>
                  <div className="text-gray-400 text-xs">{article.sourceName}</div>
                </div>
                <div className="text-blue-400 text-sm font-semibold ml-2">
                  {calculateScore(article)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderHUD = () => (
    <div className="hud-screen scan-lines" style={{ marginTop: '-1px' }}>
      {/* News Feed */}
      <div className="news-feed-container" style={{ height: 'calc(100vh - 80px - 57px)' }}>
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
    </div>
  )

  const renderSettings = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Feed Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Auto-scroll</span>
              <button
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isAutoScroll ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  isAutoScroll ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Scroll Speed</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setScrollSpeed(Math.max(scrollSpeed - 15, 30))}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  -
                </button>
                <span className="text-white w-12 text-center">{scrollSpeed}s</span>
                <button
                  onClick={() => setScrollSpeed(Math.min(scrollSpeed + 15, 120))}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Gemini API Status</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                userProfile?.preferences?.ai_api_keys?.gemini 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {userProfile?.preferences?.ai_api_keys?.gemini ? 'Configured' : 'Not Set'}
              </span>
            </div>
            <button
              onClick={() => router.push('/pipeline-dashboard')}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Configure AI Pipeline
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {userProfile?.photoURL && (
                <img 
                  src={userProfile.photoURL} 
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <div className="text-white font-semibold">{userProfile?.displayName || 'User'}</div>
                <div className="text-gray-400 text-sm">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Professional Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">HUD News</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live Feed Active</span>
                  <span>•</span>
                  <span>{articles.length} Articles</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
              
              {userProfile && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-800 rounded-lg">
                  {userProfile.photoURL && (
                    <img 
                      src={userProfile.photoURL} 
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-white text-sm">{userProfile.displayName || 'User'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-black/30 border-b border-gray-800">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'hud', label: 'HUD Feed', icon: '⚡' },
              { id: 'feed', label: 'News Feed', icon: '📰' },
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'hud' && renderHUD()}
        {activeTab === 'feed' && (
          <div className="p-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-xl text-white mb-2">Loading Intelligence Feed...</div>
                <div className="text-gray-400">Processing articles with AI</div>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📰</div>
                <div className="text-xl text-white mb-4">No Articles Found</div>
                <div className="text-gray-400 mb-6">Configure your interests to get personalized content</div>
                <button
                  onClick={() => router.push('/settings')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Configure Interests
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                  <article key={article.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{getSourceIcon(article.sourceName)}</span>
                        <span>{article.sourceName}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">
                        {calculateScore(article)}%
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h2>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.summary || 'No summary available'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {article.metadata?.score && <span>📈 {article.metadata.score}</span>}
                        {article.metadata?.comments && <span>💬 {article.metadata.comments}</span>}
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleArticleClick(article, index)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Read More →
                      </a>
                    </div>
                    
                    {article.tags && article.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  )
}