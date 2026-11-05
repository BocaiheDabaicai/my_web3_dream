import {cache, Suspense} from 'react'

async function getNetworkStats() {
  // 模拟一次 800ms 的服务端查询
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    queryId: Math.random().toString(16).slice(2, 8),
    blockHeight: 21000042,
    gasPrice: 18,
    peers: 24,
  }
}

const getCachedStats = cache(getNetworkStats)

async function StatCard({title, cached}) {
  const stats = cached ? await getCachedStats() : await getNetworkStats()

  return (
    <article className="card">
      <h2>{title}</h2>
      <p>
        查询 ID：<code>{stats.queryId}</code>
      </p>
      <p>区块高度：{stats.blockHeight}</p>
      <p>
        Gas：{stats.gasPrice} gwei · 节点：{stats.peers}
      </p>
    </article>
  )
}

function CardRow({cached, names}) {
  return (
    <div className="card-row">
      {names.map((name) => (
        <StatCard key={name} title={name} cached={cached} />
      ))}
    </div>
  )
}

export default function ServerDataPage() {
  return (
    <div>
      <h2>在服务端获取数据</h2>
      <p>
        这个页面没有 <code>'use client'</code>，直接 <code>async/await</code>{' '}
        取数据，服务端渲染成 HTML 再发给浏览器。
      </p>

      <h3>用 React.cache 包一层</h3>
      <Suspense fallback={<p>正在查询节点…</p>}>
        <CardRow cached names={['节点 A', '节点 B']} />
      </Suspense>
      <p>
        两张卡片的查询 ID 相同：同一次请求里，<code>getNetworkStats</code>{' '}
        只执行了一次。
      </p>

      <h3>不包 cache</h3>
      <Suspense fallback={<p>正在查询节点…</p>}>
        <CardRow cached={false} names={['节点 C', '节点 D']} />
      </Suspense>
      <p>不包 cache 时，每张卡片各查一次，查询 ID 不同。</p>

      <a className="button" href="/demo/server-data">
        重新加载
      </a>
      <p>重新加载后所有 ID 都会变：React.cache 只存活在这一轮请求里。</p>
    </div>
  )
}
