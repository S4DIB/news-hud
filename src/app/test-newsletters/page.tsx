'use client'

import { useState } from 'react'

export default function TestNewslettersPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [testResults, setTestResults] = useState<any>(null)

  const testNewsletterConnection = async () => {
    try {
      setError('')
      setConnectionStatus('🔄 Testing Newsletter API connection...')
      
      const response = await fetch('/api/aggregation/newsletters')
      const data = await response.json()
      
      if (response.ok) {
        setConnectionStatus('✅ Newsletter API connection successful!')
        setTestResults(data)
      } else {
        setError(`❌ Connection failed: ${data.error || data.message}`)
        setConnectionStatus('')
      }
    } catch (err: any) {
      setError(`❌ Connection error: ${err.message}`)
      setConnectionStatus('')
    }
  }

  const testSpecificNewsletter = async (newsletter: string) => {
    try {
      setError('')
      setConnectionStatus(`🔄 Testing ${newsletter}...`)
      
      const response = await fetch('/api/aggregation/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletters: [newsletter],
          maxItemsPerNewsletter: 3
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus(`✅ ${newsletter}: Found ${data.stats.total_items_fetched} items, added ${data.articles_added} articles`)
        setTestResults(data)
      } else {
        setError(`❌ ${newsletter} failed: ${data.error}`)
        setConnectionStatus('')
      }
    } catch (err: any) {
      setError(`❌ Error testing ${newsletter}: ${err.message}`)
      setConnectionStatus('')
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          marginBottom: '32px',
          padding: '20px',
          border: '1px solid var(--hud-border)',
          borderRadius: '4px',
          background: 'rgba(0, 212, 255, 0.1)'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '12px', color: '#00d4ff' }}>
            📧 Newsletter Integration Test
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Test newsletter parsing for TLDR AI, Rundown AI, and AI News
          </p>
        </div>

        {/* Status Display */}
        {connectionStatus && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid rgba(0, 255, 100, 0.3)',
            borderRadius: '4px',
            background: 'rgba(0, 255, 100, 0.1)',
            color: '#00ff64'
          }}>
            {connectionStatus}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid rgba(255, 100, 100, 0.3)',
            borderRadius: '4px',
            background: 'rgba(255, 100, 100, 0.1)',
            color: '#ff6464'
          }}>
            {error}
          </div>
        )}

        {/* Test Connection */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(0, 212, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>🔧 Test API Connection:</h2>
          <p style={{ fontSize: '12px', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Check newsletter parsing configuration and available sources
          </p>
          <button
            onClick={testNewsletterConnection}
            style={{
              padding: '12px 24px',
              background: 'rgba(0, 212, 255, 0.3)',
              border: '1px solid #00d4ff',
              borderRadius: '4px',
              color: '#00d4ff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🔗 Test Newsletter Connection
          </button>
        </div>

        {/* Test Individual Newsletters */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(0, 212, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>🎯 Test Individual Newsletters:</h2>
          <p style={{ fontSize: '12px', marginBottom: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Test fetching content from specific AI newsletters
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={() => testSpecificNewsletter('tldr-ai')}
              style={{
                padding: '10px 20px',
                background: 'rgba(0, 212, 255, 0.2)',
                border: '1px solid rgba(0, 212, 255, 0.5)',
                borderRadius: '4px',
                color: '#00d4ff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📰 TLDR AI
            </button>
            <button
              onClick={() => testSpecificNewsletter('rundown-ai')}
              style={{
                padding: '10px 20px',
                background: 'rgba(0, 212, 255, 0.2)',
                border: '1px solid rgba(0, 212, 255, 0.5)',
                borderRadius: '4px',
                color: '#00d4ff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🤖 Rundown AI
            </button>
            <button
              onClick={() => testSpecificNewsletter('ai-news')}
              style={{
                padding: '10px 20px',
                background: 'rgba(0, 212, 255, 0.2)',
                border: '1px solid rgba(0, 212, 255, 0.5)',
                borderRadius: '4px',
                color: '#00d4ff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🧠 AI News
            </button>
          </div>
        </div>

        {/* Aggregate to Database */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 255, 100, 0.3)',
          borderRadius: '4px',
          background: 'rgba(0, 255, 100, 0.1)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00ff64' }}>🚀 Add Newsletter Content to Your HUD News:</h2>
          <p style={{ fontSize: '12px', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            This will fetch the latest content from AI newsletters and add them to your Firebase database.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={async () => {
                try {
                  setConnectionStatus('🔄 Aggregating all newsletters...')
                  const response = await fetch('/api/aggregation/newsletters', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      newsletters: ['tldr-ai', 'rundown-ai', 'ai-news'],
                      maxItemsPerNewsletter: 5
                    })
                  })
                  const data = await response.json()
                  if (data.success) {
                    setConnectionStatus(`✅ Added ${data.articles_added} newsletter articles to your news feed!`)
                    setTestResults(data)
                  } else {
                    setError(`Aggregation failed: ${data.error}`)
                  }
                } catch (err: any) {
                  setError(`Aggregation error: ${err.message}`)
                }
              }}
              style={{
                padding: '12px 24px',
                background: 'rgba(0, 255, 100, 0.3)',
                border: '1px solid #00ff64',
                borderRadius: '4px',
                color: '#00ff64',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              📧 Aggregate All Newsletters
            </button>
            <button
              onClick={async () => {
                try {
                  setConnectionStatus('🔄 Aggregating RSS newsletters only...')
                  const response = await fetch('/api/aggregation/newsletters', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      newsletters: ['tldr-ai', 'rundown-ai'],
                      maxItemsPerNewsletter: 7
                    })
                  })
                  const data = await response.json()
                  if (data.success) {
                    setConnectionStatus(`✅ Added ${data.articles_added} RSS newsletter articles!`)
                    setTestResults(data)
                  } else {
                    setError(`RSS aggregation failed: ${data.error}`)
                  }
                } catch (err: any) {
                  setError(`RSS aggregation error: ${err.message}`)
                }
              }}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 200, 0, 0.3)',
                border: '1px solid #ffc800',
                borderRadius: '4px',
                color: '#ffc800',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              📡 RSS Only (TLDR + Rundown)
            </button>
          </div>
        </div>

        {/* Results Display */}
        {testResults && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.05)'
          }}>
            <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>📊 Test Results:</h2>
            <pre style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}

        {/* Newsletter Information */}
        <div style={{
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>📚 Newsletter Sources:</h2>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#00ff64' }}>📰 TLDR AI:</strong>
              <div style={{ marginLeft: '16px', marginTop: '4px' }}>
                • RSS feed from tldr.tech/ai/feed<br/>
                • Daily AI and tech news summaries<br/>
                • High-quality curated content
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#00ff64' }}>🤖 Rundown AI:</strong>
              <div style={{ marginLeft: '16px', marginTop: '4px' }}>
                • RSS feed from therundown.ai<br/>
                • Daily AI news and insights<br/>
                • Industry analysis and trends
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#ffc800' }}>🧠 AI News (Sample):</strong>
              <div style={{ marginLeft: '16px', marginTop: '4px' }}>
                • Sample data (web scraping not implemented)<br/>
                • Would parse artificialintelligence-news.com<br/>
                • Requires server-side scraping service
              </div>
            </div>
            <div style={{ marginTop: '16px', padding: '8px', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '4px' }}>
              <strong>ℹ️ Note:</strong> Some newsletters may require CORS proxy services or server-side parsing.
              RSS feeds work best for reliable automated aggregation.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
