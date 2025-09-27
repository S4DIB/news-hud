'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSigningUp, setIsSigningUp] = useState(false)

  const handleGetStarted = () => {
    if (user) {
      router.push('/')
    } else {
      setIsSigningUp(true)
      router.push('/auth')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="text-white text-2xl font-bold">HUD News</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#api" className="text-gray-300 hover:text-white transition-colors">API</a>
            {user ? (
              <button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              AI-Powered
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> News Intelligence</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform information overload into personalized insights. 
              Built for FAANG engineers, YC founders, and enterprise teams who need to stay ahead.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button className="border border-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-all">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10M+</div>
              <div className="text-gray-400">Articles Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">50ms</div>
              <div className="text-gray-400">Average Response</div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Enterprise-Grade Intelligence
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with the same technology stack used by Fortune 500 companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Ranking</h3>
              <p className="text-gray-400 mb-6">
                Gemini AI analyzes content relevance and personalizes your feed with 95% accuracy
              </p>
              <div className="flex items-center text-sm text-blue-400">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Powered by Google Gemini
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-Time Processing</h3>
              <p className="text-gray-400 mb-6">
                Process 10,000+ articles per minute with sub-100ms latency
              </p>
              <div className="flex items-center text-sm text-purple-400">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Enterprise SLA
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-green-500 transition-all">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Multi-Source Integration</h3>
              <p className="text-gray-400 mb-6">
                HackerNews, Reddit, Twitter, NewsAPI, and 50+ premium sources
              </p>
              <div className="flex items-center text-sm text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Always Updated
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
              <p className="text-gray-400 mb-6">
                Track engagement, optimize content strategy, and measure ROI
              </p>
              <div className="flex items-center text-sm text-yellow-400">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Business Intelligence
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-red-500 transition-all">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Enterprise Security</h3>
              <p className="text-gray-400 mb-6">
                SOC 2 compliant with end-to-end encryption and SSO integration
              </p>
              <div className="flex items-center text-sm text-red-400">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                SOC 2 Certified
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-6">
                <span className="text-white text-xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">API-First Architecture</h3>
              <p className="text-gray-400 mb-6">
                RESTful APIs with GraphQL support and comprehensive documentation
              </p>
              <div className="flex items-center text-sm text-indigo-400">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                Developer Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Scale from startup to enterprise with no hidden fees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Starter</h3>
                <div className="text-4xl font-bold text-white mb-2">$29</div>
                <div className="text-gray-400">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  10,000 articles/month
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  AI-powered ranking
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  5 data sources
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Email support
                </li>
              </ul>
              <button className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-gradient-to-br from-blue-800 to-purple-900 p-8 rounded-xl border border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Professional</h3>
                <div className="text-4xl font-bold text-white mb-2">$99</div>
                <div className="text-gray-300">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  100,000 articles/month
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Advanced AI features
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  All data sources
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Priority support
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Analytics dashboard
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-xl border border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Enterprise</h3>
                <div className="text-4xl font-bold text-white mb-2">Custom</div>
                <div className="text-gray-400">contact us</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Unlimited articles
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Custom AI models
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  White-label solution
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Dedicated support
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  SLA guarantee
                </li>
              </ul>
              <button className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your News Intelligence?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 10,000+ professionals who trust HUD News for their daily intelligence needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Start Your Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="text-white text-xl font-bold">HUD News</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered news intelligence for the modern professional.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 HUD News. All rights reserved. Built for the future of intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
