export default function Loading() {
  return (
    <div className="panel">
      <h2>正在加载区块…</h2>
      <p>
        这是 <code>[height]/loading.jsx</code>，页面慢的时候自动出现。
      </p>
      <p>它没有 props，拿不到当前的高度，所以所有区块共用这一份加载界面。</p>
    </div>
  )
}
