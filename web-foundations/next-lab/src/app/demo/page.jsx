import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="panel">
      <h2>这个页面是 /demo</h2>
      <p>
        对应文件：<code>src/app/demo/page.jsx</code>
      </p>
      <p>
        上面的导航来自 <code>src/app/demo/layout.jsx</code>。
        切到网络或关于页面时，导航不会消失。
      </p>

      <Link className="button" href="/demo/networks">
        去看 /demo/networks
      </Link>
    </div>
  )
}
