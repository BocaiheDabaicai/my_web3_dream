import { useEffect, useRef, useState } from 'react'

const INITIAL_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'

const INITIAL_LOGS = [
  { id: 1, text: 'RPC connected' },
  { id: 2, text: 'block #18,400,000' },
  { id: 3, text: 'tx 0x71c7… confirmed' },
]

function AddressFocusDemo() {
  const [address, setAddress] = useState(INITIAL_ADDRESS)
  const inputRef = useRef(null)

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">REF · DOM</p>
          <h2>地址输入</h2>
        </div>
        <span className="board-count">inputRef</span>
      </header>

      <label className="field field--spaced">
        <span className="field__label">收款地址</span>
        <input
          ref={inputRef}
          className="input"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </label>

      <div className="button-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => inputRef.current?.focus()}
        >
          聚焦输入框
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            inputRef.current?.focus()
            inputRef.current?.select()
          }}
        >
          聚焦并全选
        </button>
      </div>

      <p className="control-note">
        ref 指向真实的 DOM 节点。focus() 和 select() 是浏览器的命令式 API，
        不需要 setState，也不会触发重渲染。
      </p>
    </section>
  )
}

function LogScrollDemo() {
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const endRef = useRef(null)
  const nextIdRef = useRef(4)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [logs])

  const addLog = () => {
    const id = nextIdRef.current
    nextIdRef.current += 1

    setLogs((current) => [
      ...current,
      { id, text: `tx #${id} 已加入交易池` },
    ])
  }

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">REF · EFFECT</p>
          <h2>日志滚动</h2>
        </div>
        <span className="board-count">{logs.length} 条</span>
      </header>

      <ul className="log-list log-list--scroll">
        {logs.map((log) => (
          <li key={log.id} className="log-item">
            <span className="log-item__id">#{log.id}</span>
            {log.text}
          </li>
        ))}
        <li ref={endRef} className="log-end" aria-hidden="true" />
      </ul>

      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={addLog}>
          追加日志
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setLogs([])}
        >
          清空
        </button>
      </div>

      <p className="control-note">
        endRef 挂在列表末尾的哨兵元素上。setState 返回时 DOM 还没更新，
        所以滚动放在 logs 变化后的 effect 里；nextIdRef 只记录下一个编号，
        改它不需要触发渲染。
      </p>
    </section>
  )
}

function RefVsStateDemo() {
  const [count, setCount] = useState(0)
  const [refSnapshot, setRefSnapshot] = useState(0)
  const refCount = useRef(0)

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">REF · STATE</p>
          <h2>ref 与 state</h2>
        </div>
        <span className="board-count">改 ref 不渲染</span>
      </header>

      <div className="preview-rows">
        <div className="preview-row">
          <span className="preview-row__label">state count</span>
          <span className="preview-row__value">{count}</span>
        </div>
        <div className="preview-row">
          <span className="preview-row__label">ref.current（上次读取）</span>
          <span className="preview-row__value">{refSnapshot}</span>
        </div>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setCount((current) => current + 1)}
        >
          state +1
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            refCount.current += 1
          }}
        >
          ref +1
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setRefSnapshot(refCount.current)}
        >
          读取 ref
        </button>
      </div>

      <p className="control-note">
        点 ref +1 页面不会变；点“读取 ref”把当前值复制到 state 才会渲染。
        ref 适合存行为数据，不适合作为渲染数据源。
      </p>
    </section>
  )
}

export default function Lesson07Demo() {
  return (
    <div className="stack">
      <AddressFocusDemo />
      <LogScrollDemo />
      <RefVsStateDemo />

      <p className="demo-note">
        useRef 是一个跨渲染保留、修改时不触发重渲染的盒子。把它挂到 JSX 的
        ref 上就得到 DOM 节点；把它留给定时器、连接、编号等行为数据，就不会
        因为无关变化打乱界面。
      </p>
    </div>
  )
}
