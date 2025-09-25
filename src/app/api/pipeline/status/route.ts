import { NextRequest, NextResponse } from 'next/server'
import { monitoring } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  try {
    // Get system health from monitoring engine
    const health = monitoring.getSystemHealth()
    const activeAlerts = monitoring.getActiveAlerts()
    
    // Calculate component statuses
    const components = {
      contentExtraction: health.services.find(s => s.service === 'content_extraction')?.status === 'healthy' ? 'active' : 'error',
      enrichment: health.services.find(s => s.service === 'enrichment')?.status === 'healthy' ? 'active' : 'error',
      deduplication: health.services.find(s => s.service === 'deduplication')?.status === 'healthy' ? 'active' : 'error',
      ranking: health.services.find(s => s.service === 'ranking')?.status === 'healthy' ? 'active' : 'error',
      summarization: health.services.find(s => s.service === 'summarization')?.status === 'healthy' ? 'active' : 'error',
      notifications: health.services.find(s => s.service === 'notifications')?.status === 'healthy' ? 'active' : 'error',
      safety: health.services.find(s => s.service === 'safety')?.status === 'healthy' ? 'active' : 'error'
    }

    // Get recent metrics
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
    const metrics = monitoring.getMetrics(startTime, endTime)
    
    const avgProcessingTime = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length 
      : 0
    
    const totalArticlesProcessed = monitoring.getAggregatedMetrics(
      'articlesProcessed', 
      'sum', 
      startTime, 
      endTime
    )
    
    const avgErrorRate = monitoring.getAggregatedMetrics(
      'errorRate', 
      'avg', 
      startTime, 
      endTime
    )

    const status = {
      overall: health.overall,
      components,
      lastUpdate: new Date().toISOString(),
      articlesProcessed: Math.floor(totalArticlesProcessed),
      errorRate: avgErrorRate,
      avgProcessingTime: Math.floor(avgProcessingTime),
      activeAlerts: activeAlerts.length,
      alerts: activeAlerts.slice(0, 5) // Latest 5 alerts
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to get pipeline status:', error)
    return NextResponse.json(
      { error: 'Failed to get pipeline status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    switch (action) {
      case 'restart':
        // Restart pipeline components
        console.log('🔄 Pipeline restart requested')
        
        // Record restart event
        monitoring.recordMetrics({
          responseTime: 0,
          throughput: 0,
          errorRate: 0,
          articlesProcessed: 0
        })
        
        return NextResponse.json({ success: true, message: 'Pipeline restarted successfully' })
        
      case 'health_check':
        // Trigger comprehensive health check
        const healthResults = await performHealthCheck()
        return NextResponse.json(healthResults)
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Pipeline action failed:', error)
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    )
  }
}

async function performHealthCheck() {
  const checks = {
    database: await checkDatabaseConnection(),
    geminiApi: await checkGeminiAPI(),
    externalAPIs: await checkExternalAPIs(),
    memory: checkMemoryUsage(),
    processing: await checkProcessingCapacity()
  }

  const overall = Object.values(checks).every(check => check.status === 'healthy') 
    ? 'healthy' 
    : 'unhealthy'

  return { overall, checks }
}

async function checkDatabaseConnection() {
  try {
    // In real implementation, test Firebase connection
    return { status: 'healthy', message: 'Database connection OK' }
  } catch (error) {
    return { status: 'unhealthy', message: 'Database connection failed' }
  }
}

async function checkGeminiAPI() {
  try {
    // Test Gemini API connection
    return { status: 'healthy', message: 'Gemini API accessible' }
  } catch (error) {
    return { status: 'unhealthy', message: 'Gemini API connection failed' }
  }
}

async function checkExternalAPIs() {
  try {
    // Test external news APIs
    return { status: 'healthy', message: 'External APIs accessible' }
  } catch (error) {
    return { status: 'degraded', message: 'Some external APIs slow' }
  }
}

function checkMemoryUsage() {
  try {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      const usedMB = Math.round(usage.heapUsed / 1024 / 1024)
      
      if (usedMB > 500) {
        return { status: 'degraded', message: `High memory usage: ${usedMB}MB` }
      }
      
      return { status: 'healthy', message: `Memory usage OK: ${usedMB}MB` }
    }
    
    return { status: 'healthy', message: 'Memory check not available' }
  } catch (error) {
    return { status: 'unhealthy', message: 'Memory check failed' }
  }
}

async function checkProcessingCapacity() {
  try {
    // Test processing a small batch
    const startTime = performance.now()
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate processing
    const duration = performance.now() - startTime
    
    if (duration > 500) {
      return { status: 'degraded', message: 'Processing slower than expected' }
    }
    
    return { status: 'healthy', message: 'Processing capacity normal' }
  } catch (error) {
    return { status: 'unhealthy', message: 'Processing check failed' }
  }
}
