'use client'

import { useEffect, useRef } from 'react'
import { Article } from '@/types'
import { NewsArticleCard } from './news-article-card'
import { cn } from '@/utils/cn'

interface NewsFeedProps {
  articles: Article[]
  isAutoScroll: boolean
  scrollSpeed: number
  bookmarkedArticles: string[]
  onBookmark: (articleId: string) => void
}

export function NewsFeed({ 
  articles, 
  isAutoScroll, 
  scrollSpeed, 
  bookmarkedArticles,
  onBookmark 
}: NewsFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!feedRef.current || !isAutoScroll) return

    const element = feedRef.current
    element.style.setProperty('--scroll-speed', `${scrollSpeed}s`)
    
    // Reset animation
    element.style.animation = 'none'
    element.offsetHeight // Trigger reflow
    element.style.animation = `scroll-up ${scrollSpeed}s linear infinite`

  }, [scrollSpeed, isAutoScroll])

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-hidden bg-gradient-to-b from-hud-background via-hud-background/95 to-hud-background"
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-px h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-hud-primary/20" />
          ))}
        </div>
      </div>

      {/* Scrolling news feed */}
      <div
        ref={feedRef}
        className={cn(
          "absolute inset-x-0 space-y-6 px-6 py-8",
          isAutoScroll ? "article-scroll" : "static"
        )}
        style={isAutoScroll ? { 
          animationDuration: `${scrollSpeed}s`,
          animationPlayState: 'running'
        } : {}}
        onMouseEnter={() => {
          if (feedRef.current && isAutoScroll) {
            feedRef.current.style.animationPlayState = 'paused'
          }
        }}
        onMouseLeave={() => {
          if (feedRef.current && isAutoScroll) {
            feedRef.current.style.animationPlayState = 'running'
          }
        }}
      >
        {/* Repeat articles to create continuous scroll */}
        {[...articles, ...articles, ...articles].map((article, index) => (
          <NewsArticleCard
            key={`${article.id}-${index}`}
            article={article}
            isBookmarked={bookmarkedArticles.includes(article.id)}
            onBookmark={() => onBookmark(article.id)}
          />
        ))}
      </div>

      {/* Fade overlays */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-hud-background to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-hud-background to-transparent pointer-events-none" />

      {/* Side borders */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-hud-primary/30" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-hud-primary/30" />
    </div>
  )
}
