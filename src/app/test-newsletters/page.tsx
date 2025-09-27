'use client'

import { useState } from 'react'
import { fetchNewslettersForInterests } from '@/lib/dynamicNews'

export default function TestNewslettersPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testNewsletters = async () => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      console.log('🧪 Testing newsletter integration...')
      
      // Test with AI-related interests
      const testInterests = ['Artificial Intelligence', 'Machine Learning']
      const articles = await fetchNewslettersForInterests(testInterests)
      
      console.log('📧 Newsletter test results:', articles)
      
      setResults({
        success: true,
        articlesCount: articles.length,
        articles: articles.map(article => ({
          id: article.id,
          title: article.title,
          source: article.sourceName,
          author: article.author,
          url: article.url,
          publishedAt: article.publishedAt,
          score: article.finalScore,
          tags: article.tags
        })),
        interests: testInterests
      })
      
    } catch (err: any) {
      console.error('❌ Newsletter test failed:', err)
      setError(err.message || 'Newsletter test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          📧 Newsletter Integration Test
        </h1>
        
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Newsletter Sources</h2>
          <p className="mb-4">
            This test will fetch content from:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>TLDR AI</strong> - AI and tech news summaries (RSS)</li>
            <li><strong>Rundown AI</strong> - Daily AI news and insights (RSS)</li>
            <li><strong>AI News</strong> - Artificial intelligence industry news (Sample data)</li>
          </ul>
        </div>

        <div className="text-center mb-8">
          <button
            onClick={testNewsletters}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {loading ? '🔄 Testing...' : '🧪 Test Newsletter Integration'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-600 p-4 rounded-lg mb-8">
            <h3 className="text-red-400 font-semibold mb-2">❌ Test Failed</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {results && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h3 className="text-green-400 font-semibold mb-4">
              ✅ Test Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-semibold text-blue-400">📊 Summary</h4>
                <p>Articles Found: <span className="text-yellow-400">{results.articlesCount}</span></p>
                <p>Test Interests: <span className="text-yellow-400">{results.interests.join(', ')}</span></p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-semibold text-blue-400">🔧 Status</h4>
                <p>Integration: <span className="text-green-400">✅ Working</span></p>
                <p>Sources: <span className="text-green-400">✅ Active</span></p>
              </div>
            </div>

            {results.articles.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-400 mb-4">📰 Sample Articles</h4>
                <div className="space-y-4">
                  {results.articles.slice(0, 3).map((article: any, index: number) => (
                    <div key={article.id} className="bg-gray-800 p-4 rounded border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-white">{article.title}</h5>
                        <span className="text-xs text-gray-400">Score: {article.score.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><strong>Source:</strong> {article.source}</p>
                        <p><strong>Author:</strong> {article.author}</p>
                        <p><strong>Published:</strong> {new Date(article.publishedAt).toLocaleDateString()}</p>
                        <p><strong>Tags:</strong> {article.tags.join(', ')}</p>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          View Article →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.articles.length === 0 && (
              <div className="bg-yellow-900 border border-yellow-600 p-4 rounded">
                <h4 className="text-yellow-400 font-semibold mb-2">⚠️ No Articles Found</h4>
                <p className="text-yellow-300">
                  This could mean:
                </p>
                <ul className="list-disc list-inside text-yellow-300 mt-2 space-y-1">
                  <li>RSS feeds are temporarily unavailable</li>
                  <li>No recent content matching the test interests</li>
                  <li>Network connectivity issues</li>
                  <li>RSS parsing service (rss2json.com) is down</li>
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-gray-900 p-6 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-4">🔍 How It Works</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>1. Interest Mapping:</strong> User interests are mapped to relevant newsletters</p>
            <p><strong>2. RSS Parsing:</strong> TLDR AI and Rundown AI use RSS feeds via rss2json.com</p>
            <p><strong>3. Content Processing:</strong> Articles are cleaned, scored, and tagged</p>
            <p><strong>4. Integration:</strong> Newsletter articles are mixed with other news sources</p>
            <p><strong>5. Deduplication:</strong> Duplicate articles are filtered out</p>
          </div>
        </div>
      </div>
    </div>
  )
}