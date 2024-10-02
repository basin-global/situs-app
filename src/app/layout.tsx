// The root layout sets up the overall HTML structure, including <html> and <body> tags.

import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import Header from '@/components/header'
import { SitusProvider } from '@/contexts/situs-context'
import { PrivyProviderWrapper } from '@/providers/privy-provider'
import { spaceGrotesk, spaceMono } from './fonts'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Situs | place-based resilience',
  description: 'Open source tools for any group to organize and fund climate and nature projects.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="font-sans">
        <PrivyProviderWrapper>
          <SitusProvider>
            <Header />
            <ToastContainer />
            {children}
            <Footer />
          </SitusProvider>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}