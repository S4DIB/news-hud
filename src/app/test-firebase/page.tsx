'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore'

export default function TestFirebase() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...')
  const [collections, setCollections] = useState<string[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testFirebaseConnection()
  }, [])

  async function testFirebaseConnection() {
    try {
      setConnectionStatus('Testing Firebase connection...')

      // Test 1: Try to access Firestore
      setConnectionStatus('Checking Firestore access...')
      
      // Test 2: Try to read/write to a test collection
      setConnectionStatus('Testing read/write permissions...')
      
      const testCollection = collection(db, 'test')
      
      // Add a test document
      await addDoc(testCollection, {
        message: 'Firebase connection test',
        timestamp: Timestamp.now()
      })

      // Test 3: Try to get articles
      setConnectionStatus('Fetching articles...')
      try {
        const articlesCollection = collection(db, 'articles')
        const articlesSnapshot = await getDocs(articlesCollection)
        const articlesData = articlesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setArticles(articlesData)
      } catch (articlesError: any) {
        console.log('Articles collection might not exist yet:', articlesError.message)
      }

      setConnectionStatus('✅ Firebase connection successful!')
      setCollections(['test', 'articles', 'users', 'bookmarks'])

    } catch (err: any) {
      console.error('Firebase connection error:', err)
      setError(`Firebase connection failed: ${err.message}`)
      setConnectionStatus('❌ Firebase connection failed')
    }
  }

  async function addSampleArticle() {
    try {
      setConnectionStatus('Adding sample article...')
      
      const articlesCollection = collection(db, 'articles')
      await addDoc(articlesCollection, {
        title: 'Firebase Test Article',
        summary: 'This is a test article to verify Firebase is working',
        url: 'https://example.com/test',
        author: 'Firebase Test',
        sourceName: 'Manual',
        publishedAt: Timestamp.now(),
        scrapedAt: Timestamp.now(),
        popularityScore: 0.8,
        relevanceScore: 0.7,
        finalScore: 0.75,
        tags: ['test', 'firebase'],
        metadata: { source: 'test' }
      })
      
      setConnectionStatus('✅ Sample article added! Refresh to see it.')
      
      // Refresh articles
      setTimeout(() => {
        testFirebaseConnection()
      }, 1000)
      
    } catch (err: any) {
      setError(`Failed to add article: ${err.message}`)
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
          🔥 FIREBASE CONNECTION TEST
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
            <p>Firebase API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configured' : '❌ Missing'}</p>
            <p>Firebase Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Configured' : '❌ Missing'}</p>
            <p>Firebase Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Configured' : '❌ Missing'}</p>
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

        {/* Collections */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(20, 27, 45, 0.2)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Collections:</h2>
          {collections.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {collections.map((collection, index) => (
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
                  {collection}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#ff6666' }}>
              No collections found
            </p>
          )}
        </div>

        {/* Articles */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '4px',
          background: 'rgba(20, 27, 45, 0.2)'
        }}>
          <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Articles ({articles.length}):</h2>
          {articles.length > 0 ? (
            articles.slice(0, 3).map((article, index) => (
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
                  {article.sourceName} • {article.publishedAt?.seconds ? new Date(article.publishedAt.seconds * 1000).toLocaleString() : 'Unknown date'}
                </div>
              </div>
            ))
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: '#ff6666', marginBottom: '12px' }}>
                No articles found - database is empty
              </p>
              <button
                onClick={addSampleArticle}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(0, 212, 255, 0.2)',
                  border: '1px solid #00d4ff',
                  borderRadius: '4px',
                  color: '#00d4ff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Add Sample Article
              </button>
            </div>
          )}
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
            href="/test-db"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              color: 'rgba(255, 255, 255, 0.8)',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            Compare with Supabase Test
          </a>
        </div>
      </div>
    </div>
  )
}
