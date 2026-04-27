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
      <body style={{ fontFamily: 'var(--font-geist), system-ui, sans-serif', background: '#FDF8F1' }}>
        <div id="app-splash">
          <img src="/icons/icon-512.png" width="108" height="108" alt="" />
        </div>
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('load', function() {
            var s = document.getElementById('app-splash');
            if (!s) return;
            setTimeout(function() {
              s.classList.add('app-splash--out');
              setTimeout(function() { s.style.display = 'none'; }, 450);
            }, 150);
          });
        `}} />
        <DeploymentGuard id={process.env.VERCEL_DEPLOYMENT_ID ?? 'dev'} />
        {children}
      </body>
    </html>
  )
}
