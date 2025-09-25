import { NextRequest, NextResponse } from 'next/server'

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
  userId?: string
}

// In production, this would be stored in a database
let currentConfig: PipelineConfig = {
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
}

export async function GET(request: NextRequest) {
  try {
    // In production, you'd get user ID from auth and load their config
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Load user-specific config from database
    // const config = await loadUserPipelineConfig(userId)
    
    // For now, return current config (masking API key)
    const safeConfig = {
      ...currentConfig,
      geminiApiKey: currentConfig.geminiApiKey ? '••••••••' : ''
    }
    
    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error('Failed to get pipeline config:', error)
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { config, userId }: { config: PipelineConfig, userId: string } = await request.json()
    
    // Validate configuration
    const validationErrors = validateConfig(config)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validationErrors },
        { status: 400 }
      )
    }
    
    // Update current config (don't overwrite API key if masked)
    const updatedConfig = {
      ...config,
      geminiApiKey: config.geminiApiKey === '••••••••' 
        ? currentConfig.geminiApiKey 
        : config.geminiApiKey
    }
    
    currentConfig = updatedConfig
    
    // IMPORTANT: Save Gemini API key to user profile for main app
    if (updatedConfig.geminiApiKey && updatedConfig.geminiApiKey !== '••••••••') {
      try {
        console.log('💾 Saving Gemini API key to user profile...')
        
        // Import Firebase functions
        const { doc, updateDoc, setDoc, getDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase/config')
        
        // Get or create user profile
        const actualUserId = userId || 'anonymous-user'
        console.log('💾 Saving to user ID:', actualUserId)
        const userRef = doc(db, 'users', actualUserId)
        const userSnap = await getDoc(userRef)
        
        let userProfile = userSnap.exists() ? userSnap.data() : {}
        
        // Update preferences with Gemini API key
        const updatedProfile = {
          ...userProfile,
          preferences: {
            ...userProfile.preferences,
            ai_api_keys: {
              ...userProfile.preferences?.ai_api_keys,
              gemini: updatedConfig.geminiApiKey
            }
          },
          updatedAt: new Date()
        }
        
        await setDoc(userRef, updatedProfile, { merge: true })
        console.log('✅ Gemini API key saved to user profile successfully')
        console.log('📋 Profile structure saved:', {
          userId: actualUserId,
          hasPreferences: !!updatedProfile.preferences,
          hasAiKeys: !!updatedProfile.preferences?.ai_api_keys,
          hasGeminiKey: !!updatedProfile.preferences?.ai_api_keys?.gemini
        })
        
      } catch (profileError) {
        console.error('❌ Failed to save Gemini key to profile:', profileError)
        // Continue anyway - pipeline config is still saved
      }
    }
    
    console.log('📝 Pipeline configuration updated:', {
      enabledComponents: Object.entries(config)
        .filter(([key, value]) => key.startsWith('enable') && value)
        .map(([key]) => key.replace('enable', '')),
      batchSize: config.batchSize,
      parallelProcessing: config.enableParallelProcessing,
      geminiApiKey: updatedConfig.geminiApiKey ? 'PROVIDED' : 'NOT_PROVIDED'
    })
    
    // Trigger configuration reload in pipeline
    await notifyPipelineConfigChange(updatedConfig)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configuration and Gemini API key saved successfully to user profile',
      config: {
        ...updatedConfig,
        geminiApiKey: updatedConfig.geminiApiKey ? '••••••••' : ''
      }
    })
  } catch (error) {
    console.error('Failed to save pipeline config:', error)
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { component, enabled } = await request.json()
    
    if (!component || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. Provide component and enabled status' },
        { status: 400 }
      )
    }
    
    const configKey = `enable${component.charAt(0).toUpperCase() + component.slice(1)}`
    
    if (!(configKey in currentConfig)) {
      return NextResponse.json(
        { error: 'Unknown component' },
        { status: 400 }
      )
    }
    
    // Update specific component
    currentConfig = {
      ...currentConfig,
      [configKey]: enabled
    }
    
    console.log(`🔧 Component ${component} ${enabled ? 'enabled' : 'disabled'}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `${component} ${enabled ? 'enabled' : 'disabled'}`,
      component,
      enabled
    })
  } catch (error) {
    console.error('Failed to update component:', error)
    return NextResponse.json(
      { error: 'Failed to update component' },
      { status: 500 }
    )
  }
}

function validateConfig(config: PipelineConfig): string[] {
  const errors: string[] = []
  
  // Validate batch size
  if (config.batchSize < 1 || config.batchSize > 100) {
    errors.push('Batch size must be between 1 and 100')
  }
  
  // Validate processing time
  if (config.maxProcessingTime < 5000 || config.maxProcessingTime > 300000) {
    errors.push('Max processing time must be between 5 seconds and 5 minutes')
  }
  
  // Validate at least one component is enabled
  const componentsEnabled = [
    config.enableContentExtraction,
    config.enableEnrichment,
    config.enableDeduplication,
    config.enableRanking,
    config.enableSummarization,
    config.enableNotifications,
    config.enableSafety
  ].some(Boolean)
  
  if (!componentsEnabled) {
    errors.push('At least one pipeline component must be enabled')
  }
  
  // Validate Gemini API key format (if provided and not masked)
  if (config.geminiApiKey && 
      config.geminiApiKey !== '••••••••' && 
      !config.geminiApiKey.startsWith('AI')) {
    errors.push('Invalid Gemini API key format')
  }
  
  return errors
}

async function notifyPipelineConfigChange(config: PipelineConfig) {
  try {
    // In production, this would notify running pipeline instances
    // Could use Redis pub/sub, webhooks, or direct service calls
    
    console.log('🔄 Notifying pipeline of configuration change')
    
    // Simulate notification delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true
  } catch (error) {
    console.error('Failed to notify pipeline of config change:', error)
    return false
  }
}

// Additional endpoint for getting component-specific configurations
export async function PATCH(request: NextRequest) {
  try {
    const { component } = await request.json()
    
    if (!component) {
      return NextResponse.json(
        { error: 'Component name required' },
        { status: 400 }
      )
    }
    
    // Get component-specific configuration details
    const componentConfigs = {
      contentExtraction: {
        maxContentLength: 5000,
        minContentLength: 100,
        extractFullContent: false,
        supportedLanguages: ['en', 'es', 'fr', 'de']
      },
      enrichment: {
        maxEntitiesPerArticle: 15,
        minEntityConfidence: 0.6,
        enableAIInsights: true,
        sourceReputationThreshold: 0.5
      },
      deduplication: {
        titleSimilarityThreshold: 0.85,
        contentSimilarityThreshold: 0.75,
        timeWindowHours: 72,
        maxClusterSize: 10
      },
      ranking: {
        enableAIEnhancement: true,
        personalizeResults: true,
        diversityWeight: 0.2,
        recencyWeight: 0.3
      },
      summarization: {
        maxSummaryLength: 200,
        minSummaryLength: 50,
        enableFactCheck: true,
        enableSourceGrounding: true
      },
      notifications: {
        maxNotificationsPerDay: 10,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        enableBreakingNews: true
      },
      safety: {
        strictnessLevel: 'balanced',
        autoModerationThreshold: 0.8,
        enableProfanityFilter: true,
        enableHateSpeechDetection: true
      }
    }
    
    const componentConfig = componentConfigs[component as keyof typeof componentConfigs]
    
    if (!componentConfig) {
      return NextResponse.json(
        { error: 'Unknown component' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      component,
      config: componentConfig,
      enabled: currentConfig[`enable${component.charAt(0).toUpperCase() + component.slice(1)}` as keyof PipelineConfig]
    })
  } catch (error) {
    console.error('Failed to get component config:', error)
    return NextResponse.json(
      { error: 'Failed to get component configuration' },
      { status: 500 }
    )
  }
}
