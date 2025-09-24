'use client'

import { useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export default function ClearDatabase() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const clearArticles = async () => {
    setLoading(true)
    setResult('🔄 Checking for stored articles...')
    
    try {
      // Check what's in the articles collection
      const articlesRef = collection(db, 'articles')
      const snapshot = await getDocs(articlesRef)
      
      console.log(`Found ${snapshot.docs.length} articles in Firebase`)
      setResult(prev => prev + `\n📊 Found ${snapshot.docs.length} articles in Firebase`)
      
      if (snapshot.docs.length > 0) {
        setResult(prev => prev + '\n🗑️ Deleting old articles...')
        
        // Delete all articles
        const deletePromises = snapshot.docs.map(article => 
          deleteDoc(doc(db, 'articles', article.id))
        )
        
        await Promise.all(deletePromises)
        setResult(prev => prev + `\n✅ Deleted ${snapshot.docs.length} old articles from Firebase`)
      } else {
        setResult(prev => prev + '\n✅ No old articles found - database is clean')
      }
      
      // Also check for any test collections
      const testCollections = ['test', 'health-check']
      for (const collectionName of testCollections) {
        try {
          const testRef = collection(db, collectionName)
          const testSnapshot = await getDocs(testRef)
          if (testSnapshot.docs.length > 0) {
            setResult(prev => prev + `\n🧹 Found ${testSnapshot.docs.length} documents in ${collectionName} collection`)
          }
        } catch (error) {
          // Collection might not exist, which is fine
        }
      }
      
    } catch (error) {
      console.error('Error clearing database:', error)
      setResult(prev => prev + `\n❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', color: 'white', background: '#000' }}>
      <h1>🗑️ Clear Database</h1>
      <p>This will remove any old articles stored in Firebase to ensure fresh content.</p>
      
      <button 
        onClick={clearArticles} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          background: '#ff4444', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '🔄 Checking...' : '🗑️ Clear Old Articles'}
      </button>

      {result && (
        <div style={{ 
          background: '#222', 
          padding: '20px', 
          borderRadius: '8px',
          whiteSpace: 'pre-line',
          fontFamily: 'monospace'
        }}>
          {result}
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
        <p><strong>What this does:</strong></p>
        <ul>
          <li>Checks for any articles stored in Firebase</li>
          <li>Deletes old articles that might be causing stale content</li>
          <li>Ensures your app fetches fresh content from APIs only</li>
          <li>Does NOT delete user profiles, interests, or bookmarks</li>
        </ul>
      </div>
    </div>
  )
}
