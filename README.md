# HUD News App

A personalized, AI-powered news aggregation app with a futuristic HUD-style interface. Built with Next.js, Supabase, and designed for intelligent content curation.

![HUD News Demo](demo-preview.png)

## 🚀 Features

### Core Functionality
- **Auto-scrolling News Feed**: Continuous, speed-adjustable news stream with pause-on-hover
- **AI-Powered Ranking**: Intelligent content scoring based on recency, popularity, and personal relevance
- **Multi-Source Aggregation**: HackerNews, Reddit, newsletters (TLDR AI, RundownAI), and Twitter feeds
- **Personalized Content Mix**: Customizable ratio of interests vs. popular vs. serendipity content
- **Real-time Updates**: Live content refresh with WebSocket-like experience

### User Experience
- **HUD-Style Interface**: Cyberpunk-inspired design with glow effects and scan lines
- **Bookmark Management**: Save, categorize, and resurface important articles
- **Smart Controls**: Intuitive speed controls and content filtering
- **Responsive Design**: Optimized for desktop and mobile viewing

### Technical Features
- **Strong State Management**: Redux-like state handling with React hooks
- **Database Management**: Supabase with Row Level Security and real-time subscriptions
- **AI Pipeline Control**: User-provided API keys for Gemini, OpenAI, and other AI services
- **Performance Optimized**: Efficient content caching and lazy loading

## 🛠 Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS with custom HUD themes
- **Database**: Supabase (PostgreSQL with real-time)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini, OpenAI GPT (user-provided keys)
- **Content Sources**: HackerNews API, Reddit API, RSS feeds, Twitter API
- **Deployment**: Vercel

## 🏗 Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   │   ├── articles/    # Article management
│   │   ├── aggregation/ # Content aggregation
│   │   ├── bookmarks/   # Bookmark operations
│   │   └── auth/        # Authentication
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── hud-news.tsx     # Main HUD component
│   ├── news-feed.tsx    # Auto-scrolling feed
│   ├── news-header.tsx  # Navigation header
│   ├── news-controls.tsx # Playback controls
│   ├── settings-panel.tsx # Configuration
│   └── bookmarks-panel.tsx # Bookmark management
├── lib/                 # Utilities and configurations
│   └── supabase/        # Supabase client setup
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
│   ├── cn.ts           # Class name utility
│   └── ranking.ts      # Content ranking algorithms
└── hooks/               # Custom React hooks
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- API keys for content sources (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hud-news-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `env.example` to `.env.local` and configure:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # External API Keys (Optional)
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   ```

4. **Set up Supabase database**
   ```bash
   # Install Supabase CLI (if not already installed)
   npm install -g supabase

   # Initialize Supabase locally
   supabase init

   # Start local Supabase
   supabase start

   # Apply migrations
   supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📊 Database Schema

### Core Tables

- **users**: User profiles extending Supabase auth
- **feed_sources**: Configured content sources
- **articles**: Aggregated news articles with scores
- **user_interests**: Personal interest keywords and weights
- **bookmarks**: Saved articles with categories
- **user_preferences**: Customization settings
- **user_article_interactions**: Analytics and engagement tracking

### Key Features

- **Row Level Security (RLS)**: User data isolation
- **Automatic Triggers**: Score calculation and user setup
- **Indexes**: Optimized for real-time queries
- **JSONB Fields**: Flexible metadata storage

## 🤖 AI Integration

### Ranking Algorithm

The app uses a sophisticated ranking system that considers:

1. **Recency Score** (30%): Exponential decay based on publish time
2. **Popularity Score** (25%): Normalized engagement metrics
3. **Relevance Score** (35%): AI-powered content matching
4. **Source Credibility** (10%): Pre-defined source weights

### Content Mixing

Default content mix (configurable per user):
- **70%** Interest-based articles
- **20%** Popular/trending content
- **10%** Serendipity (random discovery)

### AI Services

Users can provide their own API keys for:
- **Google Gemini**: Content analysis and summarization
- **OpenAI GPT**: Advanced text processing
- **Anthropic Claude**: Alternative AI processing

## 🎨 Customization

### Themes

- **HUD Green**: Classic cyberpunk with green glow effects
- **Minimal Blue**: Clean interface with blue accents
- **Classic White**: Traditional news reader appearance

### Scroll Speeds

- **Fast**: 30-second cycles
- **Medium**: 60-second cycles (default)
- **Slow**: 120-second cycles

### Content Sources

Easily add new sources by:
1. Implementing aggregation API route
2. Adding source configuration to database
3. Creating normalization functions

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure environment variables** in Vercel dashboard

3. **Set up production Supabase**
   - Create production project
   - Apply migrations
   - Update environment variables

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Configuration

Ensure production environment has:
- Supabase production credentials
- API keys for content sources
- Proper CORS settings
- Rate limiting configurations

## 📈 Performance

### Optimization Strategies

- **Content Caching**: Redis-based article caching
- **Database Indexing**: Optimized queries for real-time performance
- **Lazy Loading**: Progressive content loading
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Route-based bundle splitting

### Monitoring

- **Core Web Vitals**: Optimized for Google's performance metrics
- **Error Tracking**: Comprehensive error logging
- **Analytics**: User engagement tracking
- **Performance Monitoring**: Real-time performance insights

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates

## 📄 API Documentation

### Articles API

- `GET /api/articles` - Fetch personalized article feed
- `POST /api/articles` - Create new article

### Aggregation API

- `POST /api/aggregation/hackernews` - Trigger HackerNews aggregation
- `GET /api/aggregation/hackernews` - Preview HackerNews stories

### Bookmarks API

- `GET /api/bookmarks` - Fetch user bookmarks
- `POST /api/bookmarks` - Create bookmark
- `DELETE /api/bookmarks` - Remove bookmark

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- HackerNews API for reliable tech news
- Supabase for excellent backend infrastructure
- Vercel for seamless deployment
- The open-source community for inspiration and tools

## 🐛 Known Issues

- RSS feed parsing needs enhancement
- Twitter API rate limiting requires handling
- Mobile responsiveness can be improved
- AI analysis pipeline needs optimization

## 🗺 Roadmap

- [ ] Enhanced AI content analysis
- [ ] More content sources (GitHub, ProductHunt, etc.)
- [ ] Social features (sharing, commenting)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Content recommendation engine
- [ ] Multi-language support

---

Built with ❤️ by the HUD News team
