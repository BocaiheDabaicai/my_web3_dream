import Link from 'next/link'

export default function HomePage() {
  return (
    <section>
      <p className="kicker">LESSON 10</p>
      <h1>目录就是路由</h1>
      <p>
        在 Next.js 的 App Router 里，一个文件夹对应一个网址。
        <code>page.jsx</code> 是页面，<code>layout.jsx</code> 是包住页面的共用外壳。
      </p>

      <div className="card-row">
        <Link className="card" href="/demo">
          <h2>看 Demo</h2>
          <p>三个静态页面，演示文件夹、page 和嵌套 layout。</p>
        </Link>

        <Link className="card" href="/exercise">
          <h2>做练习</h2>
          <p>在 /exercise 下创建你自己的页面和共享导航。</p>
        </Link>
      </div>
    </section>
  )
}
