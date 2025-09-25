// Dynamic news fetching based on user interests
// This replaces storing articles in Firebase with real-time API calls

import { createTwitterClient } from './twitter/client'

export interface DynamicArticle {
  id: string
  title: string
  summary?: string
  url: string
  author?: string
  sourceName: string
  publishedAt: Date
  popularityScore: number
  finalScore: number
  tags: string[]
  metadata: any
  relevanceScore?: number
}

// Map interests to search terms for different APIs
const INTEREST_TO_SEARCH_TERMS: Record<string, string[]> = {
  // Technology
  'Artificial Intelligence': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural network', 'deep learning', 'openai', 'chatgpt', 'gpt', 'llm', 'gemini', 'claude', 'anthropic', 'transformer', 'nlp', 'computer vision'],
  'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'scikit', 'pandas', 'data science', 'algorithm', 'model', 'training'],
  'Programming': ['programming', 'coding', 'software', 'development', 'javascript', 'python', 'java', 'react', 'nodejs', 'typescript', 'golang', 'rust', 'c++', 'github', 'git'],
  'Web Development': ['web development', 'frontend', 'backend', 'html', 'css', 'javascript', 'react', 'vue', 'angular', 'nodejs', 'api', 'rest', 'graphql'],
  'Mobile Development': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'app development', 'mobile app'],
  'DevOps': ['devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'jenkins', 'github actions', 'infrastructure', 'deployment', 'monitoring'],
  'Cybersecurity': ['cybersecurity', 'security', 'hacking', 'privacy', 'encryption', 'vulnerability', 'breach', 'malware', 'firewall', 'penetration testing'],
  'Blockchain': ['blockchain', 'cryptocurrency', 'crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'web3', 'defi', 'nft', 'smart contract', 'solana', 'polygon', 'chainlink', 'dapp', 'dao', 'token'],
  'Cloud Computing': ['cloud', 'aws', 'azure', 'google cloud', 'gcp', 'serverless', 'kubernetes', 'docker', 'microservices', 'containers', 'lambda', 'ec2', 's3', 'compute engine'],
  'Data Science': ['data science', 'analytics', 'big data', 'statistics', 'visualization', 'pandas', 'numpy', 'jupyter', 'tableau', 'sql'],

  // Business
  'Startups': ['startup', 'entrepreneur', 'venture capital', 'vc', 'funding', 'seed', 'series a', 'unicorn', 'ipo', 'founder', 'y combinator', 'techcrunch'],
  'Entrepreneurship': ['entrepreneur', 'business', 'startup', 'founder', 'innovation', 'venture', 'investment', 'scaling'],
  'Finance': ['finance', 'fintech', 'banking', 'investment', 'money', 'economy', 'financial', 'trading', 'market'],
  'Investing': ['investing', 'stocks', 'trading', 'portfolio', 'dividends', 'market', 'nasdaq', 'sp500', 'etf', 'bonds'],
  'Stock Market': ['stock market', 'stocks', 'trading', 'investing', 'portfolio', 'market', 'nasdaq', 'sp500', 'etf', 'bonds', 'equity', 'shares', 'wallstreet', 'bull market', 'bear market'],
  'Marketing': ['marketing', 'advertising', 'branding', 'seo', 'social media', 'digital marketing', 'content marketing', 'growth'],
  'Product Management': ['product management', 'product manager', 'pm', 'product', 'roadmap', 'features', 'user experience', 'ux'],
  'Leadership': ['leadership', 'management', 'manager', 'ceo', 'executive', 'team', 'culture', 'workplace'],
  'E-commerce': ['ecommerce', 'e-commerce', 'online shopping', 'retail', 'shopify', 'amazon', 'marketplace', 'sales'],
  'Cryptocurrency': ['cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'trading', 'defi', 'nft', 'altcoin', 'blockchain'],

  // Science
  'Space': ['space', 'nasa', 'spacex', 'astronomy', 'mars', 'rocket', 'satellite', 'iss', 'moon', 'universe', 'cosmos'],
  'Physics': ['physics', 'quantum', 'relativity', 'particle', 'energy', 'cern', 'nuclear', 'theoretical physics'],
  'Biology': ['biology', 'genetics', 'dna', 'evolution', 'genome', 'crispr', 'biotech', 'medical research'],
  'Climate Change': ['climate change', 'global warming', 'environment', 'renewable energy', 'carbon', 'sustainability', 'green tech'],
  'Medical Research': ['medical', 'healthcare', 'medicine', 'clinical', 'pharma', 'drug', 'treatment', 'vaccine', 'therapy'],
  'Chemistry': ['chemistry', 'chemical', 'molecules', 'reaction', 'lab', 'synthesis', 'materials'],
  'Neuroscience': ['neuroscience', 'brain', 'neural', 'neurons', 'cognitive', 'psychology', 'mind'],
  'Psychology': ['psychology', 'mental health', 'behavior', 'cognitive', 'therapy', 'brain', 'mind'],
  'Environment': ['environment', 'ecology', 'conservation', 'wildlife', 'nature', 'pollution', 'ecosystem'],
  'Innovation': ['innovation', 'invention', 'breakthrough', 'discovery', 'research', 'technology', 'future'],

  // Lifestyle
  'Gaming': ['gaming', 'games', 'video games', 'esports', 'steam', 'nintendo', 'xbox', 'playstation', 'pc gaming', 'mobile gaming'],
  'Health & Fitness': ['health', 'fitness', 'exercise', 'nutrition', 'wellness', 'workout', 'diet', 'mental health'],
  'Travel': ['travel', 'tourism', 'vacation', 'adventure', 'destination', 'hotel', 'flight', 'backpacking'],
  'Food': ['food', 'cooking', 'recipe', 'restaurant', 'cuisine', 'chef', 'culinary', 'dining'],
  'Photography': ['photography', 'photo', 'camera', 'lens', 'portrait', 'landscape', 'digital photography'],
  'Movies & TV': ['movies', 'films', 'tv shows', 'television', 'netflix', 'streaming', 'cinema', 'entertainment'],
  'Music': ['music', 'songs', 'album', 'artist', 'band', 'concert', 'spotify', 'audio'],
  'Books': ['books', 'reading', 'novel', 'author', 'literature', 'publishing', 'kindle'],
  'Fashion': ['fashion', 'style', 'clothing', 'design', 'trends', 'outfit', 'brand'],
  'Sports': ['sports', 'football', 'basketball', 'soccer', 'baseball', 'olympics', 'athletics', 'fitness'],

  // News & Politics
  'World News': ['world news', 'international', 'global', 'breaking news', 'current events', 'reuters', 'ap news'],
  'Politics': ['politics', 'government', 'election', 'policy', 'democracy', 'congress', 'senate', 'president'],
  'Economics': ['economics', 'economy', 'gdp', 'inflation', 'trade', 'market', 'recession', 'fed', 'interest rates'],
  'Social Issues': ['social issues', 'inequality', 'justice', 'rights', 'social justice', 'community', 'society'],
  'Policy': ['policy', 'regulation', 'law', 'government', 'public policy', 'legislation', 'rules'],
  'Elections': ['elections', 'voting', 'campaign', 'candidate', 'ballot', 'democracy', 'politics'],
  'International Relations': ['international', 'foreign policy', 'diplomacy', 'global', 'nato', 'un', 'trade war'],
  'Education': ['education', 'school', 'university', 'learning', 'student', 'teacher', 'academic'],
  'Law': ['law', 'legal', 'court', 'judge', 'lawyer', 'justice', 'lawsuit', 'legislation']
}

// Get search terms for user interests
export function getSearchTermsForInterests(interests: string[]): string[] {
  const searchTerms = new Set<string>()
  
  for (const interest of interests) {
    const terms = INTEREST_TO_SEARCH_TERMS[interest] || []
    terms.forEach(term => searchTerms.add(term))
  }
  
  return Array.from(searchTerms)
}

// Fetch news from HackerNews based on interests
export async function fetchHackerNewsForInterests(interests: string[]): Promise<DynamicArticle[]> {
  try {
    const searchTerms = getSearchTermsForInterests(interests)
    const articles: DynamicArticle[] = []
    
    // Get top stories
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    const topStoryIds = await topStoriesResponse.json()
    
    // Add some randomization to get different stories each time
    const randomStart = Math.floor(Math.random() * 10) // Start from 0-9  
    const storyRange = topStoryIds.slice(randomStart, randomStart + 20) // Reduced from 50 to 20
    
    // Get stories from randomized range
    const storyPromises = storyRange.map(async (id: number) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      return storyResponse.json()
    })
    
    const stories = await Promise.all(storyPromises)
    
    for (const story of stories) {
      if (!story || !story.title) continue
      
      const title = story.title.toLowerCase()
      const text = (story.text || '').toLowerCase()
      
      // Enhanced matching logic for better relevance
      let isRelevant = false
      let matchedTerms: string[] = []
      
      if (searchTerms.length === 0) {
        isRelevant = true // No interests = show all
      } else {
        // Check for exact matches and partial matches
        for (const term of searchTerms) {
          const lowerTerm = term.toLowerCase()
          
          if (title.includes(lowerTerm) || text.includes(lowerTerm)) {
            isRelevant = true
            matchedTerms.push(term)
          } else {
            // Check individual words for partial matches
            const titleWords = title.split(/\s+/)
            const textWords = text.split(/\s+/)
            
            for (const word of [...titleWords, ...textWords]) {
              if (word.toLowerCase().includes(lowerTerm) || lowerTerm.includes(word.toLowerCase())) {
                if (word.length > 2 && lowerTerm.length > 2) { // Avoid matching very short words
                  isRelevant = true
                  matchedTerms.push(term)
                  break
                }
              }
            }
          }
        }
      }
      
      if (isRelevant) {
        console.log(`🌐 HN Match: "${story.title}" - matched: ${matchedTerms.join(', ')}`)
        articles.push({
          id: `hn-${story.id}`,
          title: story.title,
          summary: story.text || '',
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          author: story.by || 'Unknown',
          sourceName: 'HackerNews',
          publishedAt: new Date(story.time * 1000),
          popularityScore: Math.min((story.score || 0) / 500, 1),
          finalScore: Math.min((story.score || 0) / 500, 1),
          tags: extractTagsFromTitle(story.title),
          metadata: {
            score: story.score || 0,
            comments: story.descendants || 0,
            type: story.type
          }
        })
      }
    }
    
    return articles.slice(0, 20) // Return top 20 relevant articles
  } catch (error) {
    console.error('Error fetching HackerNews:', error)
    return []
  }
}

// Fetch news from Twitter/X based on interests (limited to 5 tweets to conserve API quota)
export async function fetchTwitterForInterests(interests: string[]): Promise<DynamicArticle[]> {
  try {
    // Only fetch if Twitter API is configured
    if (!process.env.TWITTER_BEARER_TOKEN) {
      console.log('⚠️ Twitter API not configured - skipping Twitter fetch')
      return []
    }

    console.log('🐦 Fetching Twitter content for interests:', interests)
    
    // Create Twitter client
    const client = createTwitterClient()
    
    // High-value tech accounts prioritized by interests
    const interestAccountMap: Record<string, string[]> = {
      'Artificial Intelligence': ['OpenAI', 'sama', 'ylecun', 'anthropicai', 'googledeepmind'],
      'Machine Learning': ['OpenAI', 'huggingface', 'ylecun', 'googledeepmind'],
      'Programming': ['github', 'paulg', 'naval', 'garrytan'],
      'Startups': ['paulg', 'naval', 'garrytan', 'sama', 'jason'],
      'Blockchain': ['elonmusk', 'balajis', 'naval'],
      'Tech News': ['techcrunch', 'verge', 'arstechnica', 'wired'],
      'Default': ['OpenAI', 'sama', 'techcrunch', 'paulg', 'elonmusk'] // fallback accounts
    }
    
    // Get relevant accounts based on interests
    let targetAccounts: string[] = []
    for (const interest of interests) {
      if (interestAccountMap[interest]) {
        targetAccounts.push(...interestAccountMap[interest])
      }
    }
    
    // If no specific accounts found, use default high-value accounts
    if (targetAccounts.length === 0) {
      targetAccounts = interestAccountMap['Default']
    }
    
    // Remove duplicates and limit to 3 accounts to stay within API limits
    targetAccounts = [...new Set(targetAccounts)].slice(0, 3)
    
    console.log(`🐦 Targeting Twitter accounts: ${targetAccounts.join(', ')}`)
    
    const articles: DynamicArticle[] = []
    let tweetsProcessed = 0
    
    // Fetch tweets from each account (max 2 tweets per account = 6 total, well under 5 limit)
    for (const username of targetAccounts) {
      if (tweetsProcessed >= 5) break // Strict limit of 5 total tweets
      
      try {
        console.log(`🐦 Fetching from @${username}...`)
        
        const { user, tweets } = await client.getUserTweetsByUsername(
          username, 
          2, // Max 2 tweets per account
          true // Exclude replies
        )
        
        if (!user || tweets.length === 0) {
          console.log(`📭 No tweets found for @${username}`)
          continue
        }
        
        // Process each tweet
        for (const tweet of tweets) {
          if (tweetsProcessed >= 5) break // Enforce strict limit
          
          try {
            // Basic quality filter
            const engagement = tweet.public_metrics?.like_count || 0
            const tweetLength = tweet.text?.length || 0
            
            // Skip low-quality tweets
            if (engagement < 5 || tweetLength < 50) {
              continue
            }
            
            // Clean tweet text
            let cleanText = tweet.text
              .replace(/https:\/\/t\.co\/\w+/g, '') // Remove t.co links
              .replace(/@\w+/g, '') // Remove mentions  
              .replace(/\n+/g, ' ') // Clean line breaks
              .trim()
            
            if (cleanText.length < 30) continue // Skip if too short after cleaning
            
            // Calculate popularity score based on engagement
            const totalEngagement = (tweet.public_metrics?.like_count || 0) + 
                                   (tweet.public_metrics?.retweet_count || 0) + 
                                   (tweet.public_metrics?.reply_count || 0)
            
            const popularityScore = Math.min(totalEngagement / 1000, 1) // Normalize to 0-1
            
            const article: DynamicArticle = {
              id: `twitter-${tweet.id}`,
              title: cleanText.length > 100 ? cleanText.substring(0, 97) + '...' : cleanText,
              summary: cleanText,
              url: `https://twitter.com/${user.username}/status/${tweet.id}`,
              author: `@${user.username}`,
              sourceName: 'Twitter',
              publishedAt: new Date(tweet.created_at),
              popularityScore: popularityScore,
              finalScore: popularityScore,
              tags: ['twitter', 'social', 'tech'],
              metadata: {
                tweetId: tweet.id,
                authorId: user.id,
                authorName: user.name,
                authorUsername: user.username,
                likes: tweet.public_metrics?.like_count || 0,
                retweets: tweet.public_metrics?.retweet_count || 0,
                replies: tweet.public_metrics?.reply_count || 0,
                totalEngagement: totalEngagement,
                originalText: tweet.text
              }
            }
            
            articles.push(article)
            tweetsProcessed++
            
            console.log(`✅ Added tweet from @${username}: ${engagement} engagement`)
            
          } catch (tweetError) {
            console.warn(`❌ Error processing tweet ${tweet.id}:`, tweetError)
          }
        }
        
        // Small delay to be respectful to API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (accountError) {
        console.warn(`❌ Error fetching from @${username}:`, accountError)
        continue
      }
    }
    
    console.log(`🐦 Twitter fetch complete: ${articles.length} tweets collected (${tweetsProcessed} total processed)`)
    return articles
    
  } catch (error) {
    console.error('❌ Twitter fetch error:', error)
    return [] // Return empty array on error, don't fail entire news fetch
  }
}

// Fetch news from Reddit based on interests
export async function fetchRedditForInterests(interests: string[]): Promise<DynamicArticle[]> {
  try {
    const searchTerms = getSearchTermsForInterests(interests)
    const articles: DynamicArticle[] = []
    
    // Get relevant subreddits based on interests
    const subreddits = getRelevantSubreddits(interests)
    
    for (const subreddit of subreddits.slice(0, 2)) { // Reduced to 2 subreddits for speed
      try {
        console.log(`🔴 Fetching from r/${subreddit}...`)
        
        // Alternate between hot, new, and rising for variety
        const sortTypes = ['hot', 'new', 'rising']
        const sortType = sortTypes[Math.floor(Math.random() * sortTypes.length)]
        // Use our Next.js API proxy to avoid CORS issues
        const response = await fetch(`/api/proxy/reddit?subreddit=${subreddit}&sort=${sortType}&limit=5`)
        
        // Check for Reddit API rate limiting and other errors
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Reddit API error for r/${subreddit}:`)
          console.error(`   Status: ${response.status} ${response.statusText}`)
          console.error(`   Headers:`, Object.fromEntries(response.headers.entries()))
          
          if (response.status === 429) {
            console.error(`   🚫 RATE LIMITED! Reddit is blocking requests.`)
            console.error(`   Try again later or reduce request frequency.`)
          } else if (response.status === 403) {
            console.error(`   🔒 FORBIDDEN! Subreddit r/${subreddit} might be private or restricted.`)
          } else if (response.status === 404) {
            console.error(`   ❓ NOT FOUND! Subreddit r/${subreddit} doesn't exist.`)
          }
          
          console.error(`   Response:`, errorText.substring(0, 200))
          continue
        }
        
        // Skip rate limit logging for speed in production
        
        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error(`❌ Failed to parse JSON from r/${subreddit}:`, jsonError)
          continue
        }
        
        console.log(`✅ r/${subreddit} returned ${data.data?.children?.length || 0} posts`)
        
        // Check if Reddit returned an error in the JSON
        if (data.error) {
          console.error(`❌ Reddit API error in response for r/${subreddit}:`, data.error)
          continue
        }
        
        if (data.data?.children) {
          for (const post of data.data.children) {
            const postData = post.data
            
            articles.push({
              id: `reddit-${postData.id}`,
              title: postData.title,
              summary: postData.selftext || '',
              url: postData.url,
              author: postData.author,
              sourceName: `Reddit - r/${subreddit}`,
              publishedAt: new Date(postData.created_utc * 1000),
              popularityScore: Math.min(postData.score / 1000, 1),
              finalScore: Math.min(postData.score / 1000, 1),
              tags: extractTagsFromTitle(postData.title),
              metadata: {
                score: postData.score,
                comments: postData.num_comments,
                upvote_ratio: postData.upvote_ratio,
                subreddit: postData.subreddit
              }
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error)
      }
    }
    
    return articles.slice(0, 10) // Return top 10 relevant articles for speed
  } catch (error) {
    console.error('❌ Critical error fetching Reddit:', error)
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network error - check internet connection')
    }
    
    return []
  }
}

