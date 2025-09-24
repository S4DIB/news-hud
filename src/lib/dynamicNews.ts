// Dynamic news fetching based on user interests
// This replaces storing articles in Firebase with real-time API calls

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
  'Cryptocurrency': ['cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'trading', 'defi', 'nft', 'altcoin', 'blockchain'],

  // Science
  'Space': ['space', 'nasa', 'spacex', 'astronomy', 'mars', 'rocket', 'satellite', 'iss', 'moon', 'universe', 'cosmos'],
  'Physics': ['physics', 'quantum', 'relativity', 'particle', 'energy', 'cern', 'nuclear', 'theoretical physics'],
  'Biology': ['biology', 'genetics', 'dna', 'evolution', 'genome', 'crispr', 'biotech', 'medical research'],
  'Climate Change': ['climate change', 'global warming', 'environment', 'renewable energy', 'carbon', 'sustainability', 'green tech'],
  'Medical Research': ['medical', 'healthcare', 'medicine', 'clinical', 'pharma', 'drug', 'treatment', 'vaccine', 'therapy'],

  // Lifestyle
  'Gaming': ['gaming', 'games', 'video games', 'esports', 'steam', 'nintendo', 'xbox', 'playstation', 'pc gaming', 'mobile gaming'],
  'Health & Fitness': ['health', 'fitness', 'exercise', 'nutrition', 'wellness', 'workout', 'diet', 'mental health'],
  'Travel': ['travel', 'tourism', 'vacation', 'adventure', 'destination', 'hotel', 'flight', 'backpacking'],
  'Food': ['food', 'cooking', 'recipe', 'restaurant', 'cuisine', 'chef', 'culinary', 'dining'],

  // News & Politics
  'World News': ['world news', 'international', 'global', 'breaking news', 'current events', 'reuters', 'ap news'],
  'Politics': ['politics', 'government', 'election', 'policy', 'democracy', 'congress', 'senate', 'president'],
  'Economics': ['economics', 'economy', 'gdp', 'inflation', 'trade', 'market', 'recession', 'fed', 'interest rates']
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
    'Cryptocurrency': ['cryptocurrency', 'CryptoCurrency', 'Bitcoin', 'ethereum', 'CryptoMarkets'],

    // Science
    'Space': ['space', 'SpaceX', 'nasa', 'astronomy', 'astrophysics', 'Mars'],
    'Physics': ['physics', 'askscience', 'quantum', 'particle_physics'],
    'Biology': ['biology', 'genetics', 'microbiology', 'evolution'],
    'Climate Change': ['climatechange', 'environment', 'renewable_energy', 'sustainability'],
    'Medical Research': ['medicine', 'medical', 'health', 'COVID19'],

    // Lifestyle
    'Gaming': ['gaming', 'Games', 'pcgaming', 'nintendo', 'PS5', 'xbox'],
    'Health & Fitness': ['fitness', 'health', 'nutrition', 'bodybuilding', 'loseit'],
    'Travel': ['travel', 'solotravel', 'backpacking', 'digitalnomad', 'flights'],
    'Food': ['food', 'cooking', 'recipes', 'MealPrepSunday', 'AskCulinary'],

    // News & Politics
    'World News': ['worldnews', 'news', 'politics', 'geopolitics'],
    'Politics': ['politics', 'PoliticalDiscussion', 'moderatepolitics'],
    'Economics': ['Economics', 'economy', 'finance', 'investing']
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
    const [hackerNewsArticles, redditArticles] = await Promise.all([
      fetchHackerNewsForInterests(interests),
      fetchRedditForInterests(interests)
    ])
    
    console.log(`📊 HackerNews: ${hackerNewsArticles.length} articles`)
    console.log(`📊 Reddit: ${redditArticles.length} articles`)
    
    // Log sample titles to see what we're getting
    console.log('🌐 HackerNews sample:', hackerNewsArticles.slice(0, 3).map(a => a.title))
    console.log('🔴 Reddit sample:', redditArticles.slice(0, 3).map(a => a.title))
    
    // Simplified logging for speed
    console.log(`🌐 HackerNews: ${hackerNewsArticles.length} articles fetched`)
    console.log(`🔴 Reddit: ${redditArticles.length} articles fetched`)
    
    const allArticles = [...hackerNewsArticles, ...redditArticles]
    
    // Sort by relevance and recency
    allArticles.sort((a, b) => {
      const scoreA = a.finalScore + (a.relevanceScore || 0)
      const scoreB = b.finalScore + (b.relevanceScore || 0)
      return scoreB - scoreA
    })
    
    console.log(`✅ Total articles before filtering: ${allArticles.length}`)
    
    // TEMPORARY: Show all articles to see what's available
    console.log('🔧 TEMP: Showing all articles (no filtering) to debug')
    console.log('📰 All article titles:', allArticles.slice(0, 10).map(a => `"${a.title}" from ${a.sourceName}`))
    
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
