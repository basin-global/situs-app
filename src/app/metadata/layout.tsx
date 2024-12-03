import '@/app/globals.css'
import { Space_Grotesk, Space_Mono } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

export const metadata = {
  title: 'Situs Metadata',
  description: 'Situs metadata viewer',
}

export const dynamic = 'force-dynamic'

export const runtime = 'edge'

export default function MetadataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} bg-black`}>
        {children}
      </body>
    </html>
  );
} 