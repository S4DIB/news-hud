-- Insert default feed sources
INSERT INTO public.feed_sources (name, type, url, config) VALUES
  ('HackerNews Top Stories', 'hackernews', 'https://hacker-news.firebaseio.com/v0/topstories.json', 
   '{"story_types": ["top", "new", "best"], "min_score": 10}'),
  ('HackerNews Best Stories', 'hackernews', 'https://hacker-news.firebaseio.com/v0/beststories.json', 
   '{"story_types": ["best"], "min_score": 50}'),
  ('Reddit Technology', 'reddit', 'https://www.reddit.com/r/technology.json', 
   '{"subreddit": "technology", "sort_by": "hot", "time_filter": "day"}'),
  ('Reddit Programming', 'reddit', 'https://www.reddit.com/r/programming.json', 
   '{"subreddit": "programming", "sort_by": "hot", "time_filter": "day"}'),
  ('TLDR AI Newsletter', 'newsletter', 'https://tldr.tech/ai/rss', 
   '{"rss_url": "https://tldr.tech/ai/rss"}'),
  ('RundownAI Newsletter', 'newsletter', 'https://www.therundown.ai/rss', 
   '{"rss_url": "https://www.therundown.ai/rss"}');

-- Insert sample articles (these would normally be populated by the aggregation service)
INSERT INTO public.articles (title, summary, url, author, source_id, source_name, published_at, popularity_score, relevance_score, final_score, tags, metadata) VALUES
  ('AI Breakthrough: New Neural Network Architecture Achieves Human-Level Performance',
   'Researchers at leading tech companies have developed a revolutionary neural network that demonstrates human-level performance across multiple cognitive tasks.',
   'https://example.com/ai-breakthrough-1',
   'Dr. Sarah Chen',
   (SELECT id FROM public.feed_sources WHERE name = 'HackerNews Top Stories' LIMIT 1),
   'HackerNews',
   NOW() - INTERVAL '2 hours',
   0.95, 0.90, 0.92,
   ARRAY['AI', 'Machine Learning', 'Research'],
   '{"score": 847, "comments": 234}'::jsonb),
   
  ('Quantum Computing Startup Raises $100M Series B for Commercial Applications',
   'A quantum computing company has secured significant funding to bring quantum solutions to enterprise customers in finance and logistics.',
   'https://example.com/quantum-funding-1',
   'Mike Rodriguez',
   (SELECT id FROM public.feed_sources WHERE name = 'Reddit Technology' LIMIT 1),
   'Reddit',
   NOW() - INTERVAL '4 hours',
   0.82, 0.75, 0.78,
   ARRAY['Quantum Computing', 'Startup', 'Funding'],
   '{"score": 567, "comments": 89, "upvotes": 1240}'::jsonb),
   
  ('New Programming Language Promises 10x Performance Improvements',
   'A systems programming language designed for high-performance computing shows remarkable benchmarks in early testing.',
   'https://example.com/new-language-1',
   'Alex Kumar',
   (SELECT id FROM public.feed_sources WHERE name = 'Reddit Programming' LIMIT 1),
   'Reddit',
   NOW() - INTERVAL '6 hours',
   0.71, 0.85, 0.76,
   ARRAY['Programming', 'Performance', 'Systems'],
   '{"score": 423, "comments": 156}'::jsonb),
   
  ('Climate Tech Innovation: Solar Efficiency Reaches Record 47%',
   'Scientists have achieved a new world record in solar cell efficiency, bringing us closer to cost-effective renewable energy.',
   'https://example.com/solar-efficiency-1',
   'Dr. Maria Santos',
   (SELECT id FROM public.feed_sources WHERE name = 'TLDR AI Newsletter' LIMIT 1),
   'TLDR AI',
   NOW() - INTERVAL '8 hours',
   0.68, 0.60, 0.64,
   ARRAY['Climate Tech', 'Solar', 'Renewable Energy'],
   '{"score": 345, "comments": 78}'::jsonb),
   
  ('Decentralized Social Media Platform Reaches 10M Users',
   'A blockchain-based social media platform has achieved a significant milestone in user adoption, challenging traditional platforms.',
   'https://example.com/decentralized-social-1',
   'Jordan Park',
   (SELECT id FROM public.feed_sources WHERE name = 'HackerNews Best Stories' LIMIT 1),
   'HackerNews',
   NOW() - INTERVAL '10 hours',
   0.59, 0.70, 0.62,
   ARRAY['Blockchain', 'Social Media', 'Decentralization'],
   '{"score": 289, "comments": 45, "retweets": 567}'::jsonb),
   
  ('OpenAI Releases GPT-5: Multimodal AI with Reasoning Capabilities',
   'The latest iteration of GPT shows unprecedented reasoning abilities and can process text, images, and audio simultaneously.',
   'https://example.com/gpt5-release-1',
   'OpenAI Team',
   (SELECT id FROM public.feed_sources WHERE name = 'RundownAI Newsletter' LIMIT 1),
   'RundownAI',
   NOW() - INTERVAL '1 hour',
   0.98, 0.95, 0.96,
   ARRAY['OpenAI', 'GPT', 'AI', 'Multimodal'],
   '{"score": 1247, "comments": 456, "shares": 89}'::jsonb),
   
  ('Web3 Gaming Platform Sees 500% Growth in Monthly Active Users',
   'A blockchain-based gaming ecosystem has experienced explosive growth as traditional gamers embrace play-to-earn mechanics.',
   'https://example.com/web3-gaming-growth-1',
   'Gaming Weekly',
   (SELECT id FROM public.feed_sources WHERE name = 'Reddit Technology' LIMIT 1),
   'Reddit',
   NOW() - INTERVAL '12 hours',
   0.73, 0.65, 0.69,
   ARRAY['Web3', 'Gaming', 'Blockchain', 'NFT'],
   '{"score": 678, "comments": 234, "upvotes": 2100}'::jsonb),
   
  ('Revolutionary Battery Technology Promises 1000-Mile EV Range',
   'Scientists develop solid-state battery technology that could triple electric vehicle range while reducing charging time to minutes.',
   'https://example.com/battery-tech-1',
   'Tech Research Lab',
   (SELECT id FROM public.feed_sources WHERE name = 'TLDR AI Newsletter' LIMIT 1),
   'TLDR AI',
   NOW() - INTERVAL '5 hours',
   0.84, 0.78, 0.81,
   ARRAY['Battery', 'EV', 'Technology', 'Green Tech'],
   '{"score": 892, "comments": 167}'::jsonb);

