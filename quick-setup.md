# Quick Database Setup

## Step 1: Run First Migration

1. Go to your Supabase dashboard → SQL Editor
2. Create a new query
3. Copy the ENTIRE content from `supabase/migrations/001_initial_schema.sql`
4. Paste and run it

## Step 2: Add Sample Data  

1. Create another new query
2. Copy the ENTIRE content from `supabase/migrations/002_seed_data.sql`
3. Paste and run it

## Step 3: Test Again

Go back to: http://localhost:3000/test-db

You should see:
✅ Connection Status: Supabase connection successful!
✅ Database Tables: Found 6+ tables
✅ Sample Articles: Found 8 articles

## Expected Tables:
- users
- feed_sources  
- articles
- user_interests
- bookmarks
- user_preferences
- user_article_interactions

## If It Works:
Your main app at http://localhost:3000 will now show real data from the database instead of just sample content!
