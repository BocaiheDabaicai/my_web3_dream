// Lesson 07 练习 · 链上终端
// 界面和 state 已经接好。你需要用 useRef 完成两件事：
// 1. 地址输入：聚焦、聚焦并全选；
// 2. 交易日志：日志变化后自动滚动到底部。
// 契约与提示见 lesson-07/README.md 第 7 节。

import {useState, useRef, useEffect} from 'react'

const INITIAL_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'

const INITIAL_LOGS = [
    {id: 1, text: 'RPC connected'},
    {id: 2, text: 'block #18,400,000'},
    {id: 3, text: 'tx 0x71c7… confirmed'},
]

export default function Lesson07Exercise() {
    const [address, setAddress] = useState(INITIAL_ADDRESS)
    const [logs, setLogs] = useState(INITIAL_LOGS)

    // TODO(核心 1): 声明 addressRef 和 logEndRef（记得从 react 引入 useRef）
    const addressRef = useRef(null)
    const logEndRef = useRef(null)

    // TODO(核心 2): 日志变化后，让 logEndRef 滚动到底部
    // （记得从 react 引入 useEffect）
    useEffect(() => {
        logEndRef.current?.scrollIntoView({behavior: 'smooth', block: 'nearest'})
    }, [logs])

    const handleFocus = () => {
        // TODO(核心 3): 聚焦 addressRef 指向的输入框
        addressRef.current?.focus()
    }

    const handleSelect = () => {
        // TODO(核心 4): 聚焦并全选输入框内容
        addressRef.current?.focus()
        addressRef.current?.select()
    }

    const handleAddLog = () => {
        setLogs((current) => [
            ...current,
            {id: current.length + 1, text: `tx #${current.length + 1} 已加入交易池`},
        ])
    }

    const handleClear = () => {
        setLogs([])
    }

    return (
        <div className="stack">
            <section className="control-card">
                <header className="control-card__head">
                    <div>
                        <p className="board-kicker">ADDRESS</p>
                        <h2>地址输入</h2>
                    </div>
                    <span className="board-count">DOM ref</span>
                </header>

                <label className="field field--spaced">
                    <span className="field__label">收款地址</span>
                    <input
                        ref={addressRef}
                        className="input"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        // TODO(核心 1): 把 addressRef 挂到这个 input 上
                    />
                </label>

                <div className="button-row">
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleFocus}
                    >
                        聚焦输入框
                    </button>
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={handleSelect}
                    >
                        聚焦并全选
                    </button>
                </div>

                <p className="control-note">
                    用 ref 操作输入框，不要用 document.querySelector。
                </p>
            </section>

            <section className="control-card">
                <header className="control-card__head">
                    <div>
                        <p className="board-kicker">LOG</p>
                        <h2>交易日志</h2>
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
                    {/* TODO(核心 1): 把 logEndRef 挂到这个哨兵元素上 */}
                    <li className="log-end" aria-hidden="true" ref={logEndRef}/>
                </ul>

                {logs.length === 0 && (
                    <p className="empty-inline">日志为空，添加一条试试。</p>
                )}

                <div className="button-row">
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={handleAddLog}
                    >
                        添加日志
                    </button>
                    <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={handleClear}
                    >
                        清空
                    </button>
                </div>

                <p className="control-note">
                    添加日志后列表应自动滚到最新一条；滚动发生在 DOM 更新之后。
                </p>
            </section>
        </div>
    )
}
