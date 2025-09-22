export interface TwitterUser {
  id: string
  name: string
  username: string
  description?: string
  profile_image_url?: string
  verified?: boolean
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

export interface TwitterTweet {
  id: string
  text: string
  created_at: string
  author_id: string
  public_metrics?: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  context_annotations?: Array<{
    domain: {
      id: string
      name: string
      description: string
    }
    entity: {
      id: string
      name: string
      description?: string
    }
  }>
  entities?: {
    hashtags?: Array<{
      start: number
      end: number
      tag: string
    }>
    mentions?: Array<{
      start: number
      end: number
      username: string
      id: string
    }>
    urls?: Array<{
      start: number
      end: number
      url: string
      expanded_url: string
      display_url: string
      title?: string
      description?: string
    }>
  }
  attachments?: {
    media_keys?: string[]
  }
}

export interface TwitterApiResponse<T> {
  data?: T
  meta?: {
    result_count: number
    next_token?: string
    previous_token?: string
  }
  errors?: Array<{
    detail: string
    title: string
    type: string
  }>
}

export interface ProcessedTweet {
  id: string
  text: string
  cleanText: string
  author: {
    id: string
    name: string
    username: string
    profileImage?: string
    verified?: boolean
  }
  url: string
  createdAt: string
  engagement: {
    likes: number
    retweets: number
    replies: number
    quotes: number
    total: number
  }
  topics?: string[]
  hashtags?: string[]
  links?: Array<{
    url: string
    title?: string
    description?: string
  }>
  score: number
}
