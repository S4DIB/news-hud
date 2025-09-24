'use client'

import { useState } from 'react'
import { updateUserProfile } from '@/lib/firebase/auth'
import { createUserTopic } from '@/lib/firebase/database'

interface OnboardingFlowProps {
  userId: string
  onComplete: () => void
}

// Predefined topic categories with popular interests
const TOPIC_CATEGORIES = {
  'Technology': [
    'Artificial Intelligence',
    'Machine Learning', 
    'Programming',
    'Web Development',
    'Mobile Development',
    'DevOps',
    'Cybersecurity',
    'Blockchain',
    'Cloud Computing',
    'Data Science'
  ],
  'Business': [
    'Startups',
    'Entrepreneurship',
    'Finance',
    'Investing',
    'Marketing',
    'Product Management',
    'Leadership',
    'E-commerce',
    'Cryptocurrency',
    'Stock Market'
  ],
  'Science': [
    'Space',
    'Physics',
    'Biology',
    'Chemistry',
    'Climate Change',
    'Medical Research',
    'Neuroscience',
    'Psychology',
    'Environment',
    'Innovation'
  ],
  'Lifestyle': [
    'Health & Fitness',
    'Travel',
    'Food',
    'Photography',
    'Gaming',
    'Movies & TV',
    'Music',
    'Books',
    'Fashion',
    'Sports'
  ],
  'News & Politics': [
    'World News',
    'Politics',
    'Economics',
    'Social Issues',
    'Policy',
    'Elections',
    'International Relations',
    'Human Rights',
    'Education',
    'Law'
  ]
}

export default function OnboardingFlow({ userId, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Technology')

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleComplete = async () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest to continue')
      return
    }

    setLoading(true)

    try {
      // Update user profile with selected interests
      await updateUserProfile(userId, {
        interests: selectedInterests
      })

      // Create user topics for personalization
      for (const interest of selectedInterests) {
        await createUserTopic(userId, {
          name: interest,
          keywords: generateKeywords(interest),
          weight: 1.0,
          isActive: true,
          engagementScore: 0,
          isAutoDetected: false,
          confidence: 1.0
        })
      }

      onComplete()
    } catch (error) {
      console.error('Failed to save interests:', error)
      alert('Failed to save your interests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Generate relevant keywords for each interest
  const generateKeywords = (interest: string): string[] => {
    const keywordMap: Record<string, string[]> = {
      'Artificial Intelligence': ['ai', 'artificial intelligence', 'machine learning', 'neural networks', 'deep learning', 'llm', 'gpt', 'openai'],
      'Machine Learning': ['ml', 'machine learning', 'data science', 'algorithms', 'tensorflow', 'pytorch', 'ai'],
      'Programming': ['programming', 'coding', 'software', 'development', 'javascript', 'python', 'react', 'nodejs'],
      'Startups': ['startup', 'entrepreneur', 'venture capital', 'vc', 'funding', 'unicorn', 'ipo'],
      'Cryptocurrency': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'web3'],
      'Space': ['space', 'nasa', 'spacex', 'astronomy', 'mars', 'rocket', 'satellite'],
      // Add more as needed
    }

    return keywordMap[interest] || [interest.toLowerCase().replace(/\s+/g, '-')]
  }

  if (currentStep === 1) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'rgba(0, 20, 40, 0.95)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
          <h1 style={{
            color: '#00d4ff',
            fontSize: '28px',
            marginBottom: '16px',
            fontWeight: 'bold'
          }}>
            Welcome to HUD News!
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '30px'
          }}>
            Let's personalize your news feed by selecting topics you're interested in. 
            This will help us show you the most relevant content from across the web.
          </p>
          <button
            onClick={() => setCurrentStep(2)}
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              color: '#000',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 212, 255, 0.4)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(0, 20, 40, 0.95)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{
            color: '#00d4ff',
            fontSize: '24px',
            marginBottom: '8px'
          }}>
            Choose Your Interests
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px'
          }}>
            Select {selectedInterests.length}/20 topics • Minimum 1 required
          </p>
        </div>

        {/* Selected Interests Counter */}
        {selectedInterests.length > 0 && (
          <div style={{
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ color: '#00d4ff', fontSize: '12px', marginBottom: '8px' }}>
              Selected Interests ({selectedInterests.length}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedInterests.map(interest => (
                <span
                  key={interest}
                  style={{
                    background: 'rgba(0, 212, 255, 0.2)',
                    color: '#00d4ff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest} ×
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Topic Categories */}
        <div style={{ marginBottom: '30px' }}>
          {Object.entries(TOPIC_CATEGORIES).map(([category, topics]) => (
            <div key={category} style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setExpandedCategory(
                  expandedCategory === category ? null : category
                )}
                style={{
                  width: '100%',
                  background: expandedCategory === category 
                    ? 'rgba(0, 212, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#00d4ff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease'
                }}
              >
                <span>{category}</span>
                <span style={{ 
                  transform: expandedCategory === category ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}>
                  ▼
                </span>
              </button>

              {expandedCategory === category && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px'
                }}>
                  {topics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => toggleInterest(topic)}
                      disabled={!selectedInterests.includes(topic) && selectedInterests.length >= 20}
                      style={{
                        background: selectedInterests.includes(topic)
                          ? 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: selectedInterests.includes(topic) ? '#000' : '#fff',
                        fontSize: '14px',
                        cursor: (!selectedInterests.includes(topic) && selectedInterests.length >= 20) 
                          ? 'not-allowed' : 'pointer',
                        opacity: (!selectedInterests.includes(topic) && selectedInterests.length >= 20) 
                          ? 0.5 : 1,
                        transition: 'all 0.3s ease',
                        textAlign: 'left'
                      }}
                    >
                      {selectedInterests.includes(topic) ? '✓ ' : ''}{topic}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setCurrentStep(1)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>

          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
            {selectedInterests.length === 0 && 'Select at least 1 interest to continue'}
            {selectedInterests.length >= 20 && 'Maximum 20 interests selected'}
          </div>

          <button
            onClick={handleComplete}
            disabled={loading || selectedInterests.length === 0}
            style={{
              background: (loading || selectedInterests.length === 0)
                ? 'rgba(0, 212, 255, 0.3)'
                : 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              color: (loading || selectedInterests.length === 0) ? 'rgba(255, 255, 255, 0.5)' : '#000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (loading || selectedInterests.length === 0) ? 'not-allowed' : 'pointer',
              minWidth: '120px'
            }}
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  )
}
