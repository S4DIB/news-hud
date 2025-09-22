'use client'

import { useState } from 'react'

export default function TestTwitterPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [testResults, setTestResults] = useState<any>(null)
  const [rateLimits, setRateLimits] = useState<any>(null)

  const testTwitterConnection = async () => {
    try {
      setError('')
      setConnectionStatus('🔄 Testing Twitter API connection...')
      
      const response = await fetch('/api/aggregation/twitter')
      const data = await response.json()
      
      if (response.ok) {
        setConnectionStatus('✅ Twitter API connection successful!')
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

  const testSpecificAccount = async (username: string) => {
    try {
      setError('')
      setConnectionStatus(`🔄 Testing @${username}...`)
      
      const response = await fetch('/api/aggregation/twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: [username],
          maxTweetsPerAccount: 3
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus(`✅ @${username}: Found ${data.stats.total_tweets_fetched} tweets, added ${data.articles_added} articles`)
        setTestResults(data)
      } else {
        setError(`❌ @${username} failed: ${data.error}`)
        setConnectionStatus('')
      }
    } catch (err: any) {
      setError(`❌ Error testing @${username}: ${err.message}`)
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
            🐦 Twitter/X API Test
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Test your Twitter API connection and pull tweets from tech accounts
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
            Check if your Twitter Bearer Token is configured correctly
          </p>
          <button
            onClick={testTwitterConnection}
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
            🔗 Test Twitter Connection
          </button>
        </div>

        {/* Test Specific Accounts */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(0, 212, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>🎯 Test Specific Accounts:</h2>
          <p style={{ fontSize: '12px', marginBottom: '16px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Test fetching tweets from specific tech accounts
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['elonmusk', 'sama', 'OpenAI', 'techcrunch', 'verge'].map(username => (
              <button
                key={username}
                onClick={() => testSpecificAccount(username)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(0, 212, 255, 0.2)',
                  border: '1px solid rgba(0, 212, 255, 0.5)',
                  borderRadius: '4px',
                  color: '#00d4ff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                @{username}
              </button>
            ))}
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
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00ff64' }}>🚀 Add Twitter Content to Your HUD News:</h2>
          <p style={{ fontSize: '12px', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            This will fetch high-quality tweets from top tech accounts and add them to your Firebase database.
          </p>
          <button
            onClick={async () => {
              try {
                setConnectionStatus('🔄 Aggregating Twitter content...')
                const response = await fetch('/api/aggregation/twitter', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    accounts: ['elonmusk', 'sama', 'OpenAI', 'techcrunch', 'verge', 'paulg', 'naval', 'garrytan'],
                    maxTweetsPerAccount: 5
                  })
                })
                const data = await response.json()
                if (data.success) {
                  setConnectionStatus(`✅ Added ${data.articles_added} Twitter articles to your news feed!`)
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
            🐦 Aggregate Twitter Content to Firebase
          </button>
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

        {/* Setup Instructions */}
        <div style={{
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00d4ff' }}>📚 Setup Instructions:</h2>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.5' }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>1. Get Twitter API Access:</strong> Visit <span style={{ color: '#00d4ff' }}>developer.twitter.com</span>
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>2. Create App:</strong> Get your Bearer Token
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>3. Add to .env.local:</strong> <code style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2px 4px' }}>TWITTER_BEARER_TOKEN=your_token</code>
            </p>
            <p style={{ marginBottom: '8px' }}>
              <strong>4. Restart Server:</strong> <code style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2px 4px' }}>npm run dev</code>
            </p>
            <p>
              <strong>5. Check Setup Guide:</strong> See <span style={{ color: '#00d4ff' }}>TWITTER_API_SETUP.md</span> for detailed instructions
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
