// Lesson 06 练习 · 链上监听台
// 状态、事件处理函数和界面已经接好。你需要实现三个 useEffect：
// 1. 区块订阅：isLive 为 true 时按 speed 递增 height，暂停或变速时清理旧定时器；
// 2. 网络监听：订阅 window 的 online / offline，卸载时移除监听；
// 3. 标题同步：把 isLive 和 height 同步到 document.title。
// 契约与提示见 lesson-06/README.md 第 7 节。

import {useEffect, useState} from 'react'

const INITIAL_HEIGHT = 18_400_000

function formatTitle(isLive, height) {
    return `${isLive ? '同步中' : '已暂停'} · #${height.toLocaleString()} · 链上监听台`
}

export default function Lesson06Exercise() {
    const [height, setHeight] = useState(INITIAL_HEIGHT)
    const [isLive, setIsLive] = useState(false)
    const [speed, setSpeed] = useState(1000)
    const [online, setOnline] = useState(navigator.onLine)

    useEffect(() => {
        // TODO(核心 1): isLive 为 true 时用 setInterval 按 speed 递增 height；
        // 暂停或 speed 变化时 clearInterval。
        if (!isLive) return

        const id = setInterval(() => {
            setHeight((current) => current + 1)
        }, speed)

        return () => clearInterval(id)

    }, [isLive, speed])

    useEffect(() => {
        // TODO(核心 2): 监听 window 的 online / offline 并更新 online；
        // 返回 cleanup 移除两个监听。
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

    useEffect(() => {
        // TODO(核心 3): 让 document.title 等于 formatTitle(isLive, height)。
        document.title = formatTitle(isLive, height)
    }, [height, isLive])

    const handleReset = () => {
        setIsLive(false)
        setHeight(INITIAL_HEIGHT)
    }

    const simulateNetwork = (type) => {
        window.dispatchEvent(new Event(type))
    }

    return (
        <div className="stack">
            <section className="control-card">
                <header className="control-card__head">
                    <div>
                        <p className="board-kicker">SUBSCRIPTION</p>
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
                        onClick={handleReset}
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
                    开始后高度每 {speed / 1000} 秒 +1；暂停后必须完全停止。
                </p>
            </section>

            <section className="control-card">
                <header className="control-card__head">
                    <div>
                        <p className="board-kicker">NETWORK</p>
                        <h2>网络监听</h2>
                    </div>
                    <span className={`status status--${online ? 'done' : 'error'}`}>
            {online ? '在线' : '离线'}
          </span>
                </header>

                <div className="preview-card">
                    <h3>当前网络</h3>
                    <div className="preview-rows">
                        <div className="preview-row">
                            <span className="preview-row__label">状态</span>
                            <span className="preview-row__value">
                {online ? '在线' : '离线'}
              </span>
                        </div>
                        <div className="preview-row">
                            <span className="preview-row__label">来源</span>
                            <span className="preview-row__value">window online / offline</span>
                        </div>
                    </div>
                </div>

                <div className="button-row">
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => simulateNetwork('offline')}
                    >
                        模拟断网
                    </button>
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => simulateNetwork('online')}
                    >
                        模拟恢复
                    </button>
                </div>

                <p className="control-note">
                    DevTools 的 Offline 开关也会触发同样的浏览器事件。
                </p>
            </section>

            <section className="control-card">
                <header className="control-card__head">
                    <div>
                        <p className="board-kicker">DOCUMENT</p>
                        <h2>标题同步</h2>
                    </div>
                    <span className="board-count">看浏览器标签页</span>
                </header>

                <div className="preview-rows">
                    <div className="preview-row">
                        <span className="preview-row__label">目标标题</span>
                        <span className="preview-row__value">
              {formatTitle(isLive, height)}
            </span>
                    </div>
                </div>

                <p className="control-note">
                    实现第 3 个 effect 后，浏览器标签页标题应与这里一致。标题同步不需要
                    cleanup；想想为什么。
                </p>
            </section>
        </div>
    )
}
