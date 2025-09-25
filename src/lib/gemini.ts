import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null

export function initializeGemini(apiKey: string) {
  if (!apiKey) {
    console.warn('No Gemini API key provided')
    return false
  }
  
  try {
    genAI = new GoogleGenerativeAI(apiKey)
    console.log('✅ Gemini AI initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error)
    return false
  }
}

// Test function to validate API key by making a real API call
export async function testGeminiApiKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim() === '') {
    return { isValid: false, error: 'No API key provided' }
  }

  try {
    console.log('🔑 Testing Gemini API key...')
    const testGenAI = new GoogleGenerativeAI(apiKey)
    
    // Try different model names in case of version issues
    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
    let lastError = null
    
    for (const modelName of modelNames) {
      try {
        console.log(`🧪 Testing with model: ${modelName}`)
        const model = testGenAI.getGenerativeModel({ model: modelName })

        // Simple test prompt with proper configuration
        const result = await model.generateContent({
          contents: [{ parts: [{ text: 'Say "Hello" if you can read this.' }] }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 10,
          },
        })
        
        const response = await result.response
        const text = response.text()

        console.log(`✅ Gemini API key test successful with ${modelName}:`, text)
        return { isValid: true }
      } catch (modelError: any) {
        console.log(`❌ Model ${modelName} failed:`, modelError.message)
        lastError = modelError
        continue
      }
    }
    
    // If all models failed, return the last error
    throw lastError
    
  } catch (error: any) {
    console.error('❌ Gemini API key test failed:', error)
    
    let errorMessage = 'Unknown error'
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid API key') || error.message?.includes('API key not valid')) {
      errorMessage = 'Invalid API key - check your key is correct'
    } else if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'API quota exceeded - check your billing'
    } else if (error.message?.includes('permission') || error.message?.includes('PERMISSION_DENIED')) {
      errorMessage = 'Permission denied - enable Generative AI API'
    } else if (error.message?.includes('method') || error.message?.includes('support')) {
      errorMessage = 'API method not supported - try enabling Generative AI API in Google Cloud Console'
    } else if (error.message?.includes('incomplete') || error.message?.includes('request body')) {
      errorMessage = 'API request format issue - check API version compatibility'
    } else {
      errorMessage = error.message || 'API call failed'
    }
    
    return { isValid: false, error: errorMessage }
  }
}

export async function generateArticleSummary(title: string, content: string): Promise<string | null> {
  if (!genAI) {
    console.warn('Gemini AI not initialized')
    return null
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Please create a concise, informative summary of this article. Focus on the key points, main findings, and important implications.

Title: ${title}

Content: ${content.substring(0, 2000)} ${content.length > 2000 ? '...' : ''}

Instructions:
- Write 2-3 sentences maximum
- Focus on the most important information
- Use clear, simple language
- Don't include promotional language
- If the content is unclear or insufficient, return "Unable to generate summary"

Summary:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    if (summary.includes('Unable to generate summary')) {
      return null
    }

    return summary.trim()
  } catch (error) {
    console.error('❌ Error generating summary:', error)
    return null
  }
}

export async function analyzeArticleRelevance(
  articleTitle: string, 
  articleContent: string, 
  userInterests: string[]
): Promise<{ score: number; reasoning: string } | null> {
  if (!genAI) {
    console.warn('Gemini AI not initialized')
    return null
  }

  // Try different model names in case of version issues
  const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
  let lastError = null

  for (const modelName of modelNames) {
    try {
      console.log(`🧠 Analyzing relevance with model: ${modelName}`)
      const model = genAI.getGenerativeModel({ model: modelName })

      const prompt = `
Analyze how relevant this article is to the user's interests and provide a relevance score.

User Interests: ${userInterests.join(', ')}

Article Title: ${articleTitle}
Article Content: ${articleContent.substring(0, 1500)}

Instructions:
- Provide a relevance score from 0-100 (0 = not relevant, 100 = highly relevant)
- Consider both direct and indirect relevance
- Explain your reasoning in 1-2 sentences
- Format your response as: "Score: [number] | Reasoning: [explanation]"

Analysis:`

      const result = await model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 200,
        },
      })
      
      const response = await result.response
      const analysis = response.text().trim()

      console.log(`📝 Raw AI analysis response:`, analysis)

      // Parse the response
      const scoreMatch = analysis.match(/Score:\s*(\d+)/)
      const reasoningMatch = analysis.match(/Reasoning:\s*(.+)/)

      if (scoreMatch && reasoningMatch) {
        const result = {
          score: parseInt(scoreMatch[1]),
          reasoning: reasoningMatch[1].trim()
        }
        console.log(`✅ Successfully parsed AI analysis:`, result)
        return result
      } else {
        console.warn(`⚠️ Could not parse AI response format:`, analysis)
        // Try to extract a score anyway
        const anyNumberMatch = analysis.match(/(\d+)/)
        if (anyNumberMatch) {
          return {
            score: parseInt(anyNumberMatch[1]),
            reasoning: analysis.substring(0, 100) + '...'
          }
        }
      }

      return null
    } catch (error: any) {
      console.log(`❌ Model ${modelName} failed for relevance analysis:`, error.message)
      lastError = error
      continue
    }
  }

  console.error('❌ All models failed for relevance analysis:', lastError)
  return null
}

export async function generateTopicTags(title: string, content: string): Promise<string[]> {
  if (!genAI) {
    console.warn('Gemini AI not initialized')
    return []
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Extract 3-5 relevant topic tags from this article. Focus on the main themes and subjects.

Title: ${title}
Content: ${content.substring(0, 1000)}

Instructions:
- Return only the tags, separated by commas
- Use single words or short phrases (2-3 words max)
- Focus on technology, business, science, or other relevant domains
- Example format: "AI, Machine Learning, Tech Industry, Innovation"

Tags:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const tagsText = response.text().trim()

    return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
  } catch (error) {
    console.error('❌ Error generating tags:', error)
    return []
  }
}

export async function explainComplexTopic(topic: string, context?: string): Promise<string | null> {
  if (!genAI) {
    console.warn('Gemini AI not initialized')
    return null
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Explain this topic in simple, easy-to-understand terms for a general audience.

Topic: ${topic}
${context ? `Context: ${context}` : ''}

Instructions:
- Use simple language and avoid jargon
- Provide a clear, concise explanation
- Include why this topic matters
- Keep it to 2-3 sentences
- If the topic is unclear, ask for clarification

Explanation:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('❌ Error explaining topic:', error)
    return null
  }
}
