import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore'

export async function GET() {
  try {
    // Test Firebase connection
    const testCollection = collection(db, 'health-check')
    
    // Try to write a test document
    await addDoc(testCollection, {
      message: 'Health check test',
      timestamp: Timestamp.now()
    })
    
    // Try to read from articles collection
    let articlesCount = 0
    try {
      const articlesCollection = collection(db, 'articles')
      const articlesSnapshot = await getDocs(articlesCollection)
      articlesCount = articlesSnapshot.size
    } catch (articlesError) {
      console.log('Articles collection might not exist yet:', articlesError)
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: 'firebase',
      services: {
        firebase: 'connected',
        firestore: 'operational',
        api: 'operational'
      },
      environment: {
        firebase_api_key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'configured' : 'missing',
        firebase_project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'configured' : 'missing',
        firebase_auth_domain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'configured' : 'missing'
      },
      collections: {
        articles: articlesCount,
        health_check: 'accessible'
      }
    })

  } catch (error: any) {
    console.error('Firebase health check error:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message || 'Firebase connection failed',
        timestamp: new Date().toISOString(),
        database: 'firebase',
        environment: {
          firebase_api_key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'configured' : 'missing',
          firebase_project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'configured' : 'missing',
          firebase_auth_domain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'configured' : 'missing'
        }
      },
      { status: 500 }
    )
  }
}
