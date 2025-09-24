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

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

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

    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysis = response.text().trim()

    // Parse the response
    const scoreMatch = analysis.match(/Score:\s*(\d+)/)
    const reasoningMatch = analysis.match(/Reasoning:\s*(.+)/)

    if (scoreMatch && reasoningMatch) {
      return {
        score: parseInt(scoreMatch[1]),
        reasoning: reasoningMatch[1].trim()
      }
    }

    return null
  } catch (error) {
    console.error('❌ Error analyzing relevance:', error)
    return null
  }
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