-- Create function to automatically create user preferences when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate article ranking scores
CREATE OR REPLACE FUNCTION public.calculate_article_scores()
RETURNS TRIGGER AS $$
DECLARE
  recency_score DECIMAL(5,4);
  pop_score DECIMAL(5,4);
  hours_since_published DECIMAL;
BEGIN
  -- Calculate recency score (exponential decay)
  hours_since_published := EXTRACT(EPOCH FROM (NOW() - NEW.published_at)) / 3600;
  recency_score := EXP(-hours_since_published / 24.0)::DECIMAL(5,4);
  
  -- Calculate popularity score (normalized from metadata)
  pop_score := LEAST(
    ((COALESCE((NEW.metadata->>'score')::INTEGER, 0) / 1000.0) * 0.4 +
     (COALESCE((NEW.metadata->>'comments')::INTEGER, 0) / 100.0) * 0.3 +
     (COALESCE((NEW.metadata->>'shares')::INTEGER, 0) / 50.0) * 0.2 +
     (COALESCE((NEW.metadata->>'likes')::INTEGER, 0) / 500.0) * 0.1)::DECIMAL(5,4),
    1.0
  );
  
  -- Update the scores
  NEW.popularity_score := pop_score;
  NEW.final_score := (recency_score * 0.3 + pop_score * 0.25 + NEW.relevance_score * 0.35 + 0.8 * 0.1)::DECIMAL(5,4);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate scores on article insert/update
CREATE TRIGGER calculate_scores_trigger
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.calculate_article_scores();
