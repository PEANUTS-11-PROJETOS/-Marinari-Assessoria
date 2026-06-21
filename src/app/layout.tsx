import type { Metadata } from 'next'
import { Manrope, Geist_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const cormorantGaramond = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Marinari Assessoria',
  description: 'Painel de casamentos · by Peanuts Labs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-br"
      className={`${manrope.variable} ${geistMono.variable} ${cormorantGaramond.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
