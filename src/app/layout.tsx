import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Epignose — Rede social acadêmica',
    template: '%s · Epignose',
  },
  description:
    'Repositório interativo de publicações acadêmicas: publique seus artigos, receba revisão por pares aberta e encontre referências com apoio de IA.',
  keywords: ['pesquisa', 'artigos científicos', 'peer review', 'referências', 'academia'],
  authors: [{ name: 'Epignose' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Epignose',
    title: 'Epignose — Rede social acadêmica',
    description:
      'Publique, debata e encontre referências acadêmicas com apoio de inteligência artificial.',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b111e' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
