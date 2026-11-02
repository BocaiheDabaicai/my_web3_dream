import Link from 'next/link'
import './globals.css'

export const metadata = {
  title: 'Next Lab · App Router',
  description: 'Web Foundations Lesson 10',
}

export default function RootLayout({children}) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <strong>Next Lab</strong>
          <nav>
            <Link href="/">首页</Link>
            <Link href="/demo">Demo</Link>
            <Link href="/exercise">练习</Link>
          </nav>
        </header>

        <main className="page">{children}</main>
      </body>
    </html>
  )
}
