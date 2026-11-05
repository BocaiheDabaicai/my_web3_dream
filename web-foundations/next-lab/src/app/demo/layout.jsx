import Link from 'next/link'

export default function DemoLayout({children}) {
  return (
    <section>
      <p className="kicker">DEMO</p>
      <h1>路由示例</h1>

      <nav className="sub-nav">
        <Link href="/demo">概览</Link>
        <Link href="/demo/networks">网络</Link>
        <Link href="/demo/about">关于</Link>
        <Link href="/demo/server-client">Server/Client</Link>
        <Link href="/demo/blocks">区块</Link>
        <Link href="/demo/server-data">服务端数据</Link>
      </nav>

      {children}
    </section>
  )
}
