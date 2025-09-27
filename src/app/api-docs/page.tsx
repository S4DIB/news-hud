'use client'

import { useState } from 'react'

export default function APIDocumentation() {
  const [activeEndpoint, setActiveEndpoint] = useState('news')

  const endpoints = [
    {
      id: 'news',
      name: 'News Feed API',
      method: 'GET',
      path: '/api/news',
      description: 'Fetch personalized news articles with AI ranking'
    },
    {
      id: 'analytics',
      name: 'Analytics API',
      method: 'GET',
      path: '/api/analytics',
      description: 'Get engagement metrics and performance data'
    },
    {
      id: 'config',
      name: 'Configuration API',
      method: 'POST',
      path: '/api/pipeline/config',
      description: 'Configure AI pipeline and API keys'
    },
    {
      id: 'webhook',
      name: 'Webhook API',
      method: 'POST',
      path: '/api/webhooks',
      description: 'Real-time notifications and updates'
    }
  ]

  const renderNewsAPI = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">GET /api/news</h3>
        <p className="text-gray-300 mb-4">Fetch personalized news articles with AI-powered ranking and relevance scoring.</p>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Query Parameters</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <code className="text-blue-400">interests</code>
                <span className="text-gray-400 ml-2">string[]</span>
              </div>
              <span className="text-gray-300 text-sm">Required</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <code className="text-blue-400">limit</code>
                <span className="text-gray-400 ml-2">number</span>
              </div>
              <span className="text-gray-300 text-sm">Optional (default: 50)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <code className="text-blue-400">sources</code>
                <span className="text-gray-400 ml-2">string[]</span>
              </div>
              <span className="text-gray-300 text-sm">Optional</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Example Request</h4>
          <div className="bg-black p-4 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`curl -X GET "https://api.hudnews.com/v1/news" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "interests": ["artificial-intelligence", "machine-learning"],
    "limit": 20,
    "sources": ["hackernews", "reddit"]
  }'`}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Response Schema</h4>
          <div className="bg-black p-4 rounded-lg overflow-x-auto">
            <pre className="text-blue-400 text-sm">
{`{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "string",
        "title": "string",
        "summary": "string",
        "url": "string",
        "sourceName": "string",
        "publishedAt": "2024-01-01T00:00:00Z",
        "aiRelevanceScore": 95,
        "aiRelevanceReasoning": "string",
        "relevanceScore": 0.85,
        "popularityScore": 0.92,
        "tags": ["string"],
        "metadata": {
          "score": 1500,
          "comments": 45,
          "upvote_ratio": 0.95
        }
      }
    ],
    "total": 20,
    "hasMore": false,
    "lastUpdated": "2024-01-01T00:00:00Z"
  },
  "meta": {
    "processingTime": "150ms",
    "aiEnhanced": true,
    "sourcesUsed": ["hackernews", "reddit", "newsapi"]
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalyticsAPI = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">GET /api/analytics</h3>
        <p className="text-gray-300 mb-4">Get comprehensive analytics and performance metrics for your news consumption.</p>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Query Parameters</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <code className="text-blue-400">period</code>
                <span className="text-gray-400 ml-2">string</span>
              </div>
              <span className="text-gray-300 text-sm">Required (day|week|month|year)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <code className="text-blue-400">metrics</code>
                <span className="text-gray-400 ml-2">string[]</span>
              </div>
              <span className="text-gray-300 text-sm">Optional</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Example Request</h4>
          <div className="bg-black p-4 rounded-lg overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`curl -X GET "https://api.hudnews.com/v1/analytics" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "period": "week",
    "metrics": ["engagement", "sources", "topics"]
  }'`}
            </pre>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Response Schema</h4>
          <div className="bg-black p-4 rounded-lg overflow-x-auto">
            <pre className="text-blue-400 text-sm">
{`{
  "success": true,
  "data": {
    "summary": {
      "totalArticles": 1250,
      "totalClicks": 340,
      "avgEngagement": 0.27,
      "topSources": ["hackernews", "reddit", "newsapi"]
    },
    "engagement": {
      "daily": [
        {"date": "2024-01-01", "clicks": 45, "timeSpent": 1200}
      ],
      "trends": {
        "growth": 0.15,
        "direction": "up"
      }
    },
    "sources": [
      {
        "name": "hackernews",
        "articles": 450,
        "clicks": 120,
        "engagement": 0.27
      }
    ],
    "topics": [
      {
        "name": "artificial-intelligence",
        "articles": 180,
        "clicks": 65,
        "engagement": 0.36
      }
    ]
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">HUD News API</h1>
                <div className="text-sm text-gray-400">Enterprise-Grade News Intelligence</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 inline-block"></span>
                API Status: Operational
              </div>
              <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/30">
                Version: v1.2.0
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-black/30 border-r border-gray-800 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">API Endpoints</h2>
            <div className="space-y-2">
              {endpoints.map(endpoint => (
                <button
                  key={endpoint.id}
                  onClick={() => setActiveEndpoint(endpoint.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeEndpoint === endpoint.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{endpoint.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      endpoint.method === 'GET' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {endpoint.method}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">{endpoint.path}</div>
                  <div className="text-xs text-gray-500 mt-1">{endpoint.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Quick Start</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div>1. Get your API key</div>
                <div>2. Make your first request</div>
                <div>3. Integrate with your app</div>
              </div>
              <button className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Get API Key
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-3">Rate Limits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Free Tier</span>
                  <span className="text-yellow-400">1,000 req/day</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Pro Tier</span>
                  <span className="text-green-400">100,000 req/day</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Enterprise</span>
                  <span className="text-blue-400">Unlimited</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">API Documentation</h1>
              <p className="text-xl text-gray-300">
                Build powerful applications with our comprehensive news intelligence API. 
                Designed for scale, security, and performance.
              </p>
            </div>

            {activeEndpoint === 'news' && renderNewsAPI()}
            {activeEndpoint === 'analytics' && renderAnalyticsAPI()}

            <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-xl">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to Build?</h2>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Join thousands of developers building the future of news intelligence
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Get Started Free
                  </button>
                  <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                    View Pricing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
