export default function NetworksPage() {
  return (
    <div>
      <h2>这个页面是 /demo/networks</h2>
      <p>
        对应文件：<code>src/app/demo/networks/page.jsx</code>
      </p>

      <div className="card-row">
        <article className="card">
          <h2>Ethereum</h2>
          <p>最早支持智能合约的公链之一。</p>
        </article>

        <article className="card">
          <h2>Arbitrum</h2>
          <p>建立在 Ethereum 之上的 Layer 2。</p>
        </article>

        <article className="card">
          <h2>Base</h2>
          <p>同样属于 Layer 2，使用起来更便宜。</p>
        </article>
      </div>
    </div>
  )
}
