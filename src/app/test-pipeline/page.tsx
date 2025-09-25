'use client'

import React, { useState } from 'react'
import { createAINewsPipeline } from '@/lib/aiNewsPipeline'
import { testGeminiApiKey } from '@/lib/gemini'

export default function TestPipeline() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [geminiKey, setGeminiKey] = useState('')

  const runPipelineTest = async () => {
    setIsLoading(true)
    setTestResults(null)

    try {
      console.log('🧪 Starting comprehensive AI pipeline test...')
      
      // Step 1: Test Gemini API key if provided
      let geminiTestResult = null
      if (geminiKey && geminiKey.trim()) {
        console.log('🔑 Testing Gemini API key validity...')
        geminiTestResult = await testGeminiApiKey(geminiKey.trim())
        console.log('Gemini test result:', geminiTestResult)
      } else {
        console.log('⚠️ No Gemini API key provided - running basic pipeline only')
        geminiTestResult = { isValid: false, error: 'No API key provided' }
      }

      // Create sample articles to test
      const sampleArticles = [
        {
          id: 'test-1',
          title: 'OpenAI Releases New AI Model with Enhanced Capabilities',
          summary: 'The latest AI model shows significant improvements in reasoning and code generation.',
          url: 'https://example.com/ai-news-1',
          author: 'Tech Reporter',
          sourceName: 'TechCrunch',
          publishedAt: new Date(),
          popularityScore: 0.8,
          tags: ['AI', 'Technology'],
          metadata: {}
        },
        {
          id: 'test-2', 
          title: 'Stock Market Hits Record High Amid Economic Growth',
          summary: 'Markets continue to surge as economic indicators show positive trends.',
          url: 'https://example.com/market-news-1',
          author: 'Finance Expert',
          sourceName: 'Bloomberg',
          publishedAt: new Date(),
          popularityScore: 0.7,
          tags: ['Finance', 'Markets'],
          metadata: {}
        },
        {
          id: 'test-3',
          title: 'New Study Shows Benefits of Exercise for Mental Health',
          summary: 'Research indicates regular exercise significantly improves mood and cognitive function.',
          url: 'https://example.com/health-news-1', 
          author: 'Health Writer',
          sourceName: 'Medical Journal',
          publishedAt: new Date(),
          popularityScore: 0.6,
          tags: ['Health', 'Science'],
          metadata: {}
        }
      ]

      // Step 2: Create and configure pipeline (only use valid API key)
      const validApiKey = geminiTestResult.isValid ? geminiKey.trim() : undefined
      console.log('🔍 Debug info:')
      console.log('  - geminiTestResult.isValid:', geminiTestResult.isValid)
      console.log('  - geminiKey provided:', !!(geminiKey && geminiKey.trim()))
      console.log('  - validApiKey being used:', !!validApiKey)
      console.log('  - validApiKey value:', validApiKey ? 'PROVIDED' : 'NOT_PROVIDED')
      
      const pipeline = createAINewsPipeline(
        'test-user',
        ['Artificial Intelligence', 'Stock Market', 'Health'],
        validApiKey
      )

      console.log('🚀 Running AI Pipeline with', validApiKey ? 'VALID' : 'NO', 'Gemini API key...')

      // Step 3: Process articles through the full pipeline
      const result = await pipeline.process(sampleArticles)

      console.log('✅ Pipeline test completed!', result)

      // Step 4: Analyze results and provide detailed feedback
      console.log('🔬 Analyzing results:')
      console.log('  - Total rankings:', result.rankings.length)
      console.log('  - Articles with aiRelevanceScore:', result.rankings.map(r => ({
        title: r.article.title.substring(0, 30) + '...',
        hasAiScore: !!r.article.aiRelevanceScore,
        aiScore: r.article.aiRelevanceScore
      })))
      
      const aiEnhancedCount = result.rankings.filter(r => r.article.aiRelevanceScore).length
      const summariesCount = result.summaries.size
      
      console.log('  - aiEnhancedCount:', aiEnhancedCount)
      console.log('  - summariesCount:', summariesCount)

      setTestResults({
        // API Key Testing Results
        apiKeyProvided: !!(geminiKey && geminiKey.trim()),
        apiKeyValid: geminiTestResult.isValid,
        apiKeyError: geminiTestResult.error,
        
        // Pipeline Results
        inputCount: result.inputCount,
        outputCount: result.outputCount,
        processingTime: result.processingTime,
        duplicatesRemoved: result.duplicatesRemoved,
        clustersFormed: result.clusters.length,
        aiEnhanced: aiEnhancedCount,
        summariesGenerated: summariesCount,
        notificationsCreated: result.notifications.length,
        safetyChecks: result.safetyResults.size,
        errorCount: result.errorCount,
        topRankedArticle: result.rankings[0]?.article.title,
        processingBreakdown: result.metrics,
        
        // Test Analysis
        testStatus: geminiTestResult.isValid ? 
          (aiEnhancedCount > 0 ? 'API_WORKING' : 'API_VALID_BUT_NO_ENHANCEMENT') : 
          (geminiKey && geminiKey.trim() ? 'API_INVALID' : 'NO_API_KEY'),
        
        // Recommendations
        recommendations: generateRecommendations(geminiTestResult, aiEnhancedCount, summariesCount)
      })

    } catch (error: any) {
      console.error('❌ Pipeline test failed:', error)
      setTestResults({ 
        error: error.message,
        testStatus: 'TEST_FAILED',
        recommendations: ['Fix the error above and try again', 'Check console for detailed error information']
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecommendations = (geminiTest: any, aiEnhanced: number, summaries: number) => {
    const recs = []
    
    if (!geminiTest.isValid && geminiTest.error === 'No API key provided') {
      recs.push('✅ Pipeline works! Add a Gemini API key to enable AI features like smart summaries and enhanced ranking.')
    } else if (!geminiTest.isValid) {
      recs.push(`❌ API Key Issue: ${geminiTest.error}`)
      recs.push('Get a valid Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)')
    } else if (geminiTest.isValid && aiEnhanced === 0) {
      recs.push('⚠️ API key is valid but no AI enhancements were applied. Check pipeline configuration.')
    } else if (geminiTest.isValid && aiEnhanced > 0) {
      recs.push('🎉 Perfect! Your Gemini API key is working and AI features are enabled.')
      recs.push(`✅ ${aiEnhanced} articles were AI-enhanced and ${summaries} summaries generated.`)
    }
    
    return recs
  }

  return (
    <div className="hud-screen">
      <div className="scan-lines"></div>
      <div className="grid-bg"></div>
      
      {/* Header */}
      <div className="header">
        <div className="header-logo">
          <div style={{ fontSize: '32px' }}>🧪</div>
          <div className="header-title">AI PIPELINE TESTER</div>
        </div>
        <div className="header-status">
          <div className="status-dot"></div>
          <span>READY FOR TESTING</span>
        </div>
      </div>
      
      <div style={{ 
        padding: '32px 24px', 
        height: 'calc(100vh - 80px)', 
        overflow: 'auto',
        color: 'var(--hud-primary)',
        fontFamily: 'Courier New, monospace'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Title Section */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: 'var(--hud-accent)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              AI PIPELINE TESTING CONSOLE
            </h1>
            <p style={{ 
              color: 'var(--hud-primary)', 
              fontSize: '16px',
              opacity: 0.8
            }}>
              Test all AI pipeline components with sample articles
            </p>
          </div>

          {/* Configuration Panel */}
          <div style={{
            background: 'rgba(20, 27, 45, 0.4)',
            border: '1px solid var(--hud-primary)',
            borderRadius: '8px',
            padding: '32px',
            marginBottom: '32px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: 'var(--hud-accent)',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              🔧 PIPELINE TEST CONFIGURATION
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'var(--hud-primary)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                🔑 GEMINI API KEY (OPTIONAL FOR AI FEATURES)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => {
                  console.log('Gemini key input changed:', e.target.value)
                  setGeminiKey(e.target.value)
                }}
                placeholder="Enter your Gemini API key"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'rgba(20, 27, 45, 0.6)',
                  border: '2px solid var(--hud-primary)',
                  borderRadius: '6px',
                  color: 'var(--hud-primary)',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  pointerEvents: 'auto',
                  zIndex: 999,
                  position: 'relative'
                }}
                onClick={(e) => {
                  console.log('Gemini input clicked')
                  e.stopPropagation()
                  e.currentTarget.focus()
                }}
                onFocus={(e) => {
                  console.log('Gemini input focused')
                  e.target.style.borderColor = 'var(--hud-accent)'
                }}
                onBlur={(e) => e.target.style.borderColor = 'var(--hud-primary)'}
              />
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--hud-secondary)',
                marginTop: '12px',
                lineHeight: '1.5'
              }}>
                💡 WITHOUT KEY: Basic pipeline features only<br/>
                🚀 WITH KEY: Full AI enhancements including smart ranking and summaries
              </p>
            </div>

            <button
              onClick={(e) => {
                console.log('Test button clicked!')
                e.preventDefault()
                e.stopPropagation()
                if (!isLoading) {
                  runPipelineTest()
                }
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '20px',
                background: isLoading ? 'rgba(64, 224, 208, 0.3)' : 'var(--hud-accent)',
                border: '2px solid var(--hud-accent)',
                borderRadius: '6px',
                color: isLoading ? 'var(--hud-secondary)' : '#000',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                pointerEvents: 'auto',
                zIndex: 999,
                position: 'relative'
              }}
              onMouseOver={(e) => {
                console.log('Button hover')
                if (!isLoading) {
                  e.currentTarget.style.background = 'rgba(64, 224, 208, 0.8)'
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'var(--hud-accent)'
                }
              }}
            >
              {isLoading ? '🔄 TESTING PIPELINE...' : '🚀 TEST AI PIPELINE'}
            </button>
          </div>

          {/* Results Panel */}
          {testResults && (
            <div style={{
              background: 'rgba(20, 27, 45, 0.4)',
              border: '1px solid var(--hud-primary)',
              borderRadius: '8px',
              padding: '32px',
              marginBottom: '32px'
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: 'var(--hud-accent)',
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                📊 PIPELINE TEST RESULTS
              </h2>
              
              {testResults.error ? (
                <div style={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid #ff4444',
                  borderRadius: '6px',
                  padding: '20px',
                  color: '#ff4444'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>❌ ERROR:</h3>
                  <p style={{ fontSize: '14px' }}>{testResults.error}</p>
                </div>
              ) : (
                <div>
                  {/* API Key Status */}
                  <div style={{
                    background: testResults.apiKeyValid ? 'rgba(0, 255, 0, 0.1)' : testResults.apiKeyProvided ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)',
                    border: testResults.apiKeyValid ? '1px solid #00ff00' : testResults.apiKeyProvided ? '1px solid #ff4444' : '1px solid #ffaa00',
                    borderRadius: '6px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '12px', 
                      color: testResults.apiKeyValid ? '#00ff00' : testResults.apiKeyProvided ? '#ff4444' : '#ffaa00',
                      fontSize: '16px',
                      textTransform: 'uppercase'
                    }}>
                      {testResults.apiKeyValid ? '✅ GEMINI API KEY VALID' : 
                       testResults.apiKeyProvided ? '❌ GEMINI API KEY INVALID' : 
                       '⚠️ NO GEMINI API KEY PROVIDED'}
                    </h3>
                    {testResults.apiKeyError && (
                      <p style={{ 
                        fontSize: '14px', 
                        color: testResults.apiKeyValid ? '#00ff00' : '#ff4444',
                        marginBottom: '12px'
                      }}>
                        Error: {testResults.apiKeyError}
                      </p>
                    )}
                    <p style={{ 
                      fontSize: '14px', 
                      color: testResults.apiKeyValid ? '#00ff00' : testResults.apiKeyProvided ? '#ff4444' : '#ffaa00'
                    }}>
                      Status: {testResults.testStatus?.replace(/_/g, ' ') || 'Unknown'}
                    </p>
                  </div>
                  {/* Key Metrics Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '20px',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      background: 'rgba(64, 224, 208, 0.1)',
                      border: '1px solid var(--hud-accent)',
                      borderRadius: '6px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: 'var(--hud-accent)', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Articles Processed
                      </p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--hud-accent)' }}>
                        {testResults.inputCount} → {testResults.outputCount}
                      </p>
                    </div>
                    
                    <div style={{
                      background: 'rgba(0, 255, 0, 0.1)',
                      border: '1px solid #00ff00',
                      borderRadius: '6px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: '#00ff00', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Processing Time
                      </p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff00' }}>
                        {testResults.processingTime?.toFixed(0)}ms
                      </p>
                    </div>
                    
                    <div style={{
                      background: 'rgba(255, 0, 255, 0.1)',
                      border: '1px solid #ff00ff',
                      borderRadius: '6px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: '#ff00ff', marginBottom: '8px', textTransform: 'uppercase' }}>
                        AI Enhanced
                      </p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff00ff' }}>
                        {testResults.aiEnhanced}
                      </p>
                    </div>
                    
                    <div style={{
                      background: testResults.errorCount > 0 ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)',
                      border: testResults.errorCount > 0 ? '1px solid #ff4444' : '1px solid #00ff00',
                      borderRadius: '6px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <p style={{ 
                        fontSize: '12px', 
                        color: testResults.errorCount > 0 ? '#ff4444' : '#00ff00', 
                        marginBottom: '8px', 
                        textTransform: 'uppercase' 
                      }}>
                        Errors
                      </p>
                      <p style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: testResults.errorCount > 0 ? '#ff4444' : '#00ff00'
                      }}>
                        {testResults.errorCount}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '24px',
                    marginBottom: '24px'
                  }}>
                    <div>
                      <h3 style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '16px', 
                        color: 'var(--hud-accent)',
                        fontSize: '16px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        🧠 AI PROCESSING RESULTS
                      </h3>
                      <div style={{ fontSize: '14px', lineHeight: '2' }}>
                        <div>✅ Duplicates Removed: <span style={{ color: 'var(--hud-accent)' }}>{testResults.duplicatesRemoved}</span></div>
                        <div>✅ Clusters Formed: <span style={{ color: 'var(--hud-accent)' }}>{testResults.clustersFormed}</span></div>
                        <div>✅ Summaries Generated: <span style={{ color: 'var(--hud-accent)' }}>{testResults.summariesGenerated}</span></div>
                        <div>✅ Safety Checks: <span style={{ color: 'var(--hud-accent)' }}>{testResults.safetyChecks}</span></div>
                        <div>✅ Notifications Created: <span style={{ color: 'var(--hud-accent)' }}>{testResults.notificationsCreated}</span></div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '16px', 
                        color: 'var(--hud-accent)',
                        fontSize: '16px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        ⚡ PERFORMANCE BREAKDOWN
                      </h3>
                      <div style={{ fontSize: '14px', lineHeight: '2' }}>
                        <div>📄 Content Extraction: <span style={{ color: 'var(--hud-accent)' }}>{testResults.processingBreakdown?.extractionTime?.toFixed(0)}ms</span></div>
                        <div>🔍 Enrichment: <span style={{ color: 'var(--hud-accent)' }}>{testResults.processingBreakdown?.enrichmentTime?.toFixed(0)}ms</span></div>
                        <div>🔄 Deduplication: <span style={{ color: 'var(--hud-accent)' }}>{testResults.processingBreakdown?.deduplicationTime?.toFixed(0)}ms</span></div>
                        <div>🏆 Ranking: <span style={{ color: 'var(--hud-accent)' }}>{testResults.processingBreakdown?.rankingTime?.toFixed(0)}ms</span></div>
                        <div>📝 Summarization: <span style={{ color: 'var(--hud-accent)' }}>{testResults.processingBreakdown?.summarizationTime?.toFixed(0)}ms</span></div>
                      </div>
                    </div>
                  </div>

                  {testResults.topRankedArticle && (
                    <div style={{
                      background: 'rgba(64, 224, 208, 0.1)',
                      border: '1px solid var(--hud-accent)',
                      borderRadius: '6px',
                      padding: '20px'
                    }}>
                      <h3 style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '12px', 
                        color: 'var(--hud-accent)',
                        fontSize: '16px',
                        textTransform: 'uppercase'
                      }}>
                        🏆 TOP RANKED ARTICLE
                      </h3>
                      <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                        {testResults.topRankedArticle}
                      </p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {testResults.recommendations && testResults.recommendations.length > 0 && (
                    <div style={{
                      background: 'rgba(64, 224, 208, 0.1)',
                      border: '1px solid var(--hud-accent)',
                      borderRadius: '6px',
                      padding: '20px',
                      marginTop: '24px'
                    }}>
                      <h3 style={{ 
                        fontWeight: 'bold', 
                        marginBottom: '16px', 
                        color: 'var(--hud-accent)',
                        fontSize: '16px',
                        textTransform: 'uppercase'
                      }}>
                        💡 RECOMMENDATIONS
                      </h3>
                      <div style={{ fontSize: '14px', lineHeight: '2' }}>
                        {testResults.recommendations.map((rec: string, index: number) => (
                          <div key={index} style={{ marginBottom: '8px' }}>
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Info Panel */}
          <div style={{
            background: 'rgba(20, 27, 45, 0.4)',
            border: '1px solid var(--hud-primary)',
            borderRadius: '8px',
            padding: '32px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: 'var(--hud-accent)',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              📋 WHAT THIS TEST SHOWS
            </h2>
            
            <div style={{ fontSize: '14px', lineHeight: '2' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--hud-accent)' }}>🧹 Content Extraction:</strong> Cleans article text, extracts keywords and entities
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--hud-accent)' }}>🔍 Enrichment:</strong> AI-powered topic classification and source credibility analysis
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--hud-accent)' }}>🔄 Deduplication:</strong> Removes similar articles and groups related stories
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--hud-accent)' }}>🏆 Ranking:</strong> Scores articles based on relevance, quality, and AI analysis
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--hud-accent)' }}>📝 Summarization:</strong> AI-generated summaries with factuality checks
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--hud-accent)' }}>🔔 Notifications:</strong> Breaking news detection and alert generation
              </div>
              <div>
                <strong style={{ color: 'var(--hud-accent)' }}>🛡️ Safety:</strong> Content filtering for inappropriate or low-quality material
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}