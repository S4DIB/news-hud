'use client'

import { useState } from 'react'
import { Article } from '@/types'
import { cn } from '@/utils/cn'
import { 
  ExternalLink, 
  Bookmark, 
  Clock, 
  TrendingUp, 
  User,
  Tag,
  MessageSquare,
  ArrowUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NewsArticleCardProps {
  article: Article
  isBookmarked: boolean
  onBookmark: () => void
}

export function NewsArticleCard({ article, isBookmarked, onBookmark }: NewsArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getSourceIcon = (sourceName: string) => {
    switch (sourceName.toLowerCase()) {
      case 'hackernews':
        return '📰'
      case 'reddit':
        return '🔴'
      case 'twitter':
        return '🐦'
      case 'tldr ai':
      case 'rundownai':
        return '🤖'
      default:
        return '📡'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-hud-accent'
    if (score >= 0.6) return 'text-hud-primary'
    return 'text-hud-primary/70'
  }

  return (
    <article 
      className={cn(
        "group relative p-6 rounded-lg hud-border bg-hud-surface/20 backdrop-blur-sm",
        "hover:bg-hud-surface/30 hover:hud-glow transition-all duration-300",
        "cursor-pointer"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Score indicator */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <div className={cn("text-xs font-mono", getScoreColor(article.final_score))}>
          {(article.final_score * 100).toFixed(0)}%
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onBookmark()
          }}
          className={cn(
            "p-1 rounded hover:bg-hud-primary/20 transition-colors",
            isBookmarked ? "text-hud-accent" : "text-hud-primary/50"
          )}
        >
          <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="text-xl">{getSourceIcon(article.source_name)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-xs text-hud-primary/70 mb-1">
            <span className="font-mono uppercase tracking-wide">{article.source_name}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
            </div>
            {article.author && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{article.author}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-hud-primary mb-3 leading-tight hud-text-glow group-hover:text-hud-accent transition-colors">
        {article.title}
      </h2>

      {/* Summary */}
      {article.summary && (
        <p className={cn(
          "text-hud-primary/80 mb-4 leading-relaxed",
          !isExpanded && "line-clamp-3"
        )}>
          {article.summary}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-hud-primary/60">
          {/* Popularity metrics */}
          {article.metadata.score && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>{article.metadata.score}</span>
            </div>
          )}
          {article.metadata.comments && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{article.metadata.comments}</span>
            </div>
          )}
          {article.metadata.upvotes && (
            <div className="flex items-center space-x-1">
              <ArrowUp className="w-3 h-3" />
              <span>{article.metadata.upvotes}</span>
            </div>
          )}
        </div>

        {/* External link */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center space-x-1 text-xs text-hud-primary/70 hover:text-hud-accent transition-colors group/link"
        >
          <span>Read more</span>
          <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-hud-primary/20">
          <Tag className="w-3 h-3 text-hud-primary/50" />
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded border border-hud-primary/30 text-hud-primary/70 bg-hud-surface/20"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-hud-primary/50">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Hover effect indicator */}
      <div className="absolute inset-0 rounded-lg bg-hud-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </article>
  )
}
