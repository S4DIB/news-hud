export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedSource {
  id: string;
  name: string;
  type: 'hackernews' | 'newsletter' | 'twitter' | 'reddit';
  url?: string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  url: string;
  author?: string;
  source_id: string;
  source_name: string;
  published_at: string;
  scraped_at: string;
  popularity_score: number;
  relevance_score: number;
  final_score: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface UserInterest {
  id: string;
  user_id: string;
  name: string;
  keywords: string[];
  weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  category?: string;
  notes?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  article?: Article;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  scroll_speed: number;
  content_mix_ratio: {
    interests: number;
    popular: number;
    serendipity: number;
  };
  ai_api_keys: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
  };
  notification_settings: {
    email: boolean;
    push: boolean;
    digest_frequency: 'daily' | 'weekly' | 'never';
  };
  theme: 'hud' | 'minimal' | 'classic';
  auto_scroll: boolean;
  show_source_icons: boolean;
  article_preview_length: number;
  created_at: string;
  updated_at: string;
}

export interface NewsletterConfig {
  email?: string;
  rss_url?: string;
  api_endpoint?: string;
}

export interface TwitterConfig {
  username: string;
  include_retweets: boolean;
  include_replies: boolean;
}

export interface RedditConfig {
  subreddit: string;
  sort_by: 'hot' | 'new' | 'top' | 'rising';
  time_filter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
}

export interface HackerNewsConfig {
  story_types: ('top' | 'new' | 'best' | 'ask' | 'show' | 'job')[];
  min_score: number;
}

export interface AIAnalysisResult {
  relevance_score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  summary: string;
  confidence: number;
}
