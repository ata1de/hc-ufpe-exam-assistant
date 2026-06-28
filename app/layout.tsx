import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter_Tight, Newsreader, Geist_Mono } from 'next/font/google'
import './globals.css'

const interTight = Inter_Tight({
  variable: '--font-inter-tight',
  subsets: ['latin'],
})
const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Assistente UDI HC-UFPE',
  description:
    'Tire suas dúvidas sobre o preparo dos exames de imagem da Unidade de Diagnóstico por Imagem do Hospital das Clínicas da UFPE.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1D6FE0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${interTight.variable} ${newsreader.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
