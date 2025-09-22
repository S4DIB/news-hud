'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState<any>(null)

  const runSetup = async () => {
    setLoading(true)
    setStatus('🚀 Setting up your HUD News with fresh content...')
    
    try {
      const response = await fetch('/api/setup', {
        method: 'POST'
      })
      
      const data = await response.json()
      setSetupData(data)
      
      if (data.success) {
        setStatus(`✅ Setup complete! Added ${data.details.summary.total_articles} articles from ${data.details.summary.successful_sources} sources.`)
      } else {
        setStatus(`❌ Setup failed: ${data.message}`)
      }
    } catch (error: any) {
      setStatus(`❌ Setup error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--hud-background)',
      color: 'var(--hud-primary)',
      fontFamily: "'Courier New', monospace",
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          border: '1px solid var(--hud-border)',
          borderRadius: '4px',
          background: 'rgba(0, 212, 255, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '16px', color: '#00d4ff' }}>
            🚀 HUD News Setup
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5' }}>
            One-click setup to populate your news feed with the latest content from all sources
          </p>
        </div>

        {/* Status */}
        {status && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid rgba(0, 255, 100, 0.3)',
            borderRadius: '4px',
            background: 'rgba(0, 255, 100, 0.1)',
            color: status.includes('❌') ? '#ff6464' : '#00ff64'
          }}>
            {status}
          </div>
        )}

        {/* Setup Button */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          border: '1px solid rgba(0, 255, 100, 0.3)',
          borderRadius: '4px',
          background: 'rgba(0, 255, 100, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#00ff64' }}>
            Ready to populate your news feed?
          </h2>
          <p style={{ fontSize: '14px', marginBottom: '20px', color: 'rgba(255, 255, 255, 0.8)' }}>
            This will fetch the latest content from Reddit, HackerNews, Twitter (if configured), and newsletters.
          </p>
          <button
            onClick={runSetup}
            disabled={loading}
            style={{
              padding: '16px 32px',
              background: loading ? 'rgba(100, 100, 100, 0.3)' : 'rgba(0, 255, 100, 0.3)',
              border: `1px solid ${loading ? '#666' : '#00ff64'}`,
              borderRadius: '4px',
              color: loading ? '#666' : '#00ff64',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'inherit'
            }}
          >
            {loading ? '🔄 Setting up...' : '🚀 Setup HUD News'}
          </button>
        </div>

        {/* What happens */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>
            📋 What this setup does:
          </h3>
          <ul style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}>🔴 <strong>Reddit:</strong> Fetches latest tech discussions from r/technology, r/programming, etc.</li>
            <li style={{ marginBottom: '8px' }}>🌐 <strong>HackerNews:</strong> Gets top-ranked stories and discussions</li>
            <li style={{ marginBottom: '8px' }}>🐦 <strong>Twitter:</strong> Pulls updates from tech accounts (if API configured)</li>
            <li style={{ marginBottom: '8px' }}>📧 <strong>Newsletters:</strong> Aggregates from TLDR AI and Rundown AI</li>
            <li style={{ marginBottom: '8px' }}>⚡ <strong>Real-time:</strong> Sets up live updates so content stays fresh</li>
          </ul>
        </div>

        {/* Results */}
        {setupData && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.05)'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>
              📊 Setup Results:
            </h3>
            <pre style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(setupData, null, 2)}
            </pre>
          </div>
        )}

        {/* Next Steps */}
        {setupData?.success && (
          <div style={{
            padding: '20px',
            border: '1px solid rgba(0, 255, 100, 0.3)',
            borderRadius: '4px',
            background: 'rgba(0, 255, 100, 0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#00ff64' }}>
              🎉 You're all set!
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '20px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Your HUD News is now populated with fresh content and will update automatically.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'rgba(0, 212, 255, 0.3)',
                border: '1px solid #00d4ff',
                borderRadius: '4px',
                color: '#00d4ff',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🎯 View Your HUD News Feed
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
