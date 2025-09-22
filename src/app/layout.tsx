import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HUD News - AI-Powered News Aggregation',
  description: 'A personalized HUD-style news aggregation app with AI-powered ranking and auto-scrolling feeds',
  keywords: ['news', 'AI', 'aggregation', 'personalized', 'HUD', 'tech'],
  authors: [{ name: 'HUD News Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="hud-screen scan-lines">
          {children}
        </div>
      </body>
    </html>
  )
}
