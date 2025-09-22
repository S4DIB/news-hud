# Easy Database Setup Instructions

## Step 1: Run the First SQL Script

1. Go to your Supabase dashboard
2. Click "SQL Editor" in the left sidebar  
3. Click "New Query"
4. Copy ALL the code from the file `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see "Success. No rows returned" - this is good!

## Step 2: Add Sample Data

1. Click "New Query" again
2. Copy ALL the code from the file `supabase/migrations/002_seed_data.sql`  
3. Paste it into the SQL editor
4. Click "Run"
5. You should see success messages

## Step 3: Verify Setup

1. Click "Table Editor" in the left sidebar
2. You should see tables like:
   - articles
   - users  
   - feed_sources
   - bookmarks
   - user_preferences

If you see these tables, you're all set! 🎉

## Troubleshooting

If you get errors:
1. Make sure you copied the ENTIRE script
2. Run one script at a time (001 first, then 002)
3. If still issues, delete all tables and try again

## What These Scripts Do

- **001_initial_schema.sql**: Creates all the database tables and security
- **002_seed_data.sql**: Adds sample news articles so you have content to see
