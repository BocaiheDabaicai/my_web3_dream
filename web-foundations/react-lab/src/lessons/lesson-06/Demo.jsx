import { useEffect, useState } from 'react'

const INITIAL_HEIGHT = 18_400_000

function LiveBlockSync() {
  const [height, setHeight] = useState(INITIAL_HEIGHT)
  const [isLive, setIsLive] = useState(false)
  const [speed, setSpeed] = useState(1000)

  useEffect(() => {
    if (!isLive) return

    const timer = setInterval(() => {
      setHeight((current) => current + 1)
    }, speed)

    return () => clearInterval(timer)
  }, [isLive, speed])

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">EFFECT · TIMER</p>
          <h2>区块订阅</h2>
        </div>
        <span className={`status status--${isLive ? 'done' : 'active'}`}>
          {isLive ? '监听中' : '已暂停'}
        </span>
      </header>

      <p className="block-height">{height.toLocaleString()}</p>

      <div className="button-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setIsLive((live) => !live)}
        >
          {isLive ? '暂停' : '开始监听'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setIsLive(false)
            setHeight(INITIAL_HEIGHT)
          }}
        >
          重置
        </button>
      </div>

      <label className="field field--spaced">
        <span className="field__label">出块间隔</span>
        <select
          className="select"
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value))}
        >
          <option value={1000}>1 秒</option>
          <option value={2000}>2 秒</option>
          <option value={5000}>5 秒</option>
        </select>
      </label>

      <p className="control-note">
        effect 的依赖是 [isLive, speed]：任一变化都会先执行上一次的 cleanup
        清除旧定时器，再按新条件重新订阅。
      </p>
    </section>
  )
}

function NetworkWatcher() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    function handleOnline() {
      setOnline(true)
    }

    function handleOffline() {
      setOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">EFFECT · EVENT</p>
          <h2>网络监听</h2>
        </div>
        <span className={`status status--${online ? 'done' : 'error'}`}>
          {online ? '在线' : '离线'}
        </span>
      </header>

      <p className="log-title">
        {online
          ? '浏览器在线，可以继续同步区块。'
          : '浏览器离线，链上请求会失败。'}
      </p>

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
        空依赖让订阅只在挂载时建立一次；cleanup 在卸载时移除同样的两个函数。
        两个按钮只是派发浏览器事件，模拟真实的网络变化。
      </p>
    </section>
  )
}

export default function Lesson06Demo() {
  return (
    <div className="stack">
      <LiveBlockSync />
      <NetworkWatcher />

      <p className="demo-note">
        Effect 在渲染提交之后运行，用来和 React 之外的世界同步：定时器、事件订阅、网络请求。
        依赖决定什么时候重新同步，cleanup 保证旧的同步被撤销。
      </p>
    </div>
  )
}
