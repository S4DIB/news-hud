/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'github.com',
      'i.redd.it',
      'external-preview.redd.it',
      'preview.redd.it',
      'abs.twimg.com',
      'pbs.twimg.com',
    ],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    NEXT_PUBLIC_REDDIT_USER_AGENT: process.env.REDDIT_USER_AGENT,
  },
}

module.exports = nextConfig
