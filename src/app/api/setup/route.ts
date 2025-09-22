import { NextResponse } from 'next/server'

// One-click setup endpoint for initial content population
export async function POST() {
  try {
    console.log('🚀 Starting one-time setup and content population...')
    
    // Trigger auto-aggregation
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/aggregation/auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const data = await response.json()
    
    if (data.success) {
      return NextResponse.json({
        success: true,
        message: 'Setup complete! Your HUD News is now populated with fresh content.',
        details: data,
        next_steps: [
          'Visit http://localhost:3000 to see your news feed',
          'Content will auto-update in real-time',
          'No more manual clicking required!'
        ]
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Setup encountered some issues',
        details: data
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Setup failed',
      message: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'One-click setup endpoint',
    description: 'Populates your HUD News with initial content from all sources',
    usage: 'POST /api/setup',
    what_it_does: [
      'Fetches latest Reddit tech discussions',
      'Gets top HackerNews stories',
      'Pulls Twitter updates (if configured)',
      'Aggregates newsletter content',
      'Sets up your app for real-time updates'
    ]
  })
}
