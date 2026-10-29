import { useEffect, useState } from 'react'

const INITIAL_RPC_QUERIES = [
  { id: 1, method: 'eth_blockNumber', note: '区块高度' },
  { id: 2, method: 'eth_getBalance', note: '地址余额' },
  { id: 3, method: 'eth_call', note: '合约只读调用' },
  { id: 4, method: 'eth_gasPrice', note: 'Gas 价格' },
  { id: 5, method: 'eth_getTransactionReceipt', note: '交易回执' },
]

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}

function useBlockHeight(start, interval) {
  const [height, setHeight] = useState(start)

  useEffect(() => {
    const id = setInterval(() => {
      setHeight((current) => current + 1)
    }, interval)

    return () => clearInterval(id)
  }, [interval])

  return height
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

function EndpointStatus({ name }) {
  const online = useOnlineStatus()

  return (
    <div className="preview-row">
      <span className="preview-row__label">{name}</span>
      <span className={`status status--${online ? 'done' : 'error'}`}>
        {online ? '在线' : '离线'}
      </span>
    </div>
  )
}

function OnlineStatusDemo() {
  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">HOOK · SUBSCRIPTION</p>
          <h2>useOnlineStatus</h2>
        </div>
        <span className="board-count">2 处调用</span>
      </header>

      <div className="preview-rows">
        <EndpointStatus name="RPC 节点" />
        <EndpointStatus name="行情推送" />
      </div>

      <div className="button-row">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => window.dispatchEvent(new Event('offline'))}
        >
          模拟断网
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => window.dispatchEvent(new Event('online'))}
        >
          模拟恢复
        </button>
      </div>

      <p className="control-note">
        两个组件各自调用 useOnlineStatus()，各有一份 state。它们监听同一个浏览器事件源，
        所以状态一致；卸载时各自的 cleanup 移除自己的监听。
      </p>
    </section>
  )
}

function TickerRow({ network, start, interval }) {
  const height = useBlockHeight(start, interval)

  return (
    <div className="preview-row">
      <span className="preview-row__label">
        {network} · 每 {interval / 1000} 秒
      </span>
      <span className="preview-row__value">{height.toLocaleString()}</span>
    </div>
  )
}

function BlockHeightDemo() {
  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">HOOK · TIMER</p>
          <h2>useBlockHeight</h2>
        </div>
        <span className="board-count">state 相互独立</span>
      </header>

      <div className="preview-rows">
        <TickerRow network="主网" start={18_400_000} interval={1000} />
        <TickerRow network="测试网" start={8_120_000} interval={2400} />
      </div>

      <p className="control-note">
        同一个 Hook 调用两次，得到两个独立的 height。每个实例有自己的定时器和 state，
        主网每秒 +1，测试网每 2.4 秒 +1，互不影响。
      </p>
    </section>
  )
}

function DebounceDemo() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 500)

  const keyword = debouncedQuery.trim().toLowerCase()
  const results = keyword
    ? INITIAL_RPC_QUERIES.filter(
        (item) =>
          item.method.toLowerCase().includes(keyword) ||
          item.note.toLowerCase().includes(keyword),
      )
    : INITIAL_RPC_QUERIES

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">HOOK · DEBOUNCE</p>
          <h2>useDebouncedValue</h2>
        </div>
        <span className="board-count">{results.length} 条方法</span>
      </header>

      <label className="field field--spaced">
        <span className="field__label">RPC 方法或用途</span>
        <input
          className="input"
          value={query}
          placeholder="试试输入 balance 或 gas"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="preview-rows">
        <div className="preview-row">
          <span className="preview-row__label">输入值</span>
          <span className="preview-row__value">{query || '—'}</span>
        </div>
        <div className="preview-row">
          <span className="preview-row__label">生效值（停 500ms 后）</span>
          <span className="preview-row__value">{debouncedQuery || '—'}</span>
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="tx-list">
          {results.map((item) => (
            <li key={item.id} className="tx">
              <span className="tx__id">{item.method}</span>
              <span className="tx__type">{item.note}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-inline">没有匹配的 RPC 方法。</p>
      )}

      <p className="control-note">
        输入值每敲一个字符就更新；生效值要等停止输入 500ms 后才变。
        每次输入都会取消上一次的 setTimeout，所以只有最后一次计时会生效。
      </p>
    </section>
  )
}

export default function Lesson08Demo() {
  return (
    <div className="stack">
      <OnlineStatusDemo />
      <BlockHeightDemo />
      <DebounceDemo />

      <p className="demo-note">
        自定义 Hook 是带状态的逻辑函数：名字以 use 开头，内部调用内置 Hook，
        返回组件需要的值。每次调用都有独立的 state；复用逻辑，不共享状态。
      </p>
    </div>
  )
}
