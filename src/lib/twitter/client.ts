import { TwitterUser, TwitterTweet, TwitterApiResponse } from './types'

export class TwitterClient {
  private bearerToken: string
  private baseUrl = 'https://api.twitter.com/2'

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'User-Agent': 'HUD-News-App/1.0',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Twitter API Error: ${response.status} - ${error.detail || error.error}`)
    }

    return response.json()
  }

  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    try {
      const data = await this.makeRequest(
        `/users/by/username/${username}?user.fields=id,name,username,description,public_metrics,profile_image_url,verified`
      )
      return data.data || null
    } catch (error) {
      console.error(`Failed to fetch user ${username}:`, error)
      return null
    }
  }

  async getUserTweets(
    userId: string, 
    maxResults: number = 10,
    excludeReplies: boolean = true
  ): Promise<TwitterTweet[]> {
    try {
      const excludeParam = excludeReplies ? '&exclude=replies' : ''
      const data = await this.makeRequest(
        `/users/${userId}/tweets?max_results=${maxResults}${excludeParam}&tweet.fields=id,text,created_at,author_id,public_metrics,context_annotations,entities,attachments&expansions=author_id&user.fields=name,username,profile_image_url`
      )
      
      return data.data || []
    } catch (error) {
      console.error(`Failed to fetch tweets for user ${userId}:`, error)
      return []
    }
  }

  async getUserTweetsByUsername(
    username: string,
    maxResults: number = 10,
    excludeReplies: boolean = true
  ): Promise<{ user: TwitterUser | null, tweets: TwitterTweet[] }> {
    const user = await this.getUserByUsername(username)
    if (!user) {
      return { user: null, tweets: [] }
    }

    const tweets = await this.getUserTweets(user.id, maxResults, excludeReplies)
    return { user, tweets }
  }

  async getBatchUserTweets(
    usernames: string[],
    maxResults: number = 5
  ): Promise<Array<{ username: string, user: TwitterUser | null, tweets: TwitterTweet[] }>> {
    const results = []
    
    // Process in batches to respect rate limits
    for (const username of usernames) {
      try {
        const { user, tweets } = await this.getUserTweetsByUsername(username, maxResults)
        results.push({ username, user, tweets })
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to process ${username}:`, error)
        results.push({ username, user: null, tweets: [] })
      }
    }

    return results
  }

  // Rate limit info
  async getRateLimitStatus(): Promise<any> {
    try {
      const response = await fetch('https://api.twitter.com/1.1/application/rate_limit_status.json', {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
        }
      })
      return response.json()
    } catch (error) {
      console.error('Failed to get rate limit status:', error)
      return null
    }
  }
}

export const createTwitterClient = () => {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  if (!bearerToken) {
    throw new Error('TWITTER_BEARER_TOKEN environment variable is required')
  }
  return new TwitterClient(bearerToken)
}
