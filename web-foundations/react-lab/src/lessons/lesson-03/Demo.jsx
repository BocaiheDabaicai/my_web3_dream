import { useState } from 'react'

const initialTxs = [
  { id: 1, type: 'Transfer', status: 'pending' },
  { id: 2, type: 'Approve', status: 'pending' },
]

function SnapshotLab() {
  const [count, setCount] = useState(0)

  function addThreeWithSnapshot() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
  }

  function addThreeWithUpdater() {
    setCount((current) => current + 1)
    setCount((current) => current + 1)
    setCount((current) => current + 1)
  }

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">STATE SNAPSHOT</p>
          <h2>状态快照实验</h2>
        </div>
        <span className="board-count">count: {count}</span>
      </header>

      <p className="counter-value" aria-live="polite">
        {count}
      </p>

      <div className="button-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setCount(count + 1)}
        >
          +1
        </button>
        <button type="button" className="btn" onClick={addThreeWithSnapshot}>
          快照陷阱 ×3
        </button>
        <button type="button" className="btn" onClick={addThreeWithUpdater}>
          更新函数 ×3
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setCount(0)}
        >
          重置
        </button>
      </div>

      <p className="control-note">
        同一次事件里连续三次 <code>setCount(count + 1)</code> 只会加 1，
        因为这些调用读取的是同一个渲染快照；改用函数式更新才会依次加 3。
      </p>
    </section>
  )
}

function TransactionQueue() {
  const [txs, setTxs] = useState(initialTxs)
  const [nextId, setNextId] = useState(3)

  function addTx() {
    setTxs((current) => [
      ...current,
      { id: nextId, type: 'Transfer', status: 'pending' },
    ])
    setNextId((current) => current + 1)
  }

  function confirmFirst() {
    setTxs((current) =>
      current.map((tx, index) =>
        index === 0 ? { ...tx, status: 'confirmed' } : tx,
      ),
    )
  }

  function clearConfirmed() {
    setTxs((current) => current.filter((tx) => tx.status !== 'confirmed'))
  }

  function resetQueue() {
    setTxs(initialTxs)
    setNextId(3)
  }

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">IMMUTABLE ARRAY</p>
          <h2>交易队列</h2>
        </div>
        <span className="board-count">next id: {nextId}</span>
      </header>

      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={addTx}>
          添加交易
        </button>
        <button type="button" className="btn" onClick={confirmFirst}>
          确认第一笔
        </button>
        <button type="button" className="btn" onClick={clearConfirmed}>
          清除已确认
        </button>
        <button type="button" className="btn btn--ghost" onClick={resetQueue}>
          重置
        </button>
      </div>

      {txs.length === 0 ? (
        <p className="empty-inline">队列为空。添加一笔交易试试。</p>
      ) : (
        <ul className="tx-list">
          {txs.map((tx) => {
            const isConfirmed = tx.status === 'confirmed'

            return (
              <li key={tx.id} className={`tx ${isConfirmed ? 'tx--done' : ''}`}>
                <span className="tx__id">#{tx.id}</span>
                <span className="tx__type">{tx.type}</span>
                <span
                  className={`status ${
                    isConfirmed ? 'status--done' : 'status--active'
                  }`}
                >
                  {isConfirmed ? '已确认' : '待确认'}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      <p className="control-note">
        添加用展开创建新数组，确认用 map 和对象展开，删除用 filter；
        原数组始终不变。
      </p>
    </section>
  )
}

export default function Lesson03Demo() {
  return (
    <div className="stack">
      <SnapshotLab />
      <TransactionQueue />

      <p className="demo-note">
        state 是组件在多次渲染之间的记忆。setter 不会立刻改变当前变量，而是请求
        React 用新值重新渲染；连续更新交给函数式 updater。
      </p>
    </div>
  )
}
