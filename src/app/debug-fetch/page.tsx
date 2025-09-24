'use client'

import { useState } from 'react'
import { fetchDynamicNews } from '@/lib/dynamicNews'

export default function DebugFetch() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testFetch = async () => {
    setLoading(true)
    console.log('🔍 Starting debug fetch...')
    
    try {
      // Test with your exact interests
      const interests = ['Blockchain', 'Cloud Computing']
      console.log('Testing with interests:', interests)
      
      const articles = await fetchDynamicNews(interests)
      console.log('Debug fetch result:', articles)
      
      setResult({
        interests,
        articlesCount: articles.length,
        articles: articles.slice(0, 5) // First 5 articles
      })
    } catch (error) {
      console.error('Debug fetch error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', color: 'white', background: '#000' }}>
      <h1>🔍 Debug Dynamic News Fetch</h1>
      
      <button 
        onClick={testFetch} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          background: '#00d4ff', 
          color: 'black', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '🔄 Testing...' : '🧪 Test Dynamic Fetch'}
      </button>

      {result && (
        <div style={{ background: '#222', padding: '20px', borderRadius: '8px' }}>
          <h2>Results:</h2>
          <pre style={{ color: '#00ff00', fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
        <p>This page tests the dynamic news fetching directly.</p>
        <p>Check the browser console for detailed logs.</p>
        <p>Current interests being tested: "Blockchain", "Cloud Computing"</p>
      </div>
    </div>
  )
}
