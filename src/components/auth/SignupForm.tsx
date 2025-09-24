'use client'

import { useState } from 'react'
import { signUp, signInWithGoogle } from '@/lib/firebase/auth'
import OnboardingFlow from './OnboardingFlow'

interface SignupFormProps {
  onSuccess?: () => void
  onToggleMode?: () => void
}

export default function SignupForm({ onSuccess, onToggleMode }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [newUserId, setNewUserId] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const user = await signUp(email, password, { displayName })
      // Show onboarding flow for new users
      setNewUserId(user.uid)
      setShowOnboarding(true)
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')

    try {
      const user = await signInWithGoogle()
      // Check if this is a new user (created just now)
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime
      
      if (isNewUser) {
        // Show onboarding flow for new Google users
        setNewUserId(user.uid)
        setShowOnboarding(true)
      } else {
        // Existing user, just redirect
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || 'Google signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    onSuccess?.()
  }

  // Show onboarding if user just signed up
  if (showOnboarding && newUserId) {
    return (
      <OnboardingFlow 
        userId={newUserId} 
        onComplete={handleOnboardingComplete}
      />
    )
  }

  return (
    <div style={{
      background: 'var(--hud-surface)',
      border: '1px solid var(--hud-border)',
      borderRadius: '8px',
      padding: '32px',
      maxWidth: '400px',
      width: '100%'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          color: 'var(--hud-primary)', 
          marginBottom: '8px',
          fontWeight: 'bold'
        }}>
          🚀 Join HUD News
        </h1>
        <p style={{ 
          fontSize: '14px', 
          color: 'rgba(255, 255, 255, 0.7)' 
        }}>
          Create your personalized news experience
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 100, 100, 0.1)',
          border: '1px solid rgba(255, 100, 100, 0.3)',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px',
          color: '#ff6464',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            color: 'var(--hud-primary)' 
          }}>
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--hud-border)',
              borderRadius: '4px',
              color: 'var(--hud-primary)',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
            placeholder="Enter your name"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            color: 'var(--hud-primary)' 
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--hud-border)',
              borderRadius: '4px',
              color: 'var(--hud-primary)',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
            placeholder="Enter your email"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            color: 'var(--hud-primary)' 
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--hud-border)',
              borderRadius: '4px',
              color: 'var(--hud-primary)',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
            placeholder="Create a password (6+ characters)"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            color: 'var(--hud-primary)' 
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--hud-border)',
              borderRadius: '4px',
              color: 'var(--hud-primary)',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
            placeholder="Confirm your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? 'rgba(100, 100, 100, 0.3)' : 'rgba(0, 212, 255, 0.3)',
            border: `1px solid ${loading ? '#666' : 'var(--hud-primary)'}`,
            borderRadius: '4px',
            color: loading ? '#666' : 'var(--hud-primary)',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'inherit'
          }}
        >
          {loading ? '🔄 Creating account...' : '🚀 Create Account'}
        </button>
      </form>

      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.5)'
      }}>
        or
      </div>

      <button
        onClick={handleGoogleSignup}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: loading ? 'rgba(100, 100, 100, 0.3)' : 'rgba(255, 255, 255, 0.1)',
          border: `1px solid ${loading ? '#666' : 'rgba(255, 255, 255, 0.3)'}`,
          borderRadius: '4px',
          color: loading ? '#666' : '#fff',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'inherit',
          marginBottom: '20px'
        }}
      >
        {loading ? '🔄 Connecting...' : '🔍 Continue with Google'}
      </button>

      <div style={{ 
        textAlign: 'center',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        Already have an account?{' '}
        <button
          onClick={onToggleMode}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--hud-primary)',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        >
          Sign in
        </button>
      </div>

      <div style={{ 
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '4px',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        🎯 Your account will include:<br/>
        • Personalized news feed<br/>
        • Bookmark management<br/>
        • Custom topics & interests<br/>
        • Real-time updates
      </div>
    </div>
  )
}
