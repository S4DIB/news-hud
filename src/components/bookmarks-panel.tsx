'use client'

import { useState } from 'react'
import { X, Search, FolderOpen, Star, Clock, ExternalLink } from 'lucide-react'
import { Article } from '@/types'
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface BookmarksPanelProps {
  articles: Article[]
  onClose: () => void
}

export function BookmarksPanel({ articles, onClose }: BookmarksPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', 'ai', 'tech', 'crypto', 'startup']

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           article.tags.some(tag => tag.toLowerCase().includes(selectedCategory))
    return matchesSearch && matchesCategory
  })

  return (
    <div className="w-80 h-full bg-hud-surface/30 backdrop-blur-sm border-l hud-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b hud-border">
        <h2 className="font-digital font-semibold text-hud-primary hud-text-glow flex items-center space-x-2">
          <Star className="w-5 h-5 text-hud-accent" />
          <span>BOOKMARKS</span>
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-hud-primary/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b hud-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-hud-primary/50" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-hud-surface/30 border hud-border rounded text-sm text-hud-primary placeholder-hud-primary/40 focus:outline-none focus:ring-1 focus:ring-hud-accent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b hud-border">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-3 py-1 text-xs rounded-full border transition-all",
                selectedCategory === category
                  ? "bg-hud-accent/20 text-hud-accent border-hud-accent"
                  : "bg-hud-surface/20 text-hud-primary/70 border-hud-primary/30 hover:border-hud-primary/50"
              )}
            >
              {category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks List */}
      <div className="overflow-y-auto h-[calc(100%-200px)]">
        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-hud-primary/50">
            <FolderOpen className="w-12 h-12 mb-4" />
            <p className="text-sm text-center">
              {articles.length === 0 ? 'No bookmarks yet' : 'No bookmarks match your search'}
            </p>
            <p className="text-xs text-center mt-2 text-hud-primary/30">
              {articles.length === 0 ? 'Bookmark articles to save them for later' : 'Try adjusting your search or category filter'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 bg-hud-surface/20 rounded border hud-border hover:bg-hud-surface/30 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 text-xs text-hud-primary/70">
                    <span className="font-mono uppercase">{article.source_name}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4 text-hud-primary/50 hover:text-hud-accent" />
                  </a>
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium text-hud-primary mb-2 leading-tight line-clamp-2">
                  {article.title}
                </h3>

                {/* Summary */}
                {article.summary && (
                  <p className="text-xs text-hud-primary/70 mb-3 line-clamp-2">
                    {article.summary}
                  </p>
                )}

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded bg-hud-primary/10 text-hud-primary/60 border border-hud-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 2 && (
                      <span className="text-xs text-hud-primary/40">
                        +{article.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t hud-border">
        <div className="text-xs text-hud-primary/50 text-center">
          {filteredArticles.length} of {articles.length} bookmarks
        </div>
      </div>
    </div>
  )
}
