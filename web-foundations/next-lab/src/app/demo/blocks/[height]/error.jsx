'use client'

export default function Error({error, retry}) {
  return (
    <div className="panel">
      <h2>区块读取失败</h2>
      <p>{error.message}</p>
      <button className="button" type="button" onClick={() => retry()}>
        重试
      </button>
      <p>重试会重新渲染这段路由；如果错误是永久性的，就还会再失败一次。</p>
    </div>
  )
}
