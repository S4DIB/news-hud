'use client'

import React, { useState, useEffect } from 'react'

interface PipelineStatus {
  overall: 'healthy' | 'warning' | 'error'
  components: {
    contentExtraction: 'active' | 'inactive' | 'error'
    enrichment: 'active' | 'inactive' | 'error'
    deduplication: 'active' | 'inactive' | 'error'
    ranking: 'active' | 'inactive' | 'error'
    summarization: 'active' | 'inactive' | 'error'
    notifications: 'active' | 'inactive' | 'error'
    safety: 'active' | 'inactive' | 'error'
  }
  lastUpdate: string
  articlesProcessed: number
  errorRate: number
  avgProcessingTime: number
}

interface PipelineConfig {
  enableContentExtraction: boolean
  enableEnrichment: boolean
  enableDeduplication: boolean
  enableRanking: boolean
  enableSummarization: boolean
  enableNotifications: boolean
  enableSafety: boolean
  batchSize: number
  maxProcessingTime: number
  enableParallelProcessing: boolean
  geminiApiKey: string
}

export default function PipelineDashboard() {
  const [activeTab, setActiveTab] = useState('components')
  const [isLoading, setIsLoading] = useState(false)

  const [status, setStatus] = useState<PipelineStatus>({
    overall: 'healthy',
    components: {
      contentExtraction: 'active',
      enrichment: 'active',
      deduplication: 'active',
      ranking: 'active',
      summarization: 'active',
      notifications: 'active',
      safety: 'active'
    },
    lastUpdate: new Date().toISOString(),
    articlesProcessed: 1247,
    errorRate: 0.02,
    avgProcessingTime: 1850
  })

  const [config, setConfig] = useState<PipelineConfig>({
    enableContentExtraction: true,
    enableEnrichment: true,
    enableDeduplication: true,
    enableRanking: true,
    enableSummarization: true,
    enableNotifications: true,
    enableSafety: true,
    batchSize: 10,
    maxProcessingTime: 30000,
    enableParallelProcessing: true,
    geminiApiKey: ''
  })

  useEffect(() => {
    loadPipelineStatus()
    loadPipelineConfig()
    
    const interval = setInterval(() => {
      loadPipelineStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadPipelineStatus = async () => {
    try {
      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        articlesProcessed: prev.articlesProcessed + Math.floor(Math.random() * 10),
        errorRate: Math.random() * 0.05,
        avgProcessingTime: 1500 + Math.random() * 1000
      }))
    } catch (error) {
      console.error('Failed to load pipeline status:', error)
    }
  }

  const loadPipelineConfig = async () => {
    // Mock loading config
  }

  const savePipelineConfig = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Pipeline configuration saved successfully!')
    } catch (error) {
      alert('Failed to save configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const restartPipeline = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await loadPipelineStatus()
      alert('Pipeline restarted successfully!')
    } catch (error) {
      alert('Failed to restart pipeline')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (componentStatus: string) => {
    switch (componentStatus) {
      case 'active': return '✅'
      case 'inactive': return '⚠️'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  const toggleComponent = (componentKey: string) => {
    console.log(`🔧 Toggling component: ${componentKey}`)
    const configKey = `enable${componentKey.charAt(0).toUpperCase() + componentKey.slice(1)}` as keyof PipelineConfig
    setConfig(prev => ({ ...prev, [configKey]: !prev[configKey] }))
    alert(`${componentKey} toggled!`) // Temporary visual feedback
  }

  const hudCardStyle = {
    background: 'rgba(20, 27, 45, 0.3)',
    border: '1px solid var(--hud-primary)',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    transition: 'all 0.3s'
  }

  const hudButtonStyle = {
    padding: '12px 24px',
    background: 'rgba(20, 27, 45, 0.4)',
    border: '1px solid var(--hud-primary)',
    color: 'var(--hud-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderRadius: '4px',
    fontFamily: 'Courier New, monospace',
    fontSize: '14px',
    pointerEvents: 'auto' as const,
    zIndex: 999
  }

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    background: isActive ? 'rgba(20, 27, 45, 0.6)' : 'rgba(20, 27, 45, 0.2)',
    border: '1px solid var(--hud-primary)',
    color: isActive ? 'var(--hud-accent)' : 'var(--hud-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderRadius: '4px 4px 0 0',
    fontFamily: 'Courier New, monospace',
    fontSize: '14px',
    marginRight: '4px',
    pointerEvents: 'auto' as const,
    zIndex: 999
  })

  return (
    <div className="hud-screen">
      <div className="scan-lines"></div>
      <div className="grid-bg"></div>
      
      {/* Header */}
      <div className="header">
        <div className="header-logo">
          <div style={{ fontSize: '32px' }}>⚡</div>
          <div className="header-title">AI PIPELINE DASHBOARD</div>
        </div>
        <div className="header-status">
          <div className="status-dot"></div>
          <span>SYSTEM: {status.overall.toUpperCase()}</span>
          <span style={{ marginLeft: '16px' }}>ARTICLES: {status.articlesProcessed}</span>
        </div>
        <div className="header-actions">
          <button 
            className="hud-button"
            onClick={(e) => {
              e.preventDefault()
              console.log('Restart clicked!')
              restartPipeline()
            }}
            disabled={isLoading}
            style={{ pointerEvents: 'auto', zIndex: 999 }}
          >
            🔄 RESTART
          </button>
          <button 
            className="hud-button"
            onClick={(e) => {
              e.preventDefault()
              console.log('Save config clicked!')
              savePipelineConfig()
            }}
            disabled={isLoading}
            style={{ pointerEvents: 'auto', zIndex: 999 }}
          >
            💾 SAVE CONFIG
          </button>
        </div>
      </div>
      
      <div style={{ padding: '32px 24px', height: 'calc(100vh - 80px)', overflow: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={hudCardStyle}>
              <div style={{ color: 'var(--hud-accent)', fontSize: '14px', marginBottom: '8px' }}>PIPELINE STATUS</div>
              <div style={{ fontSize: '32px', color: 'var(--hud-primary)', fontFamily: 'Courier New, monospace' }}>
                {status.overall.toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0, 212, 255, 0.7)' }}>
                Last updated: {new Date(status.lastUpdate).toLocaleTimeString()}
              </div>
            </div>

            <div style={hudCardStyle}>
              <div style={{ color: 'var(--hud-accent)', fontSize: '14px', marginBottom: '8px' }}>ARTICLES PROCESSED</div>
              <div style={{ fontSize: '32px', color: 'var(--hud-primary)', fontFamily: 'Courier New, monospace' }}>
                {status.articlesProcessed.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0, 212, 255, 0.7)' }}>
                Total articles processed
              </div>
            </div>

            <div style={hudCardStyle}>
              <div style={{ color: 'var(--hud-accent)', fontSize: '14px', marginBottom: '8px' }}>ERROR RATE</div>
              <div style={{ fontSize: '32px', color: status.errorRate > 0.05 ? '#ff4444' : 'var(--hud-primary)', fontFamily: 'Courier New, monospace' }}>
                {(status.errorRate * 100).toFixed(2)}%
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0, 212, 255, 0.7)' }}>
                Processing error rate
              </div>
            </div>

            <div style={hudCardStyle}>
              <div style={{ color: 'var(--hud-accent)', fontSize: '14px', marginBottom: '8px' }}>AVG PROCESSING TIME</div>
              <div style={{ fontSize: '32px', color: 'var(--hud-primary)', fontFamily: 'Courier New, monospace' }}>
                {Math.round(status.avgProcessingTime)}ms
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0, 212, 255, 0.7)' }}>
                Per article average
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', marginBottom: '24px' }}>
            {[
              { id: 'components', label: 'COMPONENTS' },
              { id: 'configuration', label: 'CONFIGURATION' },
              { id: 'analytics', label: 'ANALYTICS' },
              { id: 'monitoring', label: 'MONITORING' }
            ].map(tab => (
              <button
                key={tab.id}
                style={tabStyle(activeTab === tab.id)}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Tab clicked!', tab.id)
                  setActiveTab(tab.id)
                  alert(`Switched to ${tab.label} tab!`)
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 212, 255, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = activeTab === tab.id ? 'rgba(20, 27, 45, 0.6)' : 'rgba(20, 27, 45, 0.2)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ ...hudCardStyle, minHeight: '400px' }}>
            
            {/* Components Tab */}
            {activeTab === 'components' && (
              <div>
                <h2 style={{ color: 'var(--hud-accent)', fontSize: '24px', marginBottom: '24px', fontFamily: 'Courier New, monospace' }}>
                  PIPELINE COMPONENTS
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {Object.entries(status.components).map(([component, componentStatus]) => (
                    <div key={component} style={{ 
                      ...hudCardStyle, 
                      marginBottom: '16px',
                      background: 'rgba(20, 27, 45, 0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ color: 'var(--hud-primary)', fontSize: '16px', fontFamily: 'Courier New, monospace' }}>
                          {component.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).toUpperCase()}
                        </h3>
                        <span style={{ fontSize: '20px' }}>{getStatusIcon(componentStatus)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px',
                          background: componentStatus === 'active' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 0, 0.2)',
                          border: `1px solid ${componentStatus === 'active' ? '#00ff00' : '#ffff00'}`,
                          color: componentStatus === 'active' ? '#00ff00' : '#ffff00',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'Courier New, monospace'
                        }}>
                          {componentStatus.toUpperCase()}
                        </span>
                        <button
                          style={{
                            ...hudButtonStyle,
                            padding: '8px 16px',
                            fontSize: '12px',
                            background: config[`enable${component.charAt(0).toUpperCase() + component.slice(1)}` as keyof PipelineConfig] 
                              ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Button clicked!', component)
                            toggleComponent(component)
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 212, 255, 0.4)'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = config[`enable${component.charAt(0).toUpperCase() + component.slice(1)}` as keyof PipelineConfig] 
                              ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'
                          }}
                        >
                          {config[`enable${component.charAt(0).toUpperCase() + component.slice(1)}` as keyof PipelineConfig] ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(0, 212, 255, 0.7)', marginTop: '8px' }}>
                        Last processed: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configuration Tab */}
            {activeTab === 'configuration' && (
              <div>
                <h2 style={{ color: 'var(--hud-accent)', fontSize: '24px', marginBottom: '24px', fontFamily: 'Courier New, monospace' }}>
                  PIPELINE CONFIGURATION
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  <div>
                    <h3 style={{ color: 'var(--hud-primary)', fontSize: '18px', marginBottom: '16px' }}>PROCESSING SETTINGS</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: 'var(--hud-accent)', fontSize: '14px', marginBottom: '8px' }}>
                        BATCH SIZE
                      </label>
                      <input
                        type="number"
                        value={config.batchSize}
                        onChange={(e) => setConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(20, 27, 45, 0.4)',
                          border: '1px solid var(--hud-primary)',
                          color: 'var(--hud-primary)',
                          borderRadius: '4px',
                          fontFamily: 'Courier New, monospace',
                          pointerEvents: 'auto',
                          zIndex: 999
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: 'var(--hud-accent)', fontSize: '14px', marginBottom: '8px' }}>
                        MAX PROCESSING TIME (ms)
                      </label>
                      <input
                        type="number"
                        value={config.maxProcessingTime}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxProcessingTime: parseInt(e.target.value) }))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(20, 27, 45, 0.4)',
                          border: '1px solid var(--hud-primary)',
                          color: 'var(--hud-primary)',
                          borderRadius: '4px',
                          fontFamily: 'Courier New, monospace',
                          pointerEvents: 'auto',
                          zIndex: 999
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={config.enableParallelProcessing}
                        onChange={(e) => setConfig(prev => ({ ...prev, enableParallelProcessing: e.target.checked }))}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <label style={{ color: 'var(--hud-accent)', fontSize: '14px' }}>
                        ENABLE PARALLEL PROCESSING
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ color: 'var(--hud-primary)', fontSize: '18px', marginBottom: '16px' }}>AI SETTINGS</h3>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: 'var(--hud-accent)', fontSize: '14px', marginBottom: '8px' }}>
                        GEMINI API KEY
                      </label>
                      <input
                        type="password"
                        value={config.geminiApiKey}
                        onChange={(e) => {
                          console.log('Gemini key input changed:', e.target.value)
                          setConfig(prev => ({ ...prev, geminiApiKey: e.target.value }))
                        }}
                        placeholder="Enter your Gemini API key"
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(20, 27, 45, 0.4)',
                          border: '1px solid var(--hud-primary)',
                          color: 'var(--hud-primary)',
                          borderRadius: '4px',
                          fontFamily: 'Courier New, monospace',
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
                          e.currentTarget.style.border = '2px solid var(--hud-accent)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '1px solid var(--hud-primary)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 style={{ color: 'var(--hud-accent)', fontSize: '24px', marginBottom: '24px', fontFamily: 'Courier New, monospace' }}>
                  PERFORMANCE ANALYTICS
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                  <div style={{ ...hudCardStyle, background: 'rgba(0, 255, 0, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: '#00ff00', fontSize: '14px', fontWeight: 'bold' }}>SUCCESS RATE</div>
                        <div style={{ fontSize: '32px', color: '#00ff00', fontFamily: 'Courier New, monospace' }}>97.8%</div>
                      </div>
                      <div style={{ fontSize: '32px' }}>✅</div>
                    </div>
                  </div>
                  
                  <div style={{ ...hudCardStyle, background: 'rgba(0, 212, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: 'var(--hud-primary)', fontSize: '14px', fontWeight: 'bold' }}>AVG THROUGHPUT</div>
                        <div style={{ fontSize: '32px', color: 'var(--hud-primary)', fontFamily: 'Courier New, monospace' }}>45.2/min</div>
                      </div>
                      <div style={{ fontSize: '32px' }}>⚡</div>
                    </div>
                  </div>
                  
                  <div style={{ ...hudCardStyle, background: 'rgba(255, 255, 0, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: '#ffff00', fontSize: '14px', fontWeight: 'bold' }}>AI ENHANCEMENT</div>
                        <div style={{ fontSize: '32px', color: '#ffff00', fontFamily: 'Courier New, monospace' }}>89.5%</div>
                      </div>
                      <div style={{ fontSize: '32px' }}>🤖</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ color: 'var(--hud-primary)', fontSize: '18px', marginBottom: '16px' }}>24-HOUR OVERVIEW</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                      { label: 'Articles Processed', value: '1,247', color: 'var(--hud-primary)' },
                      { label: 'Processing Time', value: `${status.avgProcessingTime.toFixed(0)}ms`, color: 'var(--hud-accent)' },
                      { label: 'Error Rate', value: `${(status.errorRate * 100).toFixed(2)}%`, color: status.errorRate > 0.05 ? '#ff4444' : '#00ff00' },
                      { label: 'AI Enhancements', value: '1,115', color: '#ffff00' }
                    ].map((metric, index) => (
                      <div key={index} style={{ textAlign: 'center', padding: '16px' }}>
                        <div style={{ fontSize: '14px', color: 'rgba(0, 212, 255, 0.7)', marginBottom: '8px' }}>
                          {metric.label}
                        </div>
                        <div style={{ fontSize: '24px', color: metric.color, fontFamily: 'Courier New, monospace' }}>
                          {metric.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div>
                <h2 style={{ color: 'var(--hud-accent)', fontSize: '24px', marginBottom: '24px', fontFamily: 'Courier New, monospace' }}>
                  REAL-TIME MONITORING
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  {[
                    { icon: '💗', label: 'System Health', value: 'EXCELLENT', color: '#00ff00' },
                    { icon: '🖥️', label: 'CPU Usage', value: '23%', color: 'var(--hud-primary)' },
                    { icon: '💾', label: 'Memory Usage', value: '67%', color: 'var(--hud-accent)' },
                    { icon: '🌐', label: 'API Status', value: 'ONLINE', color: '#00ff00' }
                  ].map((metric, index) => (
                    <div key={index} style={{ ...hudCardStyle, textAlign: 'center', background: 'rgba(20, 27, 45, 0.2)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{metric.icon}</div>
                      <div style={{ fontSize: '14px', color: 'rgba(0, 212, 255, 0.7)', marginBottom: '8px' }}>
                        {metric.label}
                      </div>
                      <div style={{ fontSize: '18px', color: metric.color, fontFamily: 'Courier New, monospace' }}>
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 style={{ color: 'var(--hud-primary)', fontSize: '18px', marginBottom: '16px' }}>RECENT EVENTS</h3>
                  <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    {[
                      { time: '2 minutes ago', event: 'Pipeline processing completed', type: 'success' },
                      { time: '15 minutes ago', event: 'New batch of 47 articles processed', type: 'info' },
                      { time: '1 hour ago', event: 'AI enhancement rate improved to 89.5%', type: 'success' },
                      { time: '2 hours ago', event: 'Configuration updated', type: 'info' },
                      { time: '3 hours ago', event: 'Minor processing delay detected', type: 'warning' }
                    ].map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '12px', 
                        marginBottom: '8px',
                        background: 'rgba(20, 27, 45, 0.2)',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 212, 255, 0.3)'
                      }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: item.type === 'success' ? '#00ff00' : 
                                     item.type === 'warning' ? '#ffff00' : 'var(--hud-primary)'
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', color: 'var(--hud-primary)' }}>{item.event}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(0, 212, 255, 0.7)' }}>{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}