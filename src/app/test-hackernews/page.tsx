'use client'

import { useState } from 'react'

export default function TestHackerNewsPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [testResults, setTestResults] = useState<any>(null)

  const testHNConnection = async () => {
    try {
      setError('')
      setConnectionStatus('🔄 Testing HackerNews API connection...')
      
      const response = await fetch('/api/aggregation/hackernews')
      const data = await response.json()
      
      if (response.ok) {
        setConnectionStatus('✅ HackerNews API connection successful!')
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

  const testCategory = async (category: string, limit: number = 10) => {
    try {
      setError('')
      setConnectionStatus(`🔄 Testing HackerNews ${category} stories...`)
      
      const response = await fetch('/api/aggregation/hackernews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          limit
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus(`✅ ${category}: Found ${data.stats.stories_fetched} stories, added ${data.articles_added} articles`)
        setTestResults(data)
      } else {
        setError(`❌ ${category} failed: ${data.error}`)
        setConnectionStatus('')
      }
    } catch (err: any) {
      setError(`❌ Error testing ${category}: ${err.message}`)
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
            📰 HackerNews API Test
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Test HackerNews integration and pull top tech stories
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
            HackerNews API is public and doesn't require authentication
          </p>
          <button
            onClick={testHNConnection}
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
            🔗 Test HackerNews Connection
          </button>
        </div>

        {/* Test Different Categories */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(0, 212, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>🎯 Test Story Categories:</h2>
          <p style={{ fontSize: '12px', marginBottom: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Test fetching different types of stories from HackerNews
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={() => testCategory('top', 5)}
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
              🔥 Top Stories
            </button>
            <button
              onClick={() => testCategory('new', 5)}
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
              🆕 New Stories
            </button>
            <button
              onClick={() => testCategory('best', 5)}
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
              ⭐ Best Stories
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
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00ff64' }}>🚀 Add HackerNews Content to Your HUD News:</h2>
          <p style={{ fontSize: '12px', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            This will fetch top-ranked HackerNews stories and add them to your Firebase database.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={async () => {
                try {
                  setConnectionStatus('🔄 Aggregating HackerNews top stories...')
                  const response = await fetch('/api/aggregation/hackernews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      category: 'top',
                      limit: 25
                    })
                  })
                  const data = await response.json()
                  if (data.success) {
                    setConnectionStatus(`✅ Added ${data.articles_added} HackerNews articles to your news feed!`)
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
              📰 Add Top Stories
            </button>
            <button
              onClick={async () => {
                try {
                  setConnectionStatus('🔄 Aggregating HackerNews best stories...')
                  const response = await fetch('/api/aggregation/hackernews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      category: 'best',
                      limit: 15
                    })
                  })
                  const data = await response.json()
                  if (data.success) {
                    setConnectionStatus(`✅ Added ${data.articles_added} best HackerNews articles!`)
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
                background: 'rgba(255, 200, 0, 0.3)',
                border: '1px solid #ffc800',
                borderRadius: '4px',
                color: '#ffc800',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ⭐ Add Best Stories
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

        {/* API Information */}
        <div style={{
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>ℹ️ HackerNews API Info:</h2>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5' }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>✅ No Setup Required:</strong> HackerNews API is completely public
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>🔄 Real-time:</strong> Updates constantly with new submissions
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>📊 Quality Filtering:</strong> Minimum 10 points, max 3 days old
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>🏷️ Smart Tagging:</strong> Auto-categorizes AI, programming, startup content
            </p>
            <p>
              <strong>🎯 Categories:</strong> Top (HN algorithm), New (recent), Best (community votes)
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
