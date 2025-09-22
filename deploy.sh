#!/bin/bash

# HUD News App Deployment Script

echo "🚀 Starting HUD News App deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Type check
echo "🔍 Running type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Type check failed. Consider fixing before deployment."
fi

# Lint check
echo "🧹 Running linter..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Linting issues found. Consider fixing before deployment."
fi

# Deploy to Vercel
echo "🌍 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Post-deployment checklist:"
    echo "1. Set up production Supabase project"
    echo "2. Configure environment variables in Vercel"
    echo "3. Apply database migrations to production"
    echo "4. Test all functionality in production"
    echo "5. Set up monitoring and analytics"
    echo ""
    echo "🔗 Don't forget to:"
    echo "- Update CORS settings in Supabase"
    echo "- Configure authentication providers"
    echo "- Set up periodic content aggregation"
    echo "- Monitor application performance"
else
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi
