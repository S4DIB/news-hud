/**
 * Monitoring & Observability System
 * Implements comprehensive monitoring, alerting, and performance tracking
 */

export interface SystemMetrics {
  timestamp: Date
  
  // Performance metrics
  responseTime: number
  throughput: number
  errorRate: number
  
  // Resource metrics
  memoryUsage: number
  cpuUsage: number
  
  // Business metrics
  activeUsers: number
  articlesProcessed: number
  feedbackReceived: number
  
  // Quality metrics
  averageRelevanceScore: number
  userSatisfactionScore: number
  
  // Infrastructure metrics
  apiCallsPerMinute: number
  cacheHitRate: number
  databaseConnections: number
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals'
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  cooldownMinutes: number
  notifications: NotificationChannel[]
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'console'
  config: any
  enabled: boolean
}

export interface Alert {
  id: string
  ruleId: string
  triggeredAt: Date
  resolvedAt?: Date
  severity: AlertRule['severity']
  message: string
  value: number
  threshold: number
  status: 'firing' | 'resolved'
  acknowledgments: Acknowledgment[]
}

export interface Acknowledgment {
  userId: string
  timestamp: Date
  message?: string
}

export interface PerformanceTrace {
  id: string
  operation: string
  startTime: Date
  endTime: Date
  duration: number
  success: boolean
  errorMessage?: string
  metadata: Record<string, any>
  spans: TraceSpan[]
}

export interface TraceSpan {
  name: string
  startTime: Date
  endTime: Date
  duration: number
  success: boolean
  metadata?: Record<string, any>
}

export interface HealthCheck {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  lastChecked: Date
  responseTime: number
  errorMessage?: string
  dependencies: HealthCheck[]
}

export interface MonitoringDashboard {
  id: string
  name: string
  widgets: DashboardWidget[]
  refreshInterval: number
  layout: LayoutConfig
}

export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'alert_list' | 'health_status'
  title: string
  query: string
  config: WidgetConfig
  position: { x: number; y: number; width: number; height: number }
}

export interface WidgetConfig {
  timeRange?: string
  chartType?: 'line' | 'bar' | 'pie' | 'gauge'
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count'
  threshold?: number
  colors?: string[]
}

export interface LayoutConfig {
  columns: number
  rows: number
  gridSize: number
}

/**
 * Monitoring Engine
 */
export class MonitoringEngine {
  private metrics: SystemMetrics[] = []
  private alerts: Alert[] = []
  private alertRules: AlertRule[] = []
  private traces: PerformanceTrace[] = []
  private healthChecks: Map<string, HealthCheck> = new Map()
  private dashboards: MonitoringDashboard[] = []

  constructor() {
    this.initializeDefaultAlertRules()
    this.initializeDefaultDashboards()
  }

  /**
   * Record system metrics
   */
  recordMetrics(metrics: Partial<SystemMetrics>): void {
    const fullMetrics: SystemMetrics = {
      timestamp: new Date(),
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      activeUsers: 0,
      articlesProcessed: 0,
      feedbackReceived: 0,
      averageRelevanceScore: 0,
      userSatisfactionScore: 0,
      apiCallsPerMinute: 0,
      cacheHitRate: 0,
      databaseConnections: 0,
      ...metrics
    }

    this.metrics.push(fullMetrics)

    // Keep only last 1000 metric points
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Check alert rules
    this.checkAlertRules(fullMetrics)

    console.log(`📊 Metrics recorded - Response time: ${fullMetrics.responseTime}ms, Error rate: ${(fullMetrics.errorRate * 100).toFixed(2)}%`)
  }

  /**
   * Start performance trace
   */
  startTrace(operation: string, metadata: Record<string, any> = {}): string {
    const traceId = this.generateId()
    
    const trace: PerformanceTrace = {
      id: traceId,
      operation,
      startTime: new Date(),
      endTime: new Date(), // Will be updated when finished
      duration: 0,
      success: true,
      metadata,
      spans: []
    }

    this.traces.push(trace)
    return traceId
  }

  /**
   * Add span to trace
   */
  addSpan(traceId: string, name: string, duration: number, success: boolean = true, metadata?: Record<string, any>): void {
    const trace = this.traces.find(t => t.id === traceId)
    if (!trace) return

    const span: TraceSpan = {
      name,
      startTime: new Date(Date.now() - duration),
      endTime: new Date(),
      duration,
      success,
      metadata
    }

    trace.spans.push(span)
  }

  /**
   * Finish performance trace
   */
  finishTrace(traceId: string, success: boolean = true, errorMessage?: string): void {
    const trace = this.traces.find(t => t.id === traceId)
    if (!trace) return

    trace.endTime = new Date()
    trace.duration = trace.endTime.getTime() - trace.startTime.getTime()
    trace.success = success
    trace.errorMessage = errorMessage

    // Keep only last 500 traces
    if (this.traces.length > 500) {
      this.traces = this.traces.slice(-500)
    }

    console.log(`🔍 Trace completed: ${trace.operation} (${trace.duration}ms)`)
  }

  /**
   * Record health check
   */
  recordHealthCheck(
    service: string, 
    status: HealthCheck['status'], 
    responseTime: number,
    errorMessage?: string,
    dependencies: HealthCheck[] = []
  ): void {
    const healthCheck: HealthCheck = {
      service,
      status,
      lastChecked: new Date(),
      responseTime,
      errorMessage,
      dependencies
    }

    this.healthChecks.set(service, healthCheck)

    if (status === 'unhealthy') {
      this.triggerAlert(`health_${service}`, `Service ${service} is unhealthy: ${errorMessage}`, 1, 1)
    }

    console.log(`💗 Health check: ${service} is ${status} (${responseTime}ms)`)
  }

  /**
   * Get current system health
   */
  getSystemHealth(): { overall: HealthCheck['status']; services: HealthCheck[] } {
    const services = Array.from(this.healthChecks.values())
    
    let overall: HealthCheck['status'] = 'healthy'
    
    if (services.some(s => s.status === 'unhealthy')) {
      overall = 'unhealthy'
    } else if (services.some(s => s.status === 'degraded')) {
      overall = 'degraded'
    }

    return { overall, services }
  }

  /**
   * Create alert rule
   */
  createAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule)
    console.log(`🚨 Alert rule created: ${rule.name}`)
  }

  /**
   * Check alert rules against current metrics
   */
  private checkAlertRules(metrics: SystemMetrics): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue

      const metricValue = this.getMetricValue(metrics, rule.metric)
      if (metricValue === undefined) continue

      const shouldAlert = this.evaluateCondition(metricValue, rule.condition, rule.threshold)
      
      if (shouldAlert) {
        // Check if we're in cooldown
        const lastAlert = this.alerts
          .filter(a => a.ruleId === rule.id && a.status === 'firing')
          .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())[0]

        if (lastAlert) {
          const timeSinceLastAlert = Date.now() - lastAlert.triggeredAt.getTime()
          if (timeSinceLastAlert < rule.cooldownMinutes * 60 * 1000) {
            continue // Still in cooldown
          }
        }

        this.triggerAlert(rule.id, `${rule.name}: ${rule.metric} is ${metricValue} (threshold: ${rule.threshold})`, metricValue, rule.threshold)
      }
    }
  }

  /**
   * Trigger alert
   */
  private triggerAlert(ruleId: string, message: string, value: number, threshold: number): void {
    const rule = this.alertRules.find(r => r.id === ruleId)
    if (!rule) return

    const alert: Alert = {
      id: this.generateId(),
      ruleId,
      triggeredAt: new Date(),
      severity: rule.severity,
      message,
      value,
      threshold,
      status: 'firing',
      acknowledgments: []
    }

    this.alerts.push(alert)

    // Send notifications
    this.sendAlertNotifications(alert, rule)

    console.log(`🚨 ALERT: ${alert.severity.toUpperCase()} - ${alert.message}`)
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, userId: string, message?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert || alert.status !== 'firing') return false

    alert.acknowledgments.push({
      userId,
      timestamp: new Date(),
      message
    })

    console.log(`✅ Alert acknowledged by ${userId}: ${alert.message}`)
    return true
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert || alert.status !== 'firing') return false

    alert.status = 'resolved'
    alert.resolvedAt = new Date()

    console.log(`✅ Alert resolved: ${alert.message}`)
    return true
  }

  /**
   * Get metrics for time range
   */
  getMetrics(startTime: Date, endTime: Date): SystemMetrics[] {
    return this.metrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    )
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(
    metric: string, 
    aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count',
    startTime: Date,
    endTime: Date
  ): number {
    const metricsInRange = this.getMetrics(startTime, endTime)
    const values = metricsInRange
      .map(m => this.getMetricValue(m, metric))
      .filter(v => v !== undefined) as number[]

    if (values.length === 0) return 0

    switch (aggregation) {
      case 'avg':
        return values.reduce((sum, v) => sum + v, 0) / values.length
      case 'sum':
        return values.reduce((sum, v) => sum + v, 0)
      case 'min':
        return Math.min(...values)
      case 'max':
        return Math.max(...values)
      case 'count':
        return values.length
      default:
        return 0
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => a.status === 'firing')
  }

  /**
   * Get performance traces
   */
  getTraces(startTime?: Date, endTime?: Date): PerformanceTrace[] {
    if (!startTime || !endTime) {
      return this.traces.slice(-100) // Last 100 traces
    }

    return this.traces.filter(t => 
      t.startTime >= startTime && t.startTime <= endTime
    )
  }

  /**
   * Generate monitoring report
   */
  generateReport(startTime: Date, endTime: Date): string {
    const metrics = this.getMetrics(startTime, endTime)
    const traces = this.getTraces(startTime, endTime)
    const alerts = this.alerts.filter(a => 
      a.triggeredAt >= startTime && a.triggeredAt <= endTime
    )

    const avgResponseTime = this.getAggregatedMetrics('responseTime', 'avg', startTime, endTime)
    const totalArticles = this.getAggregatedMetrics('articlesProcessed', 'sum', startTime, endTime)
    const avgErrorRate = this.getAggregatedMetrics('errorRate', 'avg', startTime, endTime)

    const slowTraces = traces.filter(t => t.duration > 1000).length
    const failedTraces = traces.filter(t => !t.success).length

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    const highAlerts = alerts.filter(a => a.severity === 'high').length

    const report = {
      period: {
        start: startTime.toISOString(),
        end: endTime.toISOString()
      },
      summary: {
        averageResponseTime: `${avgResponseTime.toFixed(0)}ms`,
        totalArticlesProcessed: totalArticles,
        averageErrorRate: `${(avgErrorRate * 100).toFixed(2)}%`,
        totalTraces: traces.length,
        slowTraces,
        failedTraces,
        totalAlerts: alerts.length,
        criticalAlerts,
        highAlerts
      },
      health: this.getSystemHealth(),
      topSlowOperations: traces
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(t => ({ operation: t.operation, duration: `${t.duration}ms` })),
      recentAlerts: alerts
        .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
        .slice(0, 10)
        .map(a => ({ 
          severity: a.severity, 
          message: a.message, 
          time: a.triggeredAt.toISOString() 
        }))
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_response_time',
        name: 'High Response Time',
        metric: 'responseTime',
        condition: 'greater_than',
        threshold: 1000, // 1 second
        severity: 'high',
        enabled: true,
        cooldownMinutes: 15,
        notifications: [{ type: 'console', config: {}, enabled: true }]
      },
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        metric: 'errorRate',
        condition: 'greater_than',
        threshold: 0.05, // 5%
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 10,
        notifications: [{ type: 'console', config: {}, enabled: true }]
      },
      {
        id: 'low_throughput',
        name: 'Low Throughput',
        metric: 'throughput',
        condition: 'less_than',
        threshold: 10,
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 30,
        notifications: [{ type: 'console', config: {}, enabled: true }]
      },
      {
        id: 'high_memory_usage',
        name: 'High Memory Usage',
        metric: 'memoryUsage',
        condition: 'greater_than',
        threshold: 0.85, // 85%
        severity: 'high',
        enabled: true,
        cooldownMinutes: 20,
        notifications: [{ type: 'console', config: {}, enabled: true }]
      }
    ]

    this.alertRules.push(...defaultRules)
  }

  /**
   * Initialize default dashboards
   */
  private initializeDefaultDashboards(): void {
    const mainDashboard: MonitoringDashboard = {
      id: 'main_dashboard',
      name: 'Main System Dashboard',
      refreshInterval: 30, // 30 seconds
      layout: {
        columns: 12,
        rows: 8,
        gridSize: 100
      },
      widgets: [
        {
          id: 'response_time_chart',
          type: 'chart',
          title: 'Response Time',
          query: 'responseTime',
          config: {
            timeRange: '1h',
            chartType: 'line',
            aggregation: 'avg'
          },
          position: { x: 0, y: 0, width: 6, height: 2 }
        },
        {
          id: 'error_rate_gauge',
          type: 'chart',
          title: 'Error Rate',
          query: 'errorRate',
          config: {
            timeRange: '1h',
            chartType: 'gauge',
            threshold: 0.05
          },
          position: { x: 6, y: 0, width: 3, height: 2 }
        },
        {
          id: 'active_alerts',
          type: 'alert_list',
          title: 'Active Alerts',
          query: 'active',
          config: {},
          position: { x: 9, y: 0, width: 3, height: 2 }
        },
        {
          id: 'system_health',
          type: 'health_status',
          title: 'System Health',
          query: 'overall',
          config: {},
          position: { x: 0, y: 2, width: 6, height: 2 }
        },
        {
          id: 'throughput_chart',
          type: 'chart',
          title: 'Throughput',
          query: 'throughput',
          config: {
            timeRange: '1h',
            chartType: 'bar',
            aggregation: 'sum'
          },
          position: { x: 6, y: 2, width: 6, height: 2 }
        }
      ]
    }

    this.dashboards.push(mainDashboard)
  }

  /**
   * Helper methods
   */

  private getMetricValue(metrics: SystemMetrics, metricName: string): number | undefined {
    return (metrics as any)[metricName]
  }

  private evaluateCondition(value: number, condition: AlertRule['condition'], threshold: number): boolean {
    switch (condition) {
      case 'greater_than':
        return value > threshold
      case 'less_than':
        return value < threshold
      case 'equals':
        return value === threshold
      case 'not_equals':
        return value !== threshold
      default:
        return false
    }
  }

  private sendAlertNotifications(alert: Alert, rule: AlertRule): void {
    for (const notification of rule.notifications) {
      if (!notification.enabled) continue

      switch (notification.type) {
        case 'console':
          console.log(`🚨 ALERT NOTIFICATION: ${alert.message}`)
          break
        case 'email':
          // Would implement email sending
          console.log(`📧 Email alert: ${alert.message}`)
          break
        case 'slack':
          // Would implement Slack webhook
          console.log(`💬 Slack alert: ${alert.message}`)
          break
        case 'webhook':
          // Would implement webhook call
          console.log(`🔗 Webhook alert: ${alert.message}`)
          break
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Utility methods for external use
   */

  /**
   * Measure function execution time
   */
  async measureExecution<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const traceId = this.startTrace(operation, metadata)
    const startTime = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - startTime
      
      this.addSpan(traceId, 'execution', duration, true)
      this.finishTrace(traceId, true)

      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      this.addSpan(traceId, 'execution', duration, false, { error: error instanceof Error ? error.message : 'Unknown error' })
      this.finishTrace(traceId, false, error instanceof Error ? error.message : 'Unknown error')

      throw error
    }
  }

  /**
   * Track custom metric
   */
  trackCustomMetric(name: string, value: number, tags?: Record<string, string>): void {
    console.log(`📈 Custom metric: ${name} = ${value}`, tags)
  }

  /**
   * Log performance warning
   */
  logPerformanceWarning(operation: string, duration: number, threshold: number): void {
    if (duration > threshold) {
      console.warn(`⚠️ Performance warning: ${operation} took ${duration}ms (threshold: ${threshold}ms)`)
    }
  }

  /**
   * Get dashboard data
   */
  getDashboardData(dashboardId: string): any {
    const dashboard = this.dashboards.find(d => d.id === dashboardId)
    if (!dashboard) return null

    const data: any = {
      dashboard,
      widgetData: {}
    }

    for (const widget of dashboard.widgets) {
      switch (widget.type) {
        case 'metric':
        case 'chart':
          const timeRange = this.parseTimeRange(widget.config.timeRange || '1h')
          data.widgetData[widget.id] = this.getAggregatedMetrics(
            widget.query,
            widget.config.aggregation || 'avg',
            timeRange.start,
            timeRange.end
          )
          break
        case 'alert_list':
          data.widgetData[widget.id] = this.getActiveAlerts()
          break
        case 'health_status':
          data.widgetData[widget.id] = this.getSystemHealth()
          break
      }
    }

    return data
  }

  private parseTimeRange(timeRange: string): { start: Date; end: Date } {
    const end = new Date()
    const start = new Date()

    const match = timeRange.match(/^(\d+)([hmsd])$/)
    if (!match) {
      start.setHours(start.getHours() - 1) // Default 1 hour
      return { start, end }
    }

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's':
        start.setSeconds(start.getSeconds() - value)
        break
      case 'm':
        start.setMinutes(start.getMinutes() - value)
        break
      case 'h':
        start.setHours(start.getHours() - value)
        break
      case 'd':
        start.setDate(start.getDate() - value)
        break
    }

    return { start, end }
  }
}

/**
 * Global monitoring instance
 */
export const monitoring = new MonitoringEngine()

/**
 * Monitoring utilities
 */

export function monitorFunction<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return monitoring.measureExecution(operation, fn, metadata)
}

export function trackMetric(metricName: string, value: number, tags?: Record<string, string>): void {
  monitoring.trackCustomMetric(metricName, value, tags)
}
