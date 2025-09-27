'use client'

import { useState } from 'react'
import { fetchHackerNewsForInterests, fetchRedditForInterests, fetchTwitterForInterests, fetchNewsAPIForInterests, fetchNewslettersForInterests } from '@/lib/dynamicNews'

export default function TestSources() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})

  const testAllSources = async () => {
    setLoading(true)
    setResults({})
    
    const interests = ['Artificial Intelligence', 'Programming'] // Test interests
    
    try {
      // Test HackerNews
      console.log('Testing HackerNews...')
      const hnStart = Date.now()
      const hnArticles = await fetchHackerNewsForInterests(interests)
      const hnTime = Date.now() - hnStart
      setResults(prev => ({ ...prev, hackerNews: { count: hnArticles.length, time: hnTime, articles: hnArticles.slice(0, 3) } }))
      
      // Test Reddit
      console.log('Testing Reddit...')
      const redditStart = Date.now()
      const redditArticles = await fetchRedditForInterests(interests)
      const redditTime = Date.now() - redditStart
      setResults(prev => ({ ...prev, reddit: { count: redditArticles.length, time: redditTime, articles: redditArticles.slice(0, 3) } }))
      
      // Test Twitter
      console.log('Testing Twitter...')
      const twitterStart = Date.now()
      const twitterArticles = await fetchTwitterForInterests(interests)
      const twitterTime = Date.now() - twitterStart
      setResults(prev => ({ ...prev, twitter: { count: twitterArticles.length, time: twitterTime, articles: twitterArticles.slice(0, 3) } }))
      
      // Test NewsAPI
      console.log('Testing NewsAPI...')
      const newsStart = Date.now()
      const newsArticles = await fetchNewsAPIForInterests(interests)
      const newsTime = Date.now() - newsStart
      setResults(prev => ({ ...prev, newsAPI: { count: newsArticles.length, time: newsTime, articles: newsArticles.slice(0, 3) } }))
      
      // Test Newsletters
      console.log('Testing Newsletters...')
      const nlStart = Date.now()
      const nlArticles = await fetchNewslettersForInterests(interests)
      const nlTime = Date.now() - nlStart
      setResults(prev => ({ ...prev, newsletters: { count: nlArticles.length, time: nlTime, articles: nlArticles.slice(0, 3) } }))
      
    } catch (error) {
      console.error('Test error:', error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">News Sources Test Page</h1>
      
      <button
        onClick={testAllSources}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg mb-8 disabled:opacity-50"
      >
        {loading ? 'Testing Sources...' : 'Test All Sources'}
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* HackerNews */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-orange-500">🌐 HackerNews</h2>
          {results.hackerNews ? (
            <div>
              <p className="text-green-400 mb-2">✅ Working</p>
              <p className="text-sm text-gray-400 mb-2">Articles: {results.hackerNews.count}</p>
              <p className="text-sm text-gray-400 mb-4">Time: {results.hackerNews.time}ms</p>
              <div className="space-y-2">
                {results.hackerNews.articles.map((a: any, i: number) => (
                  <div key={i} className="text-xs p-2 bg-gray-700 rounded">
                    {a.title}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Not tested yet</p>
          )}
        </div>
        
        {/* Reddit */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-500">🔴 Reddit</h2>
          {results.reddit ? (
            <div>
              <p className="text-green-400 mb-2">✅ Working</p>
              <p className="text-sm text-gray-400 mb-2">Articles: {results.reddit.count}</p>
              <p className="text-sm text-gray-400 mb-4">Time: {results.reddit.time}ms</p>
              <div className="space-y-2">
                {results.reddit.articles.map((a: any, i: number) => (
                  <div key={i} className="text-xs p-2 bg-gray-700 rounded">
                    {a.title}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Not tested yet</p>
          )}
        </div>
        
        {/* Twitter */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-blue-400">🐦 Twitter/X</h2>
          {results.twitter ? (
            <div>
              {results.twitter.count > 0 ? (
                <>
                  <p className="text-green-400 mb-2">✅ Working</p>
                  <p className="text-sm text-gray-400 mb-2">Articles: {results.twitter.count}</p>
                  <p className="text-sm text-gray-400 mb-4">Time: {results.twitter.time}ms</p>
                  <div className="space-y-2">
                    {results.twitter.articles.map((a: any, i: number) => (
                      <div key={i} className="text-xs p-2 bg-gray-700 rounded">
                        {a.title}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-yellow-400 mb-2">⚠️ No API Key</p>
                  <p className="text-sm text-gray-400">Twitter API not configured</p>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Not tested yet</p>
          )}
        </div>
        
        {/* NewsAPI */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-500">📰 NewsAPI</h2>
          {results.newsAPI ? (
            <div>
              {results.newsAPI.count > 0 ? (
                <>
                  <p className="text-green-400 mb-2">✅ Working</p>
                  <p className="text-sm text-gray-400 mb-2">Articles: {results.newsAPI.count}</p>
                  <p className="text-sm text-gray-400 mb-4">Time: {results.newsAPI.time}ms</p>
                  <div className="space-y-2">
                    {results.newsAPI.articles.map((a: any, i: number) => (
                      <div key={i} className="text-xs p-2 bg-gray-700 rounded">
                        {a.title}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-yellow-400 mb-2">⚠️ Check API Key</p>
                  <p className="text-sm text-gray-400">NewsAPI may not be configured</p>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Not tested yet</p>
          )}
        </div>
        
        {/* Newsletters */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-purple-500">📧 Newsletters</h2>
          {results.newsletters ? (
            <div>
              <p className="text-green-400 mb-2">✅ Working</p>
              <p className="text-sm text-gray-400 mb-2">Articles: {results.newsletters.count}</p>
              <p className="text-sm text-gray-400 mb-4">Time: {results.newsletters.time}ms</p>
              <div className="space-y-2">
                {results.newsletters.articles.map((a: any, i: number) => (
                  <div key={i} className="text-xs p-2 bg-gray-700 rounded">
                    {a.title}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Not tested yet</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Test Interests Used:</h3>
        <p className="text-sm text-gray-400">Artificial Intelligence, Programming</p>
      </div>
      
      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Console Output:</h3>
        <p className="text-sm text-gray-400">Check browser console for detailed logs</p>
      </div>
    </div>
  )
}
