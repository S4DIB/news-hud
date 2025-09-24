import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subreddit = searchParams.get('subreddit') || 'stocks'
  const sortType = searchParams.get('sort') || 'hot'
  const limit = searchParams.get('limit') || '8'

  try {
    console.log(`🔄 Proxying Reddit request: r/${subreddit}/${sortType}`)
    
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/${sortType}.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': 'HUD-News-App/1.0.0 (by /u/hud-news-app)',
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error(`❌ Reddit API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Reddit API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Add CORS headers to allow frontend access
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('❌ Error proxying Reddit request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Reddit' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
