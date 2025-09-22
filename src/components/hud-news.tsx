'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/types'
import { NewsHeader } from './news-header'
import { NewsFeed } from './news-feed'
import { NewsControls } from './news-controls'
import { SettingsPanel } from './settings-panel'
import { BookmarksPanel } from './bookmarks-panel'

// Mock data for initial implementation
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'AI Breakthrough: New Neural Network Architecture Achieves Human-Level Performance',
    summary: 'Researchers at leading tech companies have developed a revolutionary neural network that demonstrates human-level performance across multiple cognitive tasks.',
    url: 'https://example.com/ai-breakthrough',
    author: 'Dr. Sarah Chen',
    source_id: 'hn-1',
    source_name: 'HackerNews',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    scraped_at: new Date().toISOString(),
    popularity_score: 0.95,
    relevance_score: 0.9,
    final_score: 0.92,
    tags: ['AI', 'Machine Learning', 'Research'],
    metadata: { score: 847, comments: 234 }
  },
  {
    id: '2',
    title: 'Quantum Computing Startup Raises $100M Series B for Commercial Applications',
    summary: 'A quantum computing company has secured significant funding to bring quantum solutions to enterprise customers in finance and logistics.',
    url: 'https://example.com/quantum-funding',
    author: 'Mike Rodriguez',
    source_id: 'reddit-1',
    source_name: 'Reddit',
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    scraped_at: new Date().toISOString(),
    popularity_score: 0.82,
    relevance_score: 0.75,
    final_score: 0.78,
    tags: ['Quantum Computing', 'Startup', 'Funding'],
    metadata: { score: 567, comments: 89, upvotes: 1240 }
  },
  {
    id: '3',
    title: 'New Programming Language Promises 10x Performance Improvements',
    summary: 'A systems programming language designed for high-performance computing shows remarkable benchmarks in early testing.',
    url: 'https://example.com/new-language',
    author: 'Alex Kumar',
    source_id: 'hn-2',
    source_name: 'HackerNews',
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    scraped_at: new Date().toISOString(),
    popularity_score: 0.71,
    relevance_score: 0.85,
    final_score: 0.76,
    tags: ['Programming', 'Performance', 'Systems'],
    metadata: { score: 423, comments: 156 }
  },
  {
    id: '4',
    title: 'Climate Tech Innovation: Solar Efficiency Reaches Record 47%',
    summary: 'Scientists have achieved a new world record in solar cell efficiency, bringing us closer to cost-effective renewable energy.',
    url: 'https://example.com/solar-efficiency',
    author: 'Dr. Maria Santos',
    source_id: 'newsletter-1',
    source_name: 'TLDR AI',
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    scraped_at: new Date().toISOString(),
    popularity_score: 0.68,
    relevance_score: 0.60,
    final_score: 0.64,
    tags: ['Climate Tech', 'Solar', 'Renewable Energy'],
    metadata: { score: 345, comments: 78 }
  },
  {
    id: '5',
    title: 'Decentralized Social Media Platform Reaches 10M Users',
    summary: 'A blockchain-based social media platform has achieved a significant milestone in user adoption, challenging traditional platforms.',
    url: 'https://example.com/decentralized-social',
    author: 'Jordan Park',
    source_id: 'twitter-1',
    source_name: 'Twitter',
    published_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    scraped_at: new Date().toISOString(),
    popularity_score: 0.59,
    relevance_score: 0.70,
    final_score: 0.62,
    tags: ['Blockchain', 'Social Media', 'Decentralization'],
    metadata: { score: 289, comments: 45, retweets: 567 }
  }
]

export function HUDNews() {
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const [scrollSpeed, setScrollSpeed] = useState(60) // seconds
  const [showSettings, setShowSettings] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real app, this would fetch new articles from the API
      const now = new Date().toISOString()
      setArticles(prev => prev.map(article => ({
        ...article,
        scraped_at: now
      })))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    )
  }

  const handleSpeedChange = (newSpeed: number) => {
    setScrollSpeed(newSpeed)
  }

  return (
    <div className="relative min-h-screen bg-hud-background overflow-hidden">
      {/* Header */}
      <NewsHeader 
        onSettingsClick={() => setShowSettings(!showSettings)}
        onBookmarksClick={() => setShowBookmarks(!showBookmarks)}
      />

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* News Feed */}
        <div className="flex-1 relative">
          <NewsFeed 
            articles={articles}
            isAutoScroll={isAutoScroll}
            scrollSpeed={scrollSpeed}
            bookmarkedArticles={bookmarkedArticles}
            onBookmark={handleBookmark}
          />
        </div>

        {/* Side Panels */}
        {showSettings && (
          <SettingsPanel 
            scrollSpeed={scrollSpeed}
            isAutoScroll={isAutoScroll}
            onSpeedChange={handleSpeedChange}
            onAutoScrollChange={setIsAutoScroll}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showBookmarks && (
          <BookmarksPanel 
            articles={articles.filter(a => bookmarkedArticles.includes(a.id))}
            onClose={() => setShowBookmarks(false)}
          />
        )}
      </div>

      {/* Controls */}
      <NewsControls 
        isAutoScroll={isAutoScroll}
        onToggleAutoScroll={() => setIsAutoScroll(!isAutoScroll)}
        scrollSpeed={scrollSpeed}
        onSpeedChange={handleSpeedChange}
      />
    </div>
  )
}
