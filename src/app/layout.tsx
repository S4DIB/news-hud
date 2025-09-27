import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HUD News - Enterprise AI News Intelligence Platform',
  description: 'Professional news intelligence platform with AI-powered ranking, real-time processing, and enterprise-grade analytics. Built for FAANG engineers and YC founders.',
  keywords: ['news intelligence', 'AI', 'enterprise', 'analytics', 'API', 'FAANG', 'YC', 'startup'],
  authors: [{ name: 'HUD News Team' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'HUD News - Enterprise AI News Intelligence',
    description: 'Transform information overload into personalized insights with enterprise-grade AI news intelligence.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
