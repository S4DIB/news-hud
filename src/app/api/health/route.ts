import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test database connection
    const { data: feedData, error: feedError } = await supabase
      .from('feed_sources')
      .select('count')
      .limit(1)

    // Test articles table
    const { data: articlesData, error: articlesError } = await supabase
      .from('articles')
      .select('count')
      .limit(1)

    const errors = []
    if (feedError) errors.push(`Feed sources: ${feedError.message}`)
    if (articlesError) errors.push(`Articles: ${articlesError.message}`)

    if (errors.length > 0) {
      console.error('Database health check failed:', errors)
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          errors,
          timestamp: new Date().toISOString(),
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
          supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected',
        api: 'operational',
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      tables_tested: ['feed_sources', 'articles']
    })

  } catch (error: any) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing'
      },
      { status: 500 }
    )
  }
}
