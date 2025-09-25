import { NextRequest, NextResponse } from 'next/server'
import { monitoring } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'
    const metric = searchParams.get('metric')
    const aggregation = searchParams.get('aggregation') || 'avg'
    
    // Parse time range
    const { startTime, endTime } = parseTimeRange(timeRange)
    
    if (metric) {
      // Get specific metric
      const value = monitoring.getAggregatedMetrics(
        metric,
        aggregation as 'avg' | 'sum' | 'min' | 'max' | 'count',
        startTime,
        endTime
      )
      
      return NextResponse.json({ metric, value, aggregation, timeRange })
    }
    
    // Get all metrics for the time range
    const metrics = monitoring.getMetrics(startTime, endTime)
    
    // Calculate aggregated values
    const aggregatedMetrics = {
      articlesProcessed: monitoring.getAggregatedMetrics('articlesProcessed', 'sum', startTime, endTime),
      avgResponseTime: monitoring.getAggregatedMetrics('responseTime', 'avg', startTime, endTime),
      maxResponseTime: monitoring.getAggregatedMetrics('responseTime', 'max', startTime, endTime),
      avgErrorRate: monitoring.getAggregatedMetrics('errorRate', 'avg', startTime, endTime),
      avgThroughput: monitoring.getAggregatedMetrics('throughput', 'avg', startTime, endTime),
      totalFeedback: monitoring.getAggregatedMetrics('feedbackReceived', 'sum', startTime, endTime),
      avgRelevanceScore: monitoring.getAggregatedMetrics('averageRelevanceScore', 'avg', startTime, endTime),
      avgUserSatisfaction: monitoring.getAggregatedMetrics('userSatisfactionScore', 'avg', startTime, endTime)
    }
    
    // Generate time series data for charts
    const timeSeriesData = generateTimeSeriesData(metrics, timeRange)
    
    return NextResponse.json({
      timeRange,
      aggregated: aggregatedMetrics,
      timeSeries: timeSeriesData,
      dataPoints: metrics.length,
      summary: generateMetricsSummary(aggregatedMetrics)
    })
  } catch (error) {
    console.error('Failed to get pipeline metrics:', error)
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const metricsData = await request.json()
    
    // Validate metrics data
    if (!metricsData || typeof metricsData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      )
    }
    
    // Record the metrics
    monitoring.recordMetrics({
      timestamp: new Date(),
      responseTime: metricsData.responseTime || 0,
      throughput: metricsData.throughput || 0,
      errorRate: metricsData.errorRate || 0,
      memoryUsage: metricsData.memoryUsage || 0,
      cpuUsage: metricsData.cpuUsage || 0,
      activeUsers: metricsData.activeUsers || 0,
      articlesProcessed: metricsData.articlesProcessed || 0,
      feedbackReceived: metricsData.feedbackReceived || 0,
      averageRelevanceScore: metricsData.averageRelevanceScore || 0,
      userSatisfactionScore: metricsData.userSatisfactionScore || 0,
      apiCallsPerMinute: metricsData.apiCallsPerMinute || 0,
      cacheHitRate: metricsData.cacheHitRate || 0,
      databaseConnections: metricsData.databaseConnections || 0
    })
    
    console.log('📊 Custom metrics recorded:', Object.keys(metricsData))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Metrics recorded successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to record metrics:', error)
    return NextResponse.json(
      { error: 'Failed to record metrics' },
      { status: 500 }
    )
  }
}

function parseTimeRange(timeRange: string): { startTime: Date; endTime: Date } {
  const endTime = new Date()
  const startTime = new Date()
  
  const match = timeRange.match(/^(\d+)([hmsdw])$/)
  if (!match) {
    // Default to 24 hours
    startTime.setHours(startTime.getHours() - 24)
    return { startTime, endTime }
  }
  
  const value = parseInt(match[1])
  const unit = match[2]
  
  switch (unit) {
    case 's':
      startTime.setSeconds(startTime.getSeconds() - value)
      break
    case 'm':
      startTime.setMinutes(startTime.getMinutes() - value)
      break
    case 'h':
      startTime.setHours(startTime.getHours() - value)
      break
    case 'd':
      startTime.setDate(startTime.getDate() - value)
      break
    case 'w':
      startTime.setDate(startTime.getDate() - (value * 7))
      break
    default:
      startTime.setHours(startTime.getHours() - 24)
  }
  
  return { startTime, endTime }
}

