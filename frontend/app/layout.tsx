import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'
import { AIChatPanel } from '@/components/ai/ai-chat-panel'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CloudOps Command Center',
  description: 'Full-stack DevOps/SRE Operations Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background gradient-mesh">
          <Sidebar />
          <div className="pl-[72px] lg:pl-[240px] transition-all duration-200">
            <Header />
            <main className="p-6">{children}</main>
          </div>
          <Toaster />
          <AIChatPanel />
        </div>
      </body>
    </html>
  )
}
