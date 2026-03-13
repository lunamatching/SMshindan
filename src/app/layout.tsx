import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '深層欲求タイプ診断 | SM診断',
  description: 'あなたの真の姿はどれ？12タイプの深層欲求診断で、あなたの本質を探ります。',
  openGraph: {
    title: '深層欲求タイプ診断',
    description: 'あなたの真の姿はどれ？',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-luna-gradient">
        <div className="max-w-lg mx-auto px-4 py-6">{children}</div>
      </body>
    </html>
  )
}
