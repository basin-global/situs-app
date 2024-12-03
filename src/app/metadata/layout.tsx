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

export default function MetadataLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" 
          content="default-src 'self' 'unsafe-inline'; 
                  img-src * data: blob:; 
                  font-src 'self' fonts.gstatic.com data:;
                  frame-ancestors 'self' https://*.opensea.io https://*.rarible.com https://*.blur.io *;" />
      </head>
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} bg-black`}>
        <div className="h-screen w-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
} 