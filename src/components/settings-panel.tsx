'use client'

import { useState } from 'react'
import { X, Zap, Brain, Rss, Key, Palette } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SettingsPanelProps {
  scrollSpeed: number
  isAutoScroll: boolean
  onSpeedChange: (speed: number) => void
  onAutoScrollChange: (enabled: boolean) => void
  onClose: () => void
}

export function SettingsPanel({
  scrollSpeed,
  isAutoScroll,
  onSpeedChange,
  onAutoScrollChange,
  onClose
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'sources' | 'appearance'>('general')
  const [tempApiKey, setTempApiKey] = useState('')

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Zap },
    { id: 'ai' as const, label: 'AI Config', icon: Brain },
    { id: 'sources' as const, label: 'Sources', icon: Rss },
    { id: 'appearance' as const, label: 'Theme', icon: Palette },
  ]

  return (
    <div className="w-80 h-full bg-hud-surface/30 backdrop-blur-sm border-l hud-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b hud-border">
        <h2 className="font-digital font-semibold text-hud-primary hud-text-glow">
          SETTINGS
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-hud-primary/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b hud-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 p-3 text-xs font-mono uppercase tracking-wide transition-all",
              "hover:bg-hud-primary/10",
              activeTab === tab.id
                ? "bg-hud-primary/20 text-hud-accent border-b-2 border-hud-accent"
                : "text-hud-primary/70"
            )}
          >
            <tab.icon className="w-4 h-4 mx-auto mb-1" />
            <div>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-120px)]">
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Auto Scroll */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-hud-primary">
                Auto Scroll
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onAutoScrollChange(!isAutoScroll)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-all",
                    isAutoScroll ? "bg-hud-accent" : "bg-hud-primary/30"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-hud-background rounded-full transition-transform",
                      isAutoScroll && "translate-x-6"
                    )}
                  />
                </button>
                <span className="text-sm text-hud-primary/70">
                  {isAutoScroll ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Scroll Speed */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-hud-primary">
                Scroll Speed: {scrollSpeed}s per cycle
              </label>
              <input
                type="range"
                min={30}
                max={120}
                step={15}
                value={scrollSpeed}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                className="w-full h-2 bg-hud-primary/30 rounded-lg appearance-none slider"
              />
              <div className="flex justify-between text-xs text-hud-primary/50">
                <span>Fast (30s)</span>
                <span>Slow (120s)</span>
              </div>
            </div>

            {/* Content Mix */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-hud-primary">
                Content Mix
              </label>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Interests</span>
                  <span className="text-sm font-mono text-hud-accent">70%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Popular</span>
                  <span className="text-sm font-mono text-hud-accent">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Serendipity</span>
                  <span className="text-sm font-mono text-hud-accent">10%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* API Keys */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-hud-primary flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>AI API Keys</span>
              </h3>
              
              {/* Gemini API Key */}
              <div className="space-y-2">
                <label className="block text-xs text-hud-primary/70">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="w-full p-2 bg-hud-surface/30 border hud-border rounded text-sm text-hud-primary placeholder-hud-primary/40 focus:outline-none focus:ring-1 focus:ring-hud-accent"
                />
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-2">
                <label className="block text-xs text-hud-primary/70">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  className="w-full p-2 bg-hud-surface/30 border hud-border rounded text-sm text-hud-primary placeholder-hud-primary/40 focus:outline-none focus:ring-1 focus:ring-hud-accent"
                />
              </div>
            </div>

            {/* AI Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-hud-primary">
                AI Analysis Settings
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Content Analysis</span>
                  <div className="w-2 h-2 bg-hud-accent rounded-full animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Sentiment Analysis</span>
                  <div className="w-2 h-2 bg-hud-accent rounded-full animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Topic Extraction</span>
                  <div className="w-2 h-2 bg-hud-accent rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="space-y-6">
            {/* Active Sources */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-hud-primary">
                Active Sources
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'HackerNews', enabled: true, status: 'active' },
                  { name: 'Reddit - r/technology', enabled: true, status: 'active' },
                  { name: 'TLDR AI Newsletter', enabled: true, status: 'active' },
                  { name: 'RundownAI Newsletter', enabled: false, status: 'inactive' },
                  { name: 'Twitter Tech Accounts', enabled: true, status: 'rate_limited' },
                ].map((source) => (
                  <div key={source.name} className="flex items-center justify-between p-3 bg-hud-surface/20 rounded border hud-border">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        source.status === 'active' ? 'bg-hud-accent animate-pulse' :
                        source.status === 'rate_limited' ? 'bg-yellow-400' :
                        'bg-hud-primary/30'
                      )} />
                      <span className="text-sm text-hud-primary">{source.name}</span>
                    </div>
                    <button
                      className={cn(
                        "relative w-8 h-4 rounded-full transition-all",
                        source.enabled ? "bg-hud-accent" : "bg-hud-primary/30"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 left-0.5 w-3 h-3 bg-hud-background rounded-full transition-transform",
                          source.enabled && "translate-x-4"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Source */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-hud-primary">
                Add New Source
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="RSS feed or source URL"
                  className="flex-1 p-2 bg-hud-surface/30 border hud-border rounded text-sm text-hud-primary placeholder-hud-primary/40 focus:outline-none focus:ring-1 focus:ring-hud-accent"
                />
                <button className="px-4 py-2 bg-hud-accent/20 text-hud-accent border border-hud-accent rounded hover:bg-hud-accent/30 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-hud-primary">
                Theme
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { name: 'HUD Green', value: 'hud', color: 'bg-hud-primary' },
                  { name: 'Minimal Blue', value: 'minimal', color: 'bg-blue-400' },
                  { name: 'Classic White', value: 'classic', color: 'bg-white' },
                ].map((theme) => (
                  <div
                    key={theme.value}
                    className="flex items-center space-x-3 p-3 bg-hud-surface/20 rounded border hud-border cursor-pointer hover:bg-hud-surface/30"
                  >
                    <div className={cn("w-4 h-4 rounded-full", theme.color)} />
                    <span className="text-sm text-hud-primary">{theme.name}</span>
                    <div className="ml-auto w-2 h-2 bg-hud-accent rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-hud-primary">
                Display Options
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Show scan lines</span>
                  <div className="w-2 h-2 bg-hud-accent rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Show source icons</span>
                  <div className="w-2 h-2 bg-hud-accent rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-hud-primary/70">Glow effects</span>
                  <div className="w-2 h-2 bg-hud-accent rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
