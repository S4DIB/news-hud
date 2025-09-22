# HUD News App - Deployment Guide

This guide walks you through deploying the HUD News App to production using Vercel and Supabase.

## 🎯 Prerequisites

Before deploying, ensure you have:

- [ ] Vercel account (free tier works)
- [ ] Supabase account (free tier works)
- [ ] GitHub repository (for continuous deployment)
- [ ] Domain name (optional, Vercel provides free subdomain)

## 🔧 Pre-Deployment Setup

### 1. Supabase Production Setup

1. **Create Production Project**
   ```bash
   # Go to https://supabase.com/dashboard
   # Click "New Project"
   # Choose organization and region
   # Set database password
   ```

2. **Configure Database**
   ```sql
   -- Apply migrations from supabase/migrations/
   -- Run 001_initial_schema.sql
   -- Run 002_seed_data.sql
   ```

3. **Enable Authentication**
   ```bash
   # In Supabase Dashboard:
   # Authentication > Settings
   # Enable email/password auth
   # Configure site URL: https://your-domain.vercel.app
   # Add redirect URLs for production
   ```

4. **Set up Row Level Security**
   ```sql
   -- RLS policies are included in migration files
   -- Verify they're properly applied
   ```

### 2. Environment Variables

Create these environment variables in your Vercel project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# External API Keys (Optional)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Application Settings
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_random_secret_key
```

## 🚀 Deployment Methods

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From project root
   vercel

   # For production deployment
   vercel --prod
   ```

4. **Configure Environment Variables**
   ```bash
   # Add each environment variable
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   # ... add all required variables
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Build Settings**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Add Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all required variables from the list above

## 🔄 Post-Deployment Configuration

### 1. Supabase Configuration

Update Supabase settings with your production domain:

```bash
# In Supabase Dashboard > Authentication > Settings:
Site URL: https://your-app.vercel.app
Redirect URLs: 
  - https://your-app.vercel.app/auth/callback
  - https://your-app.vercel.app/login
  - https://your-app.vercel.app/signup
```

### 2. Content Aggregation Setup

Set up periodic content aggregation:

1. **Vercel Cron Jobs** (if using Pro plan):
   ```json
   // vercel.json
   {
     "crons": [
       {
         "path": "/api/aggregation/hackernews",
         "schedule": "0 */2 * * *"
       }
     ]
   }
   ```

2. **External Cron Service** (free option):
   - Use GitHub Actions, Uptime Robot, or similar
   - Schedule HTTP POST to your aggregation endpoints

### 3. Monitoring Setup

1. **Health Checks**
   ```bash
   # Test health endpoint
   curl https://your-app.vercel.app/api/health
   ```

2. **Error Monitoring**
   - Enable Vercel Analytics
   - Set up Sentry or similar service
   - Monitor Supabase logs

## 🧪 Testing Production Deployment

### 1. Functionality Tests

- [ ] User registration/login works
- [ ] News feed loads with articles
- [ ] Auto-scroll functionality works
- [ ] Bookmarking articles works
- [ ] Settings panel functions correctly
- [ ] Mobile responsiveness

### 2. Performance Tests

- [ ] Page load time < 3 seconds
- [ ] Core Web Vitals score > 90
- [ ] No console errors
- [ ] Database queries optimized

### 3. Security Tests

- [ ] Environment variables not exposed
- [ ] API routes properly protected
- [ ] RLS policies working correctly
- [ ] HTTPS enabled everywhere

## 🔧 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check TypeScript errors
   npm run type-check
   
   # Check lint issues
   npm run lint
   
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Verify in Vercel dashboard
   # Check variable names match exactly
   # Redeploy after adding variables
   ```

3. **Supabase Connection Issues**
   ```bash
   # Verify URLs and keys
   # Check RLS policies
   # Confirm authentication settings
   ```

4. **API Routes Not Working**
   ```bash
   # Check function logs in Vercel
   # Verify API route file structure
   # Test locally first
   ```

### Database Migration Issues

If you need to update the database schema:

1. **Create New Migration**
   ```sql
   -- supabase/migrations/003_your_changes.sql
   ALTER TABLE articles ADD COLUMN new_field TEXT;
   ```

2. **Apply to Production**
   ```bash
   # In Supabase Dashboard > SQL Editor
   # Run migration file contents
   ```

## 📊 Performance Optimization

### 1. Vercel Optimizations

```json
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### 2. Database Optimizations

```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_articles_score_published 
ON articles(final_score DESC, published_at DESC);

-- Enable RLS performance
SET statement_timeout = '30s';
```

### 3. Caching Strategy

```typescript
// Add to API routes
export const revalidate = 300 // 5 minutes

// Add to components
const { data } = useSWR('/api/articles', fetcher, {
  refreshInterval: 30000 // 30 seconds
})
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Authentication flows working
- [ ] Content aggregation scheduled
- [ ] Health checks responding
- [ ] Error monitoring setup
- [ ] Performance optimized
- [ ] Mobile testing completed
- [ ] Security audit passed

## 📞 Support

If you encounter issues:

1. Check Vercel function logs
2. Review Supabase logs
3. Test API endpoints manually
4. Verify environment variables
5. Check GitHub Issues for known problems

## 🔄 Updates and Maintenance

### Regular Tasks

- Monitor application performance
- Update dependencies monthly
- Review and optimize database queries
- Check for security updates
- Monitor content source APIs for changes

### Scaling Considerations

As your app grows, consider:

- Upgrading Vercel plan for more functions
- Supabase Pro for better performance
- Redis caching layer
- CDN for static assets
- Database read replicas

---

🎉 **Congratulations!** Your HUD News App is now live and ready to aggregate the latest tech news with AI-powered personalization!
