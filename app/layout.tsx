import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { DeploymentGuard } from '@/components/shared/DeploymentGuard'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Kudo',
  description: 'Hausarbeit sichtbar machen und wertschätzen',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kudo',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={geist.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif' }}>
        <DeploymentGuard id={process.env.VERCEL_DEPLOYMENT_ID ?? 'dev'} />
        {children}
      </body>
    </html>
  )
}
