'use client'

import { useState } from 'react'
import { signIn, signInWithGoogle } from '@/lib/firebase/auth'

interface LoginFormProps {
  onSuccess?: () => void
  onToggleMode?: () => void
}

export default function LoginForm({ onSuccess, onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
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
          🚀 HUD News
        </h1>
        <p style={{ 
          fontSize: '14px', 
          color: 'rgba(255, 255, 255, 0.7)' 
        }}>
          Sign in to your personalized news feed
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

      <form onSubmit={handleEmailLogin} style={{ marginBottom: '20px' }}>
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

        <div style={{ marginBottom: '20px' }}>
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
            placeholder="Enter your password"
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
          {loading ? '🔄 Signing in...' : '🚀 Sign In'}
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
        onClick={handleGoogleLogin}
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
        Don't have an account?{' '}
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
          Sign up
        </button>
      </div>
    </div>
  )
}
