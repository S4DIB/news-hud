'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { initializeGemini, generateArticleSummary, analyzeArticleRelevance } from '@/lib/gemini'

export default function AIFeaturesPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [isGeminiInitialized, setIsGeminiInitialized] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    // Check if Gemini API key exists in user preferences
    const savedKey = userProfile?.preferences?.ai_api_keys?.gemini
    if (savedKey) {
      setGeminiApiKey(savedKey)
      const initialized = initializeGemini(savedKey)
      setIsGeminiInitialized(initialized)
    }
  }, [user, userProfile, router])

  const handleSaveApiKey = () => {
    if (!geminiApiKey.trim()) {
      alert('Please enter a valid Gemini API key')
      return
    }

    const initialized = initializeGemini(geminiApiKey)
    setIsGeminiInitialized(initialized)

    if (initialized) {
      // Save to user preferences (you can implement this)
      console.log('✅ Gemini API key saved and initialized')
    }
  }

  const testAIFeatures = async () => {
    if (!isGeminiInitialized) {
      alert('Please initialize Gemini AI first')
      return
    }

    setLoading(true)
    setTestResults({})

    try {
      // Test article summary
      const testArticle = {
        title: "Google Announces New AI Features for Search",
        content: "Google has announced significant improvements to its search engine using artificial intelligence. The new features include better understanding of natural language queries and improved result relevance. This update represents a major step forward in making search more intuitive and helpful for users worldwide."
      }

      console.log('🧪 Testing AI Summary...')
      const summary = await generateArticleSummary(testArticle.title, testArticle.content)
      
      console.log('🧪 Testing AI Relevance Analysis...')
      const relevance = await analyzeArticleRelevance(
        testArticle.title, 
        testArticle.content, 
        ['Artificial Intelligence', 'Technology']
      )

      setTestResults({
        summary,
        relevance,
        originalTitle: testArticle.title,
        originalContent: testArticle.content
      })

    } catch (error) {
      console.error('❌ AI test failed:', error)
      alert('AI test failed. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      minHeight: '100vh',
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(0, 212, 255, 0.3)'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🤖 AI Features
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.7, fontSize: '14px' }}>
              Enhance your news feed with AI-powered features
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'rgba(0, 212, 255, 0.2)',
              border: '1px solid #00d4ff',
              borderRadius: '6px',
              padding: '8px 16px',
              color: '#00d4ff',
              cursor: 'pointer'
            }}
          >
            ← Back to Feed
          </button>
        </div>

        {/* Gemini API Key Setup */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>
            🔑 Gemini API Setup
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Gemini API Key:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '4px',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleSaveApiKey}
                style={{
                  background: isGeminiInitialized 
                    ? 'rgba(0, 255, 100, 0.3)' 
                    : 'rgba(0, 212, 255, 0.3)',
                  border: `1px solid ${isGeminiInitialized ? '#00ff64' : '#00d4ff'}`,
                  borderRadius: '4px',
                  padding: '10px 20px',
                  color: isGeminiInitialized ? '#00ff64' : '#00d4ff',
                  cursor: 'pointer'
                }}
              >
                {isGeminiInitialized ? '✅ Connected' : 'Connect'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Get your free Gemini API key from{' '}
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#00d4ff' }}
            >
              Google AI Studio
            </a>
          </div>
        </div>

        {/* AI Features Status */}
        {isGeminiInitialized && (
          <div style={{
            background: 'rgba(0, 255, 100, 0.1)',
            border: '1px solid rgba(0, 255, 100, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#00ff64' }}>
              ✨ Available AI Features
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>📰 Smart Summaries</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                  AI-generated concise summaries for long articles
                </p>
              </div>
              
              <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>🎯 Smart Relevance</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                  AI-powered relevance scoring for better personalization
                </p>
              </div>
              
              <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>🏷️ Auto Tags</h4>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                  Automatic topic tagging and categorization
                </p>
              </div>
            </div>

            <button
              onClick={testAIFeatures}
              disabled={loading}
              style={{
                background: 'rgba(0, 212, 255, 0.3)',
                border: '1px solid #00d4ff',
                borderRadius: '6px',
                padding: '12px 24px',
                color: '#00d4ff',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '15px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '🧪 Testing AI Features...' : '🧪 Test AI Features'}
            </button>
          </div>
        )}

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#00d4ff' }}>
              🧪 AI Test Results
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#00ff64' }}>Original Article:</h4>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                <strong>Title:</strong> {testResults.originalTitle}<br/>
                <strong>Content:</strong> {testResults.originalContent}
              </div>
            </div>

            {testResults.summary && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '14px', color: '#00ff64' }}>📰 AI Summary:</h4>
                <div style={{ 
                  background: 'rgba(0, 255, 100, 0.1)', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  {testResults.summary}
                </div>
              </div>
            )}

            {testResults.relevance && (
              <div>
                <h4 style={{ fontSize: '14px', color: '#00ff64' }}>🎯 AI Relevance Analysis:</h4>
                <div style={{ 
                  background: 'rgba(0, 212, 255, 0.1)', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '13px'
                }}>
                  <strong>Score:</strong> {testResults.relevance.score}/100<br/>
                  <strong>Reasoning:</strong> {testResults.relevance.reasoning}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
