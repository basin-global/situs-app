// The root layout sets up the overall HTML structure, including <html> and <body> tags.

import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import Header from '@/components/header'
import { OGProvider } from '@/contexts/og-context'
import { PrivyProviderWrapper } from '@/providers/privy-provider'
import { spaceGrotesk, spaceMono } from './fonts'
import Footer from '@/components/footer'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import { SplitsWrapper } from '@/modules/splits'

export const metadata: Metadata = {
  title: 'Situs | place-based resilience',
  description: 'Open source tools for any group to organize and fund climate and nature projects.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="font-sans bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark min-h-screen flex flex-col">
        <PrivyProviderWrapper>
          <SplitsWrapper>
            <OGProvider>
              {process.env.NEXT_PUBLIC_IS_STAGING === 'true' && <AnnouncementBanner />}
              <Header />
              <ToastContainer />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </OGProvider>
          </SplitsWrapper>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