function generateTimeSeriesData(metrics: any[], timeRange: string) {
  if (metrics.length === 0) return {}
  
  // Determine bucket size based on time range
  const bucketSize = getBucketSize(timeRange)
  const buckets = new Map<string, any[]>()
  
  // Group metrics into time buckets
  for (const metric of metrics) {
    const bucketKey = getBucketKey(metric.timestamp, bucketSize)
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, [])
    }
    buckets.get(bucketKey)!.push(metric)
  }
  
  // Calculate averages for each bucket
  const timeSeries = {
    responseTime: [] as Array<{ timestamp: string; value: number }>,
    throughput: [] as Array<{ timestamp: string; value: number }>,
    errorRate: [] as Array<{ timestamp: string; value: number }>,
    articlesProcessed: [] as Array<{ timestamp: string; value: number }>,
    memoryUsage: [] as Array<{ timestamp: string; value: number }>,
    cpuUsage: [] as Array<{ timestamp: string; value: number }>
  }
  
  const sortedBuckets = Array.from(buckets.keys()).sort()
  
  for (const bucketKey of sortedBuckets) {
    const bucketMetrics = buckets.get(bucketKey)!
    
    if (bucketMetrics.length > 0) {
      const avg = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length
      
      timeSeries.responseTime.push({
        timestamp: bucketKey,
        value: avg(bucketMetrics.map(m => m.responseTime || 0))
      })
      
      timeSeries.throughput.push({
        timestamp: bucketKey,
        value: avg(bucketMetrics.map(m => m.throughput || 0))
      })
      
      timeSeries.errorRate.push({
        timestamp: bucketKey,
        value: avg(bucketMetrics.map(m => m.errorRate || 0))
      })
      
      timeSeries.articlesProcessed.push({
        timestamp: bucketKey,
        value: bucketMetrics.reduce((sum, m) => sum + (m.articlesProcessed || 0), 0)
      })
      
      timeSeries.memoryUsage.push({
        timestamp: bucketKey,
        value: avg(bucketMetrics.map(m => m.memoryUsage || 0))
      })
      
      timeSeries.cpuUsage.push({
        timestamp: bucketKey,
        value: avg(bucketMetrics.map(m => m.cpuUsage || 0))
      })
    }
  }
  
  return timeSeries
}

function getBucketSize(timeRange: string): number {
  // Return bucket size in minutes
  if (timeRange.endsWith('h')) {
    const hours = parseInt(timeRange)
    if (hours <= 6) return 15 // 15 min buckets for <= 6 hours
    if (hours <= 24) return 60 // 1 hour buckets for <= 24 hours
    return 240 // 4 hour buckets for > 24 hours
  }
  
  if (timeRange.endsWith('d')) {
    return 60 * 4 // 4 hour buckets for days
  }
  
  if (timeRange.endsWith('w')) {
    return 60 * 24 // 1 day buckets for weeks
  }
  
  return 60 // Default 1 hour buckets
}

function getBucketKey(timestamp: Date, bucketSizeMinutes: number): string {
  const date = new Date(timestamp)
  const minutes = Math.floor(date.getMinutes() / bucketSizeMinutes) * bucketSizeMinutes
  date.setMinutes(minutes, 0, 0)
  return date.toISOString()
}

function generateMetricsSummary(metrics: any) {
  const summary = {
    performance: 'good',
    trends: [] as string[],
    recommendations: [] as string[]
  }
  
  // Analyze performance
  if (metrics.avgResponseTime > 2000) {
    summary.performance = 'poor'
    summary.recommendations.push('Consider optimizing processing pipeline - response times are high')
  } else if (metrics.avgResponseTime > 1000) {
    summary.performance = 'fair'
    summary.recommendations.push('Response times could be improved')
  }
  
  if (metrics.avgErrorRate > 0.05) {
    summary.performance = 'poor'
    summary.recommendations.push('Error rate is above 5% - investigate issues')
  }
  
  if (metrics.avgThroughput < 10) {
    summary.recommendations.push('Throughput is low - consider increasing batch sizes')
  }
  
  // Analyze trends
  if (metrics.articlesProcessed > 1000) {
    summary.trends.push('High article processing volume')
  }
  
  if (metrics.avgRelevanceScore > 0.8) {
    summary.trends.push('High relevance scores indicate good personalization')
  }
  
  if (metrics.avgUserSatisfaction > 0.8) {
    summary.trends.push('Users are highly satisfied with recommendations')
  }
  
  // Default recommendations
  if (summary.recommendations.length === 0) {
    summary.recommendations.push('System is performing well - maintain current configuration')
  }
  
  return summary
}

// Additional endpoint for real-time metrics
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'export') {
      // Export metrics data
      const timeRange = searchParams.get('timeRange') || '24h'
      const { startTime, endTime } = parseTimeRange(timeRange)
      const metrics = monitoring.getMetrics(startTime, endTime)
      
      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        timeRange,
        dataPoints: metrics.length,
        data: metrics
      })
    }
    
    if (action === 'reset') {
      // Reset metrics (for testing purposes)
      console.log('🔄 Metrics reset requested')
      return NextResponse.json({ 
        success: true, 
        message: 'Metrics reset successfully' 
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Metrics action failed:', error)
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    )
  }
}