// Get relevant subreddits based on interests
function getRelevantSubreddits(interests: string[]): string[] {
  const subredditMap: Record<string, string[]> = {
    // Technology
    'Artificial Intelligence': ['MachineLearning', 'artificial', 'ArtificialIntelligence', 'ChatGPT', 'OpenAI'],
    'Machine Learning': ['MachineLearning', 'datascience', 'artificial', 'deeplearning'],
    'Programming': ['programming', 'coding', 'learnprogramming', 'webdev', 'javascript'],
    'Web Development': ['webdev', 'javascript', 'reactjs', 'Frontend', 'webdesign'],
    'Mobile Development': ['androiddev', 'iOSProgramming', 'reactnative', 'Flutter'],
    'DevOps': ['devops', 'kubernetes', 'docker', 'aws', 'sysadmin'],
    'Cybersecurity': ['cybersecurity', 'netsec', 'privacy', 'hacking'],
    'Blockchain': ['cryptocurrency', 'CryptoCurrency', 'ethereum', 'Bitcoin', 'CryptoMarkets', 'defi', 'NFT', 'web3'],
    'Cloud Computing': ['aws', 'AZURE', 'googlecloud', 'kubernetes', 'docker', 'devops', 'selfhosted', 'cloudcomputing'],
    'Data Science': ['datascience', 'MachineLearning', 'analytics', 'statistics', 'visualization'],
    'Technology': ['technology', 'tech', 'gadgets', 'futurology'],

    // Business & Finance
    'Startups': ['startups', 'entrepreneur', 'business', 'smallbusiness', 'Entrepreneur'],
    'Entrepreneurship': ['entrepreneur', 'business', 'startups', 'smallbusiness', 'marketing'],
    'Finance': ['finance', 'investing', 'personalfinance', 'StockMarket', 'SecurityAnalysis'],
    'Investing': ['investing', 'StockMarket', 'SecurityAnalysis', 'ValueInvesting', 'personalfinance'],
    'Stock Market': ['stocks', 'investing', 'wallstreetbets', 'SecurityAnalysis', 'StockMarket', 'personalfinance', 'ValueInvesting', 'financialindependence'],
    'Marketing': ['marketing', 'digital_marketing', 'socialmedia', 'advertising', 'growth_hacking'],
    'Product Management': ['ProductManagement', 'product', 'userexperience', 'ux', 'startups'],
    'Leadership': ['leadership', 'management', 'entrepreneur', 'business'],
    'E-commerce': ['ecommerce', 'shopify', 'amazon', 'FulfillmentByAmazon', 'online_marketing'],
    'Cryptocurrency': ['cryptocurrency', 'CryptoCurrency', 'Bitcoin', 'ethereum', 'CryptoMarkets'],

    // Science
    'Space': ['space', 'SpaceX', 'nasa', 'astronomy', 'astrophysics', 'Mars'],
    'Physics': ['physics', 'askscience', 'quantum', 'particle_physics'],
    'Biology': ['biology', 'genetics', 'microbiology', 'evolution'],
    'Climate Change': ['climatechange', 'environment', 'renewable_energy', 'sustainability'],
    'Medical Research': ['medicine', 'medical', 'health', 'COVID19'],
    'Chemistry': ['chemistry', 'science', 'materials', 'ChemicalEngineering'],
    'Neuroscience': ['neuroscience', 'psychology', 'cogsci', 'brain'],
    'Psychology': ['psychology', 'mentalhealth', 'cogsci', 'selfhelp'],
    'Environment': ['environment', 'conservation', 'wildlife', 'nature', 'ecology'],
    'Innovation': ['innovation', 'futurology', 'technology', 'science'],

    // Lifestyle
    'Gaming': ['gaming', 'Games', 'pcgaming', 'nintendo', 'PS5', 'xbox'],
    'Health & Fitness': ['fitness', 'health', 'nutrition', 'bodybuilding', 'loseit'],
    'Travel': ['travel', 'solotravel', 'backpacking', 'digitalnomad', 'flights'],
    'Food': ['food', 'cooking', 'recipes', 'MealPrepSunday', 'AskCulinary'],
    'Photography': ['photography', 'photocritique', 'pic', 'itookapicture'],
    'Movies & TV': ['movies', 'television', 'netflix', 'flicks', 'entertainment'],
    'Music': ['music', 'listentothis', 'spotify', 'WeAreTheMusicMakers'],
    'Books': ['books', 'suggestmeabook', 'booksuggestions', 'literature'],
    'Fashion': ['fashion', 'malefashionadvice', 'femalefashionadvice', 'streetwear'],
    'Sports': ['sports', 'nfl', 'nba', 'soccer', 'baseball', 'olympics'],

    // News & Politics
    'World News': ['worldnews', 'news', 'politics', 'geopolitics'],
    'Politics': ['politics', 'PoliticalDiscussion', 'moderatepolitics'],
    'Economics': ['Economics', 'economy', 'finance', 'investing'],
    'Social Issues': ['socialissues', 'changemyview', 'unpopularopinion', 'TrueOffMyChest'],
    'Policy': ['policy', 'Ask_Politics', 'NeutralPolitics', 'PoliticalDiscussion'],
    'Elections': ['politics', 'Ask_Politics', 'PoliticalDiscussion'],
    'International Relations': ['worldnews', 'geopolitics', 'GlobalTalk', 'Ask_Politics'],
    'Education': ['education', 'Teachers', 'AskAcademia', 'college'],
    'Law': ['law', 'legaladvice', 'Ask_Lawyers', 'legal']
  }
  
  // REMOVED hardcoded defaults - only use user's actual interests
  const subreddits = new Set<string>()
  
  // If no interests specified, use a general mix
  if (interests.length === 0) {
    subreddits.add('news')
    subreddits.add('worldnews') 
    subreddits.add('technology')
    return Array.from(subreddits)
  }
  
  for (const interest of interests) {
    const relatedSubreddits = subredditMap[interest] || []
    
    if (relatedSubreddits.length === 0) {
      console.warn(`⚠️ No subreddits found for interest "${interest}" - check subredditMap!`)
    } else {
      relatedSubreddits.forEach(sub => subreddits.add(sub))
      console.log(`📍 Interest "${interest}" mapped to subreddits:`, relatedSubreddits)
    }
  }
  
  console.log(`📋 Final subreddits for interests [${interests.join(', ')}]:`, Array.from(subreddits))
  
  // Debug: Make sure we have valid subreddits
  if (subreddits.size === 0) {
    console.warn('⚠️ No subreddits selected! Adding fallback subreddits for testing.')
    subreddits.add('stocks')
    subreddits.add('investing') 
    subreddits.add('personalfinance')
  }
  
  return Array.from(subreddits)
}

