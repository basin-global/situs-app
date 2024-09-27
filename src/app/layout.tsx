import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import { Header } from '@/components/header'
import { SitusProvider } from '@/contexts/situs-context'
import { PrivyProviderWrapper } from '@/providers/privy-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Situs Protocol',
  description: 'Manage your digital assets with Situs Protocol',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SitusProvider>
          <PrivyProviderWrapper>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 p-4">
                {children}
              </main>
              <footer className="border-t">
                <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
                  situs: place-based resilience
                </div>
              </footer>
            </div>
            <ToastContainer />
          </PrivyProviderWrapper>
        </SitusProvider>
      </body>
    </html>
  )
}