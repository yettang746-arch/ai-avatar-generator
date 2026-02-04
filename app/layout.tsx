import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-avatar.vercel.app'),
  title: 'AI Avatar Generator - AI 头像 & 照片生成器',
  description: '基于智谱 AI (GLM-4-CogView) 的 AI 头像和照片生成器。普通人也能轻松、快速地生成各种风格的 AI 头像和艺术照片。',
  keywords: 'AI头像, AI照片生成器, 智谱AI, GLM-4-CogView, AI绘画, 头像生成, 照片编辑, 肖像制作, AI艺术',
  authors: [{ name: 'OldTang' }],
  creator: 'OldTang',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://ai-avatar.vercel.app',
    title: 'AI Avatar Generator - AI 头像 & 照片生成器',
    description: '基于智谱 AI (GLM-4-CogView) 的 AI 头像和照片生成器。普通人也能轻松、快速地生成各种风格的 AI 头像和艺术照片。',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'AI Avatar Generator'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Avatar Generator - AI 头像 & 照片生成器',
    description: '基于智谱 AI (GLM-4-CogView) 的 AI 头像和照片生成器。普通人也能轻松、快速地生成各种风格的 AI 头像和艺术照片。',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-H6J5MBJ7R5"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);} 
gtag('js', new Date());

gtag('config', 'G-H6J5MBJ7R5');`
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
