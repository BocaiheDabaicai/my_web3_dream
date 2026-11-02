import Counter from './Counter'

export default function ServerClientPage() {
  return (
    <div className="panel">
      <h2>这个页面是 Server Component</h2>
      <p>
        文件 <code>src/app/demo/server-client/page.jsx</code> 没有写
        <code> 'use client'</code>，所以它默认在服务端执行。
      </p>
      <p>服务端 Node 版本：{process.version}</p>

      <hr />

      <h2>下面是 Client Component</h2>
      <p>
        <code>Counter.jsx</code> 第一行写了
        <code> 'use client'</code>，因此可以使用 useState 和点击事件。
      </p>
      <Counter />
    </div>
  )
}
