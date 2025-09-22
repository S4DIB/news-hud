import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subreddit = searchParams.get('subreddit') || 'technology'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Test Reddit API connection
    console.log(`Testing Reddit API for r/${subreddit}`)
    
    const userAgent = process.env.REDDIT_USER_AGENT || 'HUD-News-App/1.0 by YourUsername'
    
    // Fetch subreddit posts
    const postsResponse = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/json'
        }
      }
    )

    if (!postsResponse.ok) {
      const errorText = await postsResponse.text()
      console.error('Reddit API Error:', {
        status: postsResponse.status,
        statusText: postsResponse.statusText,
        body: errorText
      })
      
      if (postsResponse.status === 429) {
        return NextResponse.json({
          error: 'Rate limited by Reddit API. Please wait a minute and try again.',
          status: 429,
          details: 'Too many requests'
        }, { status: 429 })
      }
      
      if (postsResponse.status === 403) {
        return NextResponse.json({
          error: 'Forbidden - Check your User-Agent configuration',
          status: 403,
          details: 'Reddit requires a proper User-Agent header'
        }, { status: 403 })
      }
      
      if (postsResponse.status === 404) {
        return NextResponse.json({
          error: `Subreddit r/${subreddit} not found or is private`,
          status: 404,
          details: 'Subreddit does not exist or requires special access'
        }, { status: 404 })
      }

      throw new Error(`Reddit API returned ${postsResponse.status}: ${postsResponse.statusText}`)
    }

    const postsData = await postsResponse.json()
    const posts = postsData.data?.children?.map((child: any) => child.data) || []

    // Get subreddit info
    let subredditInfo = null
    try {
      const aboutResponse = await fetch(
        `https://www.reddit.com/r/${subreddit}/about.json`,
        {
          headers: {
            'User-Agent': userAgent,
            'Accept': 'application/json'
          }
        }
      )
      
      if (aboutResponse.ok) {
        const aboutData = await aboutResponse.json()
        subredditInfo = {
          name: aboutData.data?.display_name,
          subscribers: aboutData.data?.subscribers,
          active_users: aboutData.data?.active_user_count,
          description: aboutData.data?.public_description
        }
      }
    } catch (aboutError) {
      console.log('Could not fetch subreddit info:', aboutError)
    }

    // Return success response
    return NextResponse.json({
      status: 'success',
      subreddit: subreddit,
      posts_count: posts.length,
      posts: posts,
      subreddit_info: subredditInfo,
      api_info: {
        user_agent: userAgent,
        client_id_configured: !!process.env.REDDIT_CLIENT_ID,
        client_secret_configured: !!process.env.REDDIT_CLIENT_SECRET,
        rate_limit_remaining: postsResponse.headers.get('x-ratelimit-remaining'),
        rate_limit_reset: postsResponse.headers.get('x-ratelimit-reset')
      },
      sample_post: posts[0] ? {
        title: posts[0].title,
        author: posts[0].author,
        score: posts[0].score,
        comments: posts[0].num_comments,
        url: posts[0].url,
        subreddit: posts[0].subreddit
      } : null
    })

  } catch (error: any) {
    console.error('Reddit API test error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Unknown error occurred',
      details: {
        message: 'Failed to connect to Reddit API',
        possible_causes: [
          'Network connectivity issues',
          'Reddit API is down',
          'Invalid User-Agent configuration',
          'Rate limiting (too many requests)'
        ],
        environment_check: {
          client_id_configured: !!process.env.REDDIT_CLIENT_ID,
          client_secret_configured: !!process.env.REDDIT_CLIENT_SECRET,
          user_agent_configured: !!process.env.REDDIT_USER_AGENT
        }
      }
    }, { status: 500 })
  }
}
