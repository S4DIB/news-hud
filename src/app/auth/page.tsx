'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChange } from '@/lib/firebase/auth'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        // User is logged in, redirect to main app
        router.push('/')
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleAuthSuccess = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--hud-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--hud-primary)',
        fontFamily: "'Courier New', monospace"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--hud-background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Courier New', monospace"
    }}>
      <div className="grid-bg" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        zIndex: 0
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {isLogin ? (
          <LoginForm 
            onSuccess={handleAuthSuccess}
            onToggleMode={() => setIsLogin(false)}
          />
        ) : (
          <SignupForm 
            onSuccess={handleAuthSuccess}
            onToggleMode={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  )
}
