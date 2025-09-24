'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile } from '@/lib/firebase/auth'
import { createUserTopic, getUserTopics, updateUserTopic } from '@/lib/firebase/database'
import OnboardingFlow from '@/components/auth/OnboardingFlow'

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

export default function SettingsPage() {
  const { user, userProfile, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Technology')
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Load current user interests
  useEffect(() => {
    if (userProfile?.interests) {
      setSelectedInterests(userProfile.interests)
    }
  }, [userProfile])

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      console.log('Updating user profile with interests:', selectedInterests)
      
      // Update user profile with interests
      await updateUserProfile(user.uid, {
        interests: selectedInterests
      })

      console.log('Profile updated successfully')
      
      // Refresh the user profile to get latest data
      await refreshProfile()
      
      setMessage('✅ Your interests have been updated!')
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save interests:', error)
      setMessage(`❌ Failed to save interests: ${error.message || 'Please try again.'}`)
    } finally {
      setSaving(false)
    }
  }

  const generateKeywords = (interest: string): string[] => {
    const keywordMap: Record<string, string[]> = {
      'Artificial Intelligence': ['ai', 'artificial intelligence', 'machine learning', 'neural networks', 'deep learning', 'llm', 'gpt', 'openai'],
      'Machine Learning': ['ml', 'machine learning', 'data science', 'algorithms', 'tensorflow', 'pytorch', 'ai'],
      'Programming': ['programming', 'coding', 'software', 'development', 'javascript', 'python', 'react', 'nodejs'],
      'Startups': ['startup', 'entrepreneur', 'venture capital', 'vc', 'funding', 'unicorn', 'ipo'],
      'Cryptocurrency': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'web3'],
      'Space': ['space', 'nasa', 'spacex', 'astronomy', 'mars', 'rocket', 'satellite'],
    }

    return keywordMap[interest] || [interest.toLowerCase().replace(/\s+/g, '-')]
  }

  const resetInterests = () => {
    setShowOnboarding(true)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    refreshProfile()
  }

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#00d4ff'
      }}>
        🔄 Loading...
      </div>
    )
  }

  if (!user) return null

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        userId={user.uid} 
        onComplete={handleOnboardingComplete}
      />
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(0, 20, 40, 0.95)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '12px'
      }}>
        <div>
          <h1 style={{
            color: '#00d4ff',
            fontSize: '28px',
            marginBottom: '8px'
          }}>
            ⚙️ Settings
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px'
          }}>
            Manage your interests and preferences
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'rgba(0, 212, 255, 0.2)',
            border: '1px solid #00d4ff',
            borderRadius: '6px',
            color: '#00d4ff',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Feed
        </button>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Interests Section */}
        <div style={{
          background: 'rgba(0, 20, 40, 0.95)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#00d4ff',
              fontSize: '20px',
              margin: 0
            }}>
              🎯 Your Interests
            </h2>
            <button
              onClick={resetInterests}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔄 Reset with Guided Setup
            </button>
          </div>

          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            Selected: {selectedInterests.length}/20 topics • 
            These help personalize your news feed
          </p>

          {/* Message */}
          {message && (
            <div style={{
              background: message.includes('✅') 
                ? 'rgba(0, 255, 100, 0.1)' 
                : 'rgba(255, 100, 100, 0.1)',
              border: `1px solid ${message.includes('✅') ? '#00ff64' : '#ff6464'}`,
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px',
              color: message.includes('✅') ? '#00ff64' : '#ff6464',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          {/* Selected Interests */}
          {selectedInterests.length > 0 && (
            <div style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                color: '#00d4ff', 
                fontSize: '12px', 
                marginBottom: '12px',
                fontWeight: 'bold'
              }}>
                Selected Interests ({selectedInterests.length}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedInterests.map(interest => (
                  <span
                    key={interest}
                    style={{
                      background: 'rgba(0, 212, 255, 0.2)',
                      color: '#00d4ff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest} <span style={{ fontSize: '10px' }}>×</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Topic Categories */}
          <div style={{ marginBottom: '20px' }}>
            {Object.entries(TOPIC_CATEGORIES).map(([category, topics]) => (
              <div key={category} style={{ marginBottom: '12px' }}>
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
                    fontSize: '14px',
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
                          fontSize: '12px',
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

          {/* Save Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center' 
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.5)' 
            }}>
              {selectedInterests.length === 0 && 'Select at least 1 interest for personalization'}
              {selectedInterests.length >= 20 && 'Maximum 20 interests selected'}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving
                  ? 'rgba(0, 212, 255, 0.3)'
                  : 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                color: saving ? 'rgba(255, 255, 255, 0.5)' : '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                minWidth: '120px'
              }}
            >
              {saving ? '🔄 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* Future Settings Sections */}
        <div style={{
          background: 'rgba(0, 20, 40, 0.95)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '12px',
          padding: '30px',
          opacity: 0.6
        }}>
          <h2 style={{
            color: '#00d4ff',
            fontSize: '18px',
            marginBottom: '16px'
          }}>
            🔧 Additional Settings (Coming Soon)
          </h2>
          <div style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            • Feed preferences (scroll speed, auto-scroll)<br/>
            • Notification settings<br/>
            • API key management<br/>
            • Content source preferences<br/>
            • Export/import settings
          </div>
        </div>
      </div>
    </div>
  )
}
