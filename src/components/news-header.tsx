'use client'

import { Settings, Bookmark, Activity, Zap } from 'lucide-react'
import { cn } from '@/utils/cn'

interface NewsHeaderProps {
  onSettingsClick: () => void
  onBookmarksClick: () => void
}

export function NewsHeader({ onSettingsClick, onBookmarksClick }: NewsHeaderProps) {
  return (
    <header className="h-20 border-b hud-border bg-hud-surface/20 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-hud-accent animate-pulse" />
            <h1 className="text-2xl font-digital font-bold hud-text-glow">
              HUD NEWS
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-hud-primary/70">
            <Activity className="w-4 h-4" />
            <span>LIVE FEED ACTIVE</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="hidden lg:flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-hud-primary rounded-full animate-pulse" />
            <span>AI RANKING</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-hud-accent rounded-full animate-pulse" />
            <span>SOURCES: 5</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>LAST UPDATE: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onBookmarksClick}
            className={cn(
              "p-2 rounded hud-border bg-hud-surface/30 hover:bg-hud-surface/50",
              "transition-all duration-200 hover:hud-glow group"
            )}
            title="Bookmarks"
          >
            <Bookmark className="w-5 h-5 group-hover:text-hud-accent transition-colors" />
          </button>
          <button
            onClick={onSettingsClick}
            className={cn(
              "p-2 rounded hud-border bg-hud-surface/30 hover:bg-hud-surface/50",
              "transition-all duration-200 hover:hud-glow group"
            )}
            title="Settings"
          >
            <Settings className="w-5 h-5 group-hover:text-hud-accent transition-colors" />
          </button>
        </div>
      </div>
    </header>
  )
}
