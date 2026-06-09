import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ads Dashboard',
  description: 'Dashboard de performance de campanhas Meta Ads',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0a0a0a] text-white antialiased">{children}</body>
    </html>
  )
}
