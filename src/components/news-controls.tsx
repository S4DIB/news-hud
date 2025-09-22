'use client'

import { Play, Pause, FastForward, Rewind, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/cn'

interface NewsControlsProps {
  isAutoScroll: boolean
  onToggleAutoScroll: () => void
  scrollSpeed: number
  onSpeedChange: (speed: number) => void
}

export function NewsControls({
  isAutoScroll,
  onToggleAutoScroll,
  scrollSpeed,
  onSpeedChange
}: NewsControlsProps) {
  const speedOptions = [30, 45, 60, 90, 120] // seconds

  const handleSpeedDecrease = () => {
    const currentIndex = speedOptions.indexOf(scrollSpeed)
    if (currentIndex > 0) {
      onSpeedChange(speedOptions[currentIndex - 1])
    }
  }

  const handleSpeedIncrease = () => {
    const currentIndex = speedOptions.indexOf(scrollSpeed)
    if (currentIndex < speedOptions.length - 1) {
      onSpeedChange(speedOptions[currentIndex + 1])
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center space-x-2 p-3 rounded-lg hud-border bg-hud-surface/40 backdrop-blur-md">
        {/* Speed down */}
        <button
          onClick={handleSpeedDecrease}
          disabled={scrollSpeed === speedOptions[0]}
          className={cn(
            "p-2 rounded hud-border bg-hud-surface/30 hover:bg-hud-surface/50 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed hover:hud-glow group"
          )}
          title="Slower"
        >
          <Rewind className="w-4 h-4 group-hover:text-hud-accent transition-colors" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onToggleAutoScroll}
          className={cn(
            "p-3 rounded hud-border transition-all hover:hud-glow group",
            isAutoScroll 
              ? "bg-hud-accent/20 text-hud-accent" 
              : "bg-hud-surface/30 hover:bg-hud-surface/50"
          )}
          title={isAutoScroll ? "Pause" : "Play"}
        >
          {isAutoScroll ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        {/* Speed up */}
        <button
          onClick={handleSpeedIncrease}
          disabled={scrollSpeed === speedOptions[speedOptions.length - 1]}
          className={cn(
            "p-2 rounded hud-border bg-hud-surface/30 hover:bg-hud-surface/50 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed hover:hud-glow group"
          )}
          title="Faster"
        >
          <FastForward className="w-4 h-4 group-hover:text-hud-accent transition-colors" />
        </button>

        {/* Speed indicator */}
        <div className="px-3 py-2 text-xs font-mono text-hud-primary/70 border-l border-hud-primary/30 ml-2">
          <div className="text-center">
            <div className="text-hud-accent font-semibold">{scrollSpeed}s</div>
            <div className="text-[10px] opacity-70">CYCLE</div>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => onSpeedChange(60)}
          className={cn(
            "p-2 rounded hud-border bg-hud-surface/30 hover:bg-hud-surface/50 transition-all",
            "border-l border-hud-primary/30 ml-2 hover:hud-glow group"
          )}
          title="Reset speed"
        >
          <RotateCcw className="w-4 h-4 group-hover:text-hud-accent transition-colors" />
        </button>
      </div>
    </div>
  )
}
