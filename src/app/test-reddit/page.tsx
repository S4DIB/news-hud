'use client'

import { useEffect, useState } from 'react'

export default function TestReddit() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [posts, setPosts] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [subredditData, setSubredditData] = useState<any>(null)

  useEffect(() => {
    testRedditAPI()
  }, [])

  async function testRedditAPI() {
    try {
      setConnectionStatus('Testing Reddit API connection...')

      // Test 1: Basic API access (no auth needed)
      setConnectionStatus('Fetching r/technology posts...')
      
      const response = await fetch('/api/test-reddit')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed')
      }

      setConnectionStatus('✅ Reddit API connection successful!')
      setPosts(data.posts || [])
      setSubredditData(data.subreddit_info || {})
      
    } catch (err: any) {
      console.error('Reddit API error:', err)
      setError(`Reddit API failed: ${err.message}`)
      setConnectionStatus('❌ Reddit API connection failed')
    }
  }

  async function testDifferentSubreddit(subreddit: string) {
    try {
      setConnectionStatus(`Testing r/${subreddit}...`)
      
      const response = await fetch(`/api/test-reddit?subreddit=${subreddit}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Subreddit test failed')
      }

      setPosts(data.posts || [])
      setConnectionStatus(`✅ Successfully fetched r/${subreddit} posts!`)
      
    } catch (err: any) {
      setError(`Failed to fetch r/${subreddit}: ${err.message}`)
    }
  }

  return (
    <div style={{ 
      padding: '40px', 
      background: '#0a0e1a', 
      color: '#00d4ff', 
      minHeight: '100vh',
      fontFamily: 'Courier New, monospace'
    }}>
      <div style={{
        border: '1px solid #00d4ff',
        borderRadius: '8px',
        padding: '24px',
        background: 'rgba(20, 27, 45, 0.3)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          marginBottom: '24px',
          textShadow: '0 0 10px #00d4ff'
        }}>
          🔴 REDDIT API CONNECTION TEST
        </h1>
        
        {/* Connection Status */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(20, 27, 45, 0.2)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Connection Status:</h2>
          <p style={{ fontSize: '14px', color: connectionStatus.includes('✅') ? '#ffffff' : '#00d4ff' }}>
            {connectionStatus}
          </p>
        </div>

        {/* Environment Check */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(20, 27, 45, 0.2)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Environment Variables:</h2>
          <div style={{ fontSize: '12px' }}>
            <p>Reddit Client ID: {process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID ? '✅ Configured' : '❌ Missing'}</p>
            <p>Reddit User Agent: {process.env.NEXT_PUBLIC_REDDIT_USER_AGENT ? '✅ Configured' : '❌ Missing'}</p>
            <p>Note: Client Secret is server-side only (hidden for security)</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ 
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid #ff4444',
            borderRadius: '4px',
            background: 'rgba(255, 68, 68, 0.1)',
            color: '#ff6666'
          }}>
            <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>❌ Error:</h2>
            <p style={{ fontSize: '12px' }}>{error}</p>
          </div>
        )}

        {/* Subreddit Info */}
        {subredditData && (
          <div style={{ 
            marginBottom: '24px',
            padding: '16px',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '4px',
            background: 'rgba(20, 27, 45, 0.2)'
          }}>
            <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Subreddit Info:</h2>
            <div style={{ fontSize: '12px' }}>
              <p>Subreddit: r/{subredditData.name}</p>
              <p>Subscribers: {subredditData.subscribers?.toLocaleString()}</p>
              <p>Active Users: {subredditData.active_users?.toLocaleString()}</p>
              <p>Posts Retrieved: {posts.length}</p>
            </div>
          </div>
        )}

        {/* Test Different Subreddits */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(20, 27, 45, 0.2)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Test Different Subreddits:</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['technology', 'programming', 'MachineLearning', 'webdev', 'artificial', 'startups'].map((sub) => (
              <button
                key={sub}
                onClick={() => testDifferentSubreddit(sub)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(0, 212, 255, 0.2)',
                  border: '1px solid #00d4ff',
                  borderRadius: '4px',
                  color: '#00d4ff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                r/{sub}
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
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#00ff64' }}>🚀 Add Reddit Content to Your HUD News:</h2>
          <p style={{ fontSize: '12px', marginBottom: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            This will fetch quality posts from tech subreddits and add them to your Firebase database.
          </p>
          <button
            onClick={async () => {
              try {
                setConnectionStatus('🔄 Aggregating Reddit content...')
                const response = await fetch('/api/aggregation/reddit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subreddits: ['technology', 'programming', 'MachineLearning', 'startups'],
                    limit: 10
                  })
                })
                const data = await response.json()
                if (data.success) {
                  setConnectionStatus(`✅ Added ${data.articles_added} articles to your news feed!`)
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
            🔴 Aggregate Reddit Content to Firebase
          </button>
        </div>

        {/* Posts Display */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(20, 27, 45, 0.2)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Latest Posts ({posts.length}):</h2>
          {posts.length > 0 ? (
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {posts.slice(0, 5).map((post, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '12px',
                    marginBottom: '12px',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '4px',
                    background: 'rgba(20, 27, 45, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#ffffff', marginBottom: '4px', fontWeight: 'bold' }}>
                    {post.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(0, 212, 255, 0.7)', marginBottom: '6px' }}>
                    r/{post.subreddit} • by u/{post.author} • {post.score} upvotes • {post.num_comments} comments
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {post.domain} • {new Date(post.created_utc * 1000).toLocaleString()}
                  </div>
                  {post.url && post.url !== `https://www.reddit.com${post.permalink}` && (
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '10px', 
                        color: '#00d4ff', 
                        textDecoration: 'none',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    >
                      🔗 {post.url.substring(0, 50)}...
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#ff6666' }}>
              No posts found - check API connection
            </p>
          )}
        </div>

        {/* Instructions */}
        <div style={{ 
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px', color: '#ffffff' }}>API Status Guide:</h2>
          <ul style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '16px' }}>
            <li>✅ Success: Reddit API is working, posts retrieved</li>
            <li>❌ Rate Limited: Wait 1 minute and try again</li>
            <li>❌ 403 Forbidden: Check User-Agent configuration</li>
            <li>❌ 404 Not Found: Subreddit doesn't exist or is private</li>
            <li>❌ Network Error: Check internet connection</li>
          </ul>
        </div>

        {/* Back Button */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid #00d4ff',
              borderRadius: '4px',
              color: '#00d4ff',
              textDecoration: 'none',
              fontSize: '14px',
              marginRight: '12px'
            }}
          >
            ← Back to HUD News
          </a>
          <a 
            href="/test-firebase"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'rgba(255, 165, 0, 0.2)',
              border: '1px solid #ffa500',
              borderRadius: '4px',
              color: '#ffa500',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            🔥 Test Firebase
          </a>
        </div>
      </div>
    </div>
  )
}
