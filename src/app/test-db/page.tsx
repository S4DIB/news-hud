'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestDatabase() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [tables, setTables] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  async function testSupabaseConnection() {
    try {
      const supabase = createClient()
      
      // Test 1: Basic connection
      setConnectionStatus('Testing basic connection...')
      
      // Test 2: Check if tables exist
      setConnectionStatus('Checking database tables...')
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
      
      if (tablesError) {
        console.error('Tables error:', tablesError)
        setError(`Tables check failed: ${tablesError.message}`)
        setConnectionStatus('❌ Failed to check tables')
        return
      }

      setTables(tablesData || [])
      
      // Test 3: Try to fetch articles
      setConnectionStatus('Fetching sample articles...')
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('id, title, source_name, published_at')
        .limit(5)
      
      if (articlesError) {
        console.error('Articles error:', articlesError)
        setError(`Articles fetch failed: ${articlesError.message}`)
        setConnectionStatus('❌ Failed to fetch articles')
        return
      }

      setArticles(articlesData || [])
      setConnectionStatus('✅ Supabase connection successful!')
      
    } catch (err: any) {
      console.error('Connection error:', err)
      setError(`Connection failed: ${err.message}`)
      setConnectionStatus('❌ Connection failed')
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
          🔍 SUPABASE CONNECTION TEST
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

        {/* Tables Check */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(20, 27, 45, 0.2)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Database Tables:</h2>
          {tables.length > 0 ? (
            <div>
              <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '8px' }}>
                ✅ Found {tables.length} tables:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tables.map((table, index) => (
                  <span 
                    key={index}
                    style={{
                      padding: '4px 8px',
                      background: 'rgba(0, 212, 255, 0.2)',
                      border: '1px solid rgba(0, 212, 255, 0.4)',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {table.table_name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#ff6666' }}>
              ❌ No tables found or connection failed
            </p>
          )}
        </div>

        {/* Articles Check */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(20, 27, 45, 0.2)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Sample Articles:</h2>
          {articles.length > 0 ? (
            <div>
              <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '12px' }}>
                ✅ Found {articles.length} articles:
              </p>
              {articles.map((article, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '8px',
                    marginBottom: '8px',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '4px',
                    background: 'rgba(20, 27, 45, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#ffffff' }}>
                    {article.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(0, 212, 255, 0.7)', marginTop: '4px' }}>
                    {article.source_name} • {new Date(article.published_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#ff6666' }}>
              ❌ No articles found - database might be empty
            </p>
          )}
        </div>

        {/* Instructions */}
        <div style={{ 
          padding: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px', color: '#ffffff' }}>Next Steps:</h2>
          <ul style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '16px' }}>
            <li>If connection successful but no articles: Run the SQL migrations</li>
            <li>If connection failed: Check your .env.local file</li>
            <li>If tables missing: Run the database setup scripts</li>
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
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.3)'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)'
              e.currentTarget.style.color = '#00d4ff'
            }}
          >
            ← Back to HUD News
          </a>
        </div>
      </div>
    </div>
  )
}
