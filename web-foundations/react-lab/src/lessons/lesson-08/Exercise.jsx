// Lesson 08 练习 · 链上数据看板
// 界面、组件拆分与事件接线已经完成。你只需要实现 hooks.js 里的三个自定义 Hook：
// useOnlineStatus、useBlockHeight、useDebouncedValue。
// 契约与提示见 lesson-08/README.md 第 10 节。

import { useState } from 'react'
import {
    useBlockHeight,
    useDebouncedValue,
    useOnlineStatus,
} from './hooks'

const MAINNET_START = 18_400_000
const TESTNET_START = 8_120_000

const ADDRESSES = [
    {
        label: 'Binance',
        address: '0x28C6c06298d514Db089934071355E5743bf21d60',
        balance: '1,204.6 ETH',
    },
    {
        label: 'Uniswap V3',
        address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        balance: '—',
    },
    {
        label: 'Vitalik',
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        balance: '1,801.2 ETH',
    },
    {
        label: 'Aave V3',
        address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        balance: '—',
    },
    {
        label: 'Lido',
        address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        balance: '—',
    },
]

function ControlPanel({ showTestnet, onToggleTestnet }) {
    const online = useOnlineStatus()

    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">CONTROL · HOOKS</p>
                    <h2>面板控制</h2>
                </div>
                <span className={`status status--${online ? 'done' : 'error'}`}>
                    {online ? '在线' : '离线'}
                </span>
            </header>

            <div className="preview-rows">
                <div className="preview-row">
                    <span className="preview-row__label">useOnlineStatus</span>
                    <span className="preview-row__value">
                        {online ? '在线' : '离线'}
                    </span>
                </div>
                <div className="preview-row">
                    <span className="preview-row__label">数据源</span>
                    <span className="preview-row__value">
                        window online / offline
                    </span>
                </div>
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

            <div className="field field--spaced">
                <label className="check">
                    <input
                        type="checkbox"
                        checked={showTestnet}
                        onChange={(event) => onToggleTestnet(event.target.checked)}
                    />
                    显示测试网卡片
                </label>
            </div>

            <p className="control-note">
                取消勾选会卸载测试网卡片，它的 state 与定时器随之清理；重新勾选后
                高度从初始值重新开始，说明 state 属于每次 Hook 调用，不是全局共享。
            </p>
        </section>
    )
}

function BlockTicker({ network, start, initialInterval }) {
    const [speed, setSpeed] = useState(initialInterval)
    const height = useBlockHeight(start, speed)

    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">HOOK · INTERVAL</p>
                    <h2>{network}区块</h2>
                </div>
                <span className="board-count">每 {speed / 1000} 秒 +1</span>
            </header>

            <p className="block-height">{height.toLocaleString()}</p>

            <label className="field field--spaced">
                <span className="field__label">出块间隔</span>
                <select
                    className="select"
                    value={speed}
                    onChange={(event) => setSpeed(Number(event.target.value))}
                >
                    <option value={1000}>1 秒</option>
                    <option value={2000}>2 秒</option>
                    <option value={4000}>4 秒</option>
                </select>
            </label>

            <p className="control-note">
                高度由 useBlockHeight 提供，起点 {start.toLocaleString()}。
                切换间隔时旧定时器必须被清理，否则计数会翻倍。
            </p>
        </section>
    )
}

function AddressSearch() {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebouncedValue(query, 400)

    const keyword = debouncedQuery.trim().toLowerCase()
    const results = keyword
        ? ADDRESSES.filter(
            (item) =>
                item.label.toLowerCase().includes(keyword) ||
                item.address.toLowerCase().includes(keyword),
        )
        : ADDRESSES

    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">HOOK · DEBOUNCE</p>
                    <h2>地址搜索</h2>
                </div>
                <span className="board-count">{results.length} 条结果</span>
            </header>

            <label className="field field--spaced">
                <span className="field__label">关键词（标签或地址）</span>
                <input
                    className="input"
                    value={query}
                    placeholder="试试输入 uniswap 或 0x"
                    onChange={(event) => setQuery(event.target.value)}
                />
            </label>

            <div className="preview-rows">
                <div className="preview-row">
                    <span className="preview-row__label">输入值</span>
                    <span className="preview-row__value">{query || '—'}</span>
                </div>
                <div className="preview-row">
                    <span className="preview-row__label">生效值（防抖后）</span>
                    <span className="preview-row__value">
                        {debouncedQuery || '—'}
                    </span>
                </div>
            </div>

            {results.length > 0 ? (
                <ul className="tx-list">
                    {results.map((item) => (
                        <li key={item.address} className="tx">
                            <span className="tx__id">{item.label}</span>
                            <span className="tx__type">{item.address}</span>
                            <span className="tx__amount">{item.balance}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="empty-inline">没有匹配的地址，换个关键词试试。</p>
            )}

            <p className="control-note">
                结果基于 useDebouncedValue(query, 400) 计算，停止输入 400ms 后
                才会更新。数据是固定演示数据，不代表真实余额。
            </p>
        </section>
    )
}

export default function Lesson08Exercise() {
    const [showTestnet, setShowTestnet] = useState(true)

    return (
        <div className="stack">
            <ControlPanel
                showTestnet={showTestnet}
                onToggleTestnet={setShowTestnet}
            />
            <BlockTicker
                network="主网"
                start={MAINNET_START}
                initialInterval={1000}
            />
            {showTestnet && (
                <BlockTicker
                    network="测试网"
                    start={TESTNET_START}
                    initialInterval={2000}
                />
            )}
            <AddressSearch />
        </div>
    )
}