// Extract tags from title based on content (not hardcoded to tech only)
function extractTagsFromTitle(title: string): string[] {
  const allKeywords = [
    // Technology
    'ai', 'ml', 'javascript', 'python', 'react', 'nodejs', 'docker', 'kubernetes',
    'aws', 'google', 'microsoft', 'apple', 'blockchain', 'crypto', 'bitcoin',
    
    // Business & Finance
    'startup', 'business', 'finance', 'investing', 'stock', 'market', 'economy',
    'entrepreneur', 'funding', 'ipo', 'vc', 'venture',
    
    // Science & Space
    'nasa', 'spacex', 'space', 'mars', 'physics', 'quantum', 'research', 'study',
    'climate', 'environment', 'energy', 'medicine', 'health',
    
    // General
    'news', 'breaking', 'update', 'report', 'analysis', 'review',
    
    // Gaming & Entertainment
    'gaming', 'game', 'nintendo', 'xbox', 'playstation', 'steam',
    
    // Travel & Lifestyle
    'travel', 'food', 'cooking', 'fitness', 'health'
  ]
  
  const tags = []
  const lowerTitle = title.toLowerCase()
  
  for (const keyword of allKeywords) {
    if (lowerTitle.includes(keyword)) {
      tags.push(keyword)
    }
  }
  
  return tags
}

