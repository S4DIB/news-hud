'use client'

import { useState } from 'react'

export default function InvestorMetrics() {
  const [activeTab, setActiveTab] = useState('overview')

  const metrics = {
    users: {
      total: 12500,
      growth: 0.23,
      mrr: 45000,
      arr: 540000
    },
    engagement: {
      dailyActive: 8900,
      retention: 0.78,
      avgSession: 12.5,
      articlesProcessed: 2500000
    },
    technical: {
      uptime: 99.9,
      latency: 45,
      aiAccuracy: 94.2,
      apiCalls: 15000000
    },
    business: {
      customers: 450,
      enterprise: 12,
      churn: 0.02,
      ltv: 2400
    }
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
          <div className="text-3xl font-bold text-blue-400 mb-2">{metrics.users.total.toLocaleString()}</div>
          <div className="text-gray-300 mb-1">Total Users</div>
          <div className="text-green-400 text-sm">+{Math.round(metrics.users.growth * 100)}% MoM</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-xl border border-green-500/30">
          <div className="text-3xl font-bold text-green-400 mb-2">${metrics.users.mrr.toLocaleString()}</div>
          <div className="text-gray-300 mb-1">Monthly Revenue</div>
          <div className="text-green-400 text-sm">${metrics.users.arr.toLocaleString()} ARR</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-500/30">
          <div className="text-3xl font-bold text-purple-400 mb-2">{metrics.engagement.dailyActive.toLocaleString()}</div>
          <div className="text-gray-300 mb-1">Daily Active Users</div>
          <div className="text-green-400 text-sm">{Math.round(metrics.engagement.retention * 100)}% Retention</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-6 rounded-xl border border-yellow-500/30">
          <div className="text-3xl font-bold text-yellow-400 mb-2">{metrics.technical.uptime}%</div>
          <div className="text-gray-300 mb-1">Uptime SLA</div>
          <div className="text-green-400 text-sm">{metrics.technical.latency}ms Avg Latency</div>
        </div>
      </div>

      {/* Growth Chart Placeholder */}
      <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Revenue Growth</h3>
        <div className="h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📈</div>
            <div>Interactive growth chart would be here</div>
            <div className="text-sm mt-2">23% MoM growth, 340% YoY</div>
          </div>
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Market Opportunity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Addressable Market</span>
              <span className="text-blue-400 font-semibold">$12.8B</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Serviceable Market</span>
              <span className="text-green-400 font-semibold">$2.1B</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Current Penetration</span>
              <span className="text-yellow-400 font-semibold">0.03%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Competitive Advantage</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">AI-powered relevance scoring</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Sub-100ms response times</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Enterprise-grade security</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Multi-source integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTechnical = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">API Response Time</span>
              <span className="text-green-400">{metrics.technical.latency}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Uptime</span>
              <span className="text-green-400">{metrics.technical.uptime}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">AI Accuracy</span>
              <span className="text-blue-400">{metrics.technical.aiAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">API Calls/Month</span>
              <span className="text-purple-400">{metrics.technical.apiCalls.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Infrastructure</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Data Centers</span>
              <span className="text-blue-400">3 Regions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">CDN Coverage</span>
              <span className="text-green-400">Global</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Auto-scaling</span>
              <span className="text-green-400">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Monitoring</span>
              <span className="text-blue-400">24/7</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Security & Compliance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">SOC 2</span>
              <span className="text-green-400">Certified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">GDPR</span>
              <span className="text-green-400">Compliant</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Encryption</span>
              <span className="text-blue-400">AES-256</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Penetration Tests</span>
              <span className="text-green-400">Quarterly</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Technology Stack</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Next.js', category: 'Frontend' },
            { name: 'Node.js', category: 'Backend' },
            { name: 'Firebase', category: 'Database' },
            { name: 'Gemini AI', category: 'AI/ML' },
            { name: 'Redis', category: 'Caching' },
            { name: 'Docker', category: 'Containerization' },
            { name: 'AWS', category: 'Cloud' },
            { name: 'TypeScript', category: 'Language' }
          ].map(tech => (
            <div key={tech.name} className="bg-gray-700/50 p-3 rounded-lg text-center">
              <div className="text-white font-medium">{tech.name}</div>
              <div className="text-gray-400 text-sm">{tech.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBusiness = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-xl border border-green-500/30">
          <div className="text-3xl font-bold text-green-400 mb-2">{metrics.business.customers}</div>
          <div className="text-gray-300 mb-1">Total Customers</div>
          <div className="text-green-400 text-sm">{metrics.business.enterprise} Enterprise</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
          <div className="text-3xl font-bold text-blue-400 mb-2">${metrics.business.ltv}</div>
          <div className="text-gray-300 mb-1">Customer LTV</div>
          <div className="text-blue-400 text-sm">12 Month Average</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-500/30">
          <div className="text-3xl font-bold text-purple-400 mb-2">{Math.round(metrics.business.churn * 100)}%</div>
          <div className="text-gray-300 mb-1">Monthly Churn</div>
          <div className="text-green-400 text-sm">Industry Leading</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-6 rounded-xl border border-yellow-500/30">
          <div className="text-3xl font-bold text-yellow-400 mb-2">4.2</div>
          <div className="text-gray-300 mb-1">Net Promoter Score</div>
          <div className="text-green-400 text-sm">Customer Satisfaction</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">SaaS Subscriptions</span>
              <span className="text-blue-400 font-semibold">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">API Usage</span>
              <span className="text-green-400 font-semibold">15%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Enterprise Contracts</span>
              <span className="text-purple-400 font-semibold">7%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Customer Segments</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Individual Professionals</span>
              <span className="text-blue-400 font-semibold">65%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Small Teams (2-10)</span>
              <span className="text-green-400 font-semibold">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Enterprise (50+)</span>
              <span className="text-purple-400 font-semibold">10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Funding & Valuation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">$2.4M</div>
            <div className="text-gray-300">Seed Round</div>
            <div className="text-sm text-gray-400">Q2 2024</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">$18M</div>
            <div className="text-gray-300">Series A Target</div>
            <div className="text-sm text-gray-400">Q1 2025</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">$120M</div>
            <div className="text-gray-300">Current Valuation</div>
            <div className="text-sm text-gray-400">50x Revenue</div>
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
                <h1 className="text-xl font-bold text-white">Investor Dashboard</h1>
                <div className="text-sm text-gray-400">Real-time metrics and KPIs</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm border border-green-500/30">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 inline-block animate-pulse"></span>
                Live Data
              </div>
              <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/30">
                Last Updated: Now
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/30 border-b border-gray-800">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'technical', label: 'Technical', icon: '⚙️' },
              { id: 'business', label: 'Business', icon: '💼' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'technical' && renderTechnical()}
          {activeTab === 'business' && renderBusiness()}
        </div>
      </main>
    </div>
  )
}