// Test Reddit API limits
export async function testRedditAPILimits(): Promise<void> {
  try {
    console.log('🧪 Testing Reddit API via proxy...')
    const response = await fetch('/api/proxy/reddit?subreddit=stocks&sort=hot&limit=1')
    
    console.log('📊 Reddit API Test Results:')
    console.log('   Status:', response.status, response.statusText)
    console.log('   Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ API is working')
      console.log('   Sample data keys:', Object.keys(data))
    } else {
      console.log('   ❌ API failed')
      const errorText = await response.text()
      console.log('   Error:', errorText.substring(0, 200))
    }
  } catch (error) {
    console.error('❌ Reddit API test failed:', error)
  }
}

// Main function to fetch all news based on interests
export async function fetchDynamicNews(interests: string[]): Promise<DynamicArticle[]> {
  console.log('🔄 Fetching dynamic news for interests:', interests)
  console.log('🎯 Search terms for interests:', getSearchTermsForInterests(interests))
  
  // Skip API test in production for speed
  // await testRedditAPILimits()
  
  try {
    // Start with empty arrays for faster initial response
    let hackerNewsArticles: DynamicArticle[] = []
    let redditArticles: DynamicArticle[] = []
    let twitterArticles: DynamicArticle[] = []
    
    // Fetch in parallel with timeout for speed
    const timeout = 8000 // 8 seconds max
    const results = await Promise.allSettled([
      Promise.race([
        fetchHackerNewsForInterests(interests),
        new Promise((_, reject) => setTimeout(() => reject(new Error('HackerNews timeout')), timeout))
      ]),
      Promise.race([
        fetchRedditForInterests(interests),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Reddit timeout')), timeout))
      ]),
      Promise.race([
        fetchTwitterForInterests(interests),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Twitter timeout')), timeout))
      ])
    ])
    
    // Handle results even if one fails
    if (results[0].status === 'fulfilled') {
      hackerNewsArticles = results[0].value
    } else {
      console.warn('HackerNews fetch failed:', results[0].reason)
    }
    
    if (results[1].status === 'fulfilled') {
      redditArticles = results[1].value
    } else {
      console.warn('Reddit fetch failed:', results[1].reason)
    }
    
    if (results[2].status === 'fulfilled') {
      twitterArticles = results[2].value
    } else {
      console.warn('Twitter fetch failed:', results[2].reason)
    }
    
    console.log(`📊 HackerNews: ${hackerNewsArticles.length} articles`)
    console.log(`📊 Reddit: ${redditArticles.length} articles`)
    console.log(`📊 Twitter: ${twitterArticles.length} articles`)
    
    // Log sample titles to see what we're getting
    console.log('🌐 HackerNews sample:', hackerNewsArticles.slice(0, 3).map(a => a.title))
    console.log('🔴 Reddit sample:', redditArticles.slice(0, 3).map(a => a.title))
    console.log('🐦 Twitter sample:', twitterArticles.slice(0, 3).map(a => a.title))
    
    // Simplified logging for speed
    console.log(`🌐 HackerNews: ${hackerNewsArticles.length} articles fetched`)
    console.log(`🔴 Reddit: ${redditArticles.length} articles fetched`)
    console.log(`🐦 Twitter: ${twitterArticles.length} articles fetched`)
    
    const allArticles = [...hackerNewsArticles, ...redditArticles, ...twitterArticles]
    
    // Sort by relevance and recency
    allArticles.sort((a, b) => {
      const scoreA = a.finalScore + (a.relevanceScore || 0)
      const scoreB = b.finalScore + (b.relevanceScore || 0)
      return scoreB - scoreA
    })
    
    console.log(`✅ Total articles before filtering: ${allArticles.length}`)
    
    // Minimal logging for better performance
    console.log(`📊 Total articles collected: ${allArticles.length}`)
    
    // Apply strict interest-based filtering
    if (interests.length > 0) {
      const searchTerms = getSearchTermsForInterests(interests)
      console.log('🎯 Looking for these terms:', searchTerms)
      console.log('🎯 User interests:', interests)
      
      // Debug: Check if searchTerms is empty
      if (searchTerms.length === 0) {
        console.error('❌ No search terms generated! This means your interest is not mapped in INTEREST_TO_SEARCH_TERMS')
        console.log('🔍 Available interests:', Object.keys(INTEREST_TO_SEARCH_TERMS))
        return allArticles.slice(0, 15) // Return some articles for debugging
      }
      
      const filteredArticles = allArticles.filter(article => {
        const articleText = `${article.title} ${article.summary || ''}`.toLowerCase()
        let matchedTerms: string[] = []
        let relevanceScore = 0
        
        // Check each search term
        for (const term of searchTerms) {
          const lowerTerm = term.toLowerCase()
          
          if (articleText.includes(lowerTerm)) {
            matchedTerms.push(term)
            relevanceScore += 1
            
            // Bonus for title matches
            if (article.title.toLowerCase().includes(lowerTerm)) {
              relevanceScore += 0.5
            }
          }
        }
        
        const isRelevant = relevanceScore > 0
        
        if (isRelevant) {
          console.log(`✅ RELEVANT (score: ${relevanceScore}): "${article.title}"`)
        }
        
        // Store relevance score for sorting
        article.relevanceScore = relevanceScore
        
        return isRelevant
      })
      
      // Sort by relevance score (highest first)
      filteredArticles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      
      console.log(`🎯 After interest filtering: ${filteredArticles.length} relevant articles`)
      
      // Only return articles if we have matches for the user's interests
      if (filteredArticles.length === 0) {
        console.log('⚠️ No articles match your interests. Let me show what we found:')
        console.log('🔍 Raw articles that were checked:', allArticles.map(a => `"${a.title}" from ${a.sourceName}`))
        console.log('⚠️ Try different interests or check back later.')
        
        // TEMPORARY: Return some articles for debugging if we have any
        if (allArticles.length > 0) {
          console.log('🔧 TEMP: Returning raw articles for debugging')
          return allArticles.slice(0, 5)
        }
        
        return [] // Return empty array if no articles at all
      }
      
      return filteredArticles.slice(0, 25) // Return top 25 most relevant
    }
    
    return allArticles.slice(0, 30) // Return top 30 articles
    
  } catch (error) {
    console.error('Error fetching dynamic news:', error)
    return []
  }
}

// Calculate relevance score based on interests
export function calculateRelevanceForDynamic(article: DynamicArticle, interests: string[]): DynamicArticle {
  if (!interests || interests.length === 0) {
    return { ...article, relevanceScore: 0.5 }
  }
  
  const searchTerms = getSearchTermsForInterests(interests)
  const articleText = `${article.title} ${article.summary || ''}`.toLowerCase()
  
  let relevanceScore = 0
  let matches = 0
  
  for (const term of searchTerms) {
    if (articleText.includes(term.toLowerCase())) {
      relevanceScore += 1
      matches++
    }
  }
  
  // Normalize score
  const normalizedScore = matches > 0 ? Math.min(relevanceScore / searchTerms.length, 1) : 0.1
  
  return {
    ...article,
    relevanceScore: normalizedScore,
    finalScore: (article.popularityScore + normalizedScore) / 2
  }
}
