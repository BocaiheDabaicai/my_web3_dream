// Lesson 09 综合练习 · 静态链上资产面板
// UI、Context Provider、组件接线已经完成。你需要实现：
// M1 - model/portfolioReducer.js 的四个 action
// M1 - model/portfolioSelectors.js 的 selectSummary
// M2 - model/portfolioSelectors.js 的 selectVisibleAssets
// M2 - 本文件里的“/”聚焦快捷键
// M3 - 本文件里的添加资产表单提交逻辑
// M3 - hooks/usePriceTicker.js 的定时行情
// 契约、里程碑与提示见 lesson-09/README.md。

import { useEffect, useRef, useState } from 'react'
import {
    ACCOUNT_ADDRESS,
    NETWORKS,
    changeTone,
    formatPercent,
    formatToken,
    formatUsd,
    shortAddress,
} from './data'
import { PortfolioProvider, usePortfolio } from './model/PortfolioContext'
import {
    selectActiveAssets,
    selectSummary,
    selectVisibleAssets,
} from './model/portfolioSelectors'
import { usePriceTicker } from './hooks/usePriceTicker'

function NetworkTabs() {
    const { state, dispatch } = usePortfolio()

    return (
        <div className="button-row">
            {NETWORKS.map((network) => (
                <button
                    key={network.id}
                    type="button"
                    className={`btn ${
                        state.activeNetwork === network.id
                            ? 'btn--primary'
                            : 'btn--ghost'
                    }`}
                    onClick={() =>
                        dispatch({
                            type: 'SWITCH_NETWORK',
                            networkId: network.id,
                        })
                    }
                >
                    {network.label}
                </button>
            ))}
        </div>
    )
}

function Overview({ summary, live }) {
    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">PORTFOLIO</p>
                    <h2>资产总览</h2>
                </div>
                <span className="board-count">
                    {live ? '实时行情' : '静态数据'}
                </span>
            </header>

            <NetworkTabs />

            <p className="counter-value">{formatUsd(summary.total)}</p>

            <div className="preview-rows">
                <div className="preview-row">
                    <span className="preview-row__label">24h 盈亏</span>
                    <span
                        className={`change change--${changeTone(
                            summary.changePercent,
                        )}`}
                    >
                        {formatUsd(summary.changeValue)} ·{' '}
                        {formatPercent(summary.changePercent)}
                    </span>
                </div>
                <div className="preview-row">
                    <span className="preview-row__label">资产 / 关注</span>
                    <span className="preview-row__value">
                        {summary.count} 项 · {summary.watched} 项
                    </span>
                </div>
                <div className="preview-row">
                    <span className="preview-row__label">账户</span>
                    <span className="preview-row__value">
                        {shortAddress(ACCOUNT_ADDRESS)}
                    </span>
                </div>
            </div>

            <p className="control-note">
                总额、盈亏和数量都由 selectSummary 从当前网络的资产派生，
                不存进 reducer state。
            </p>
        </section>
    )
}

function Toolbar({
    query,
    onQueryChange,
    sortKey,
    onSortKeyChange,
    watchedOnly,
    onWatchedOnlyChange,
    live,
    onToggleLive,
    searchRef,
}) {
    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">FILTER · SORT</p>
                    <h2>筛选与行情</h2>
                </div>
                <button
                    type="button"
                    className={`btn ${live ? 'btn--primary' : 'btn--ghost'}`}
                    onClick={onToggleLive}
                >
                    {live ? '暂停行情' : '开启实时行情'}
                </button>
            </header>

            <div className="form-grid">
                <label className="field">
                    <span className="field__label">
                        搜索资产（按 / 聚焦）
                    </span>
                    <input
                        ref={searchRef}
                        className="input"
                        value={query}
                        placeholder="ETH / Ether"
                        onChange={(event) => onQueryChange(event.target.value)}
                    />
                </label>

                <label className="field">
                    <span className="field__label">排序</span>
                    <select
                        className="select"
                        value={sortKey}
                        onChange={(event) =>
                            onSortKeyChange(event.target.value)
                        }
                    >
                        <option value="value">按市值</option>
                        <option value="change">按 24h 涨幅</option>
                        <option value="symbol">按名称</option>
                    </select>
                </label>
            </div>

            <div className="field field--spaced">
                <label className="check">
                    <input
                        type="checkbox"
                        checked={watchedOnly}
                        onChange={(event) =>
                            onWatchedOnlyChange(event.target.checked)
                        }
                    />
                    只看关注的资产
                </label>
            </div>

            <p className="control-note">
                开启实时行情后，usePriceTicker 每 4 秒模拟一次价格变化；
                暂停或卸载时必须清理定时器。
            </p>
        </section>
    )
}

function AssetList({ assets, total }) {
    const { dispatch } = usePortfolio()

    return (
        <section className="watchlist">
            <header className="watchlist__head">
                <h2>资产列表</h2>
                <span className="watchlist__count">
                    {assets.length} 项 · 总价值 {formatUsd(total)}
                </span>
            </header>

            {assets.length === 0 ? (
                <p className="empty-state">
                    没有符合条件的资产。
                    <span>换个关键词，或关闭“只看关注”。</span>
                </p>
            ) : (
                <ul className="token-list">
                    {assets.map((asset) => {
                        const value = asset.balance * asset.price
                        const share =
                            total > 0 ? (value / total) * 100 : 0

                        return (
                            <li
                                key={asset.id}
                                className={`token ${
                                    asset.watched ? 'token--favorite' : ''
                                }`}
                            >
                                <span className="token__mark">
                                    {asset.symbol.slice(0, 3)}
                                </span>

                                <div className="token__info">
                                    <div className="token__title">
                                        <h3>{asset.name}</h3>
                                        {asset.watched && (
                                            <span className="token__star">
                                                已关注
                                            </span>
                                        )}
                                    </div>
                                    <span className="muted">
                                        {formatToken(
                                            asset.balance,
                                            asset.symbol,
                                        )}{' '}
                                        · {formatUsd(asset.price)} · 占{' '}
                                        {share.toFixed(1)}%
                                    </span>
                                </div>

                                <div className="token__numbers">
                                    <span className="token__balance">
                                        {formatUsd(value)}
                                    </span>
                                    <span
                                        className={`change change--${changeTone(
                                            asset.change24h,
                                        )}`}
                                    >
                                        {formatPercent(asset.change24h)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn--sm btn--ghost"
                                    onClick={() =>
                                        dispatch({
                                            type: 'TOGGLE_WATCH',
                                            assetId: asset.id,
                                        })
                                    }
                                >
                                    {asset.watched ? '取消关注' : '关注'}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

function AddAssetForm() {
    const { state, dispatch } = usePortfolio()
    const [form, setForm] = useState({
        symbol: '',
        name: '',
        balance: '',
        price: '',
    })
    const [error, setError] = useState('')

    const networkLabel =
        NETWORKS.find((network) => network.id === state.activeNetwork)?.label ??
        state.activeNetwork

    const handleChange = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setError('')
        // TODO(M3): 校验表单；通过后 dispatch ADD_ASSET 并重置表单。
        // 规则见 README 第 5.3 节。
    }

    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">CONTROLLED FORM</p>
                    <h2>添加资产</h2>
                </div>
                <span className="board-count">当前网络：{networkLabel}</span>
            </header>

            <form className="tx-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <label className="field">
                        <span className="field__label">Symbol</span>
                        <input
                            className="input"
                            value={form.symbol}
                            placeholder="ETH"
                            onChange={handleChange('symbol')}
                        />
                    </label>

                    <label className="field">
                        <span className="field__label">名称</span>
                        <input
                            className="input"
                            value={form.name}
                            placeholder="Ether"
                            onChange={handleChange('name')}
                        />
                    </label>

                    <label className="field">
                        <span className="field__label">数量</span>
                        <input
                            className="input"
                            inputMode="decimal"
                            value={form.balance}
                            placeholder="1.5"
                            onChange={handleChange('balance')}
                        />
                    </label>

                    <label className="field">
                        <span className="field__label">价格（USD）</span>
                        <input
                            className="input"
                            inputMode="decimal"
                            value={form.price}
                            placeholder="3200"
                            onChange={handleChange('price')}
                        />
                    </label>
                </div>

                {error && <p className="notice notice--error">{error}</p>}

                <div className="form-actions">
                    <button type="submit" className="btn btn--primary">
                        添加资产
                    </button>
                </div>
            </form>

            <p className="control-note">
                表单是受控组件。提交后 dispatch ADD_ASSET，资产会加入当前网络；
                新资产默认出现在关注视图里。
            </p>
        </section>
    )
}

function PortfolioPanel() {
    const { state, dispatch } = usePortfolio()
    const [query, setQuery] = useState('')
    const [sortKey, setSortKey] = useState('value')
    const [watchedOnly, setWatchedOnly] = useState(false)
    const [live, setLive] = useState(false)
    const searchRef = useRef(null)

    const assets = selectActiveAssets(state)
    const summary = selectSummary(assets)
    const visibleAssets = selectVisibleAssets(assets, {
        query,
        watchedOnly,
        sortKey,
    })

    usePriceTicker({
        assets,
        enabled: live,
        interval: 4000,
        onPrices: (updates) => dispatch({ type: 'SET_PRICES', updates }),
    })

    useEffect(() => {
        // TODO(M2): 监听 window keydown；按 "/" 时聚焦 searchRef.current。
        // 在输入框、select、textarea 或可编辑区域里输入时不要抢焦点。
        // 返回 cleanup 移除监听。
    }, [])

    return (
        <div className="stack">
            <Overview summary={summary} live={live} />
            <Toolbar
                query={query}
                onQueryChange={setQuery}
                sortKey={sortKey}
                onSortKeyChange={setSortKey}
                watchedOnly={watchedOnly}
                onWatchedOnlyChange={setWatchedOnly}
                live={live}
                onToggleLive={() => setLive((current) => !current)}
                searchRef={searchRef}
            />
            <AssetList assets={visibleAssets} total={summary.total} />
            <AddAssetForm />
        </div>
    )
}

export default function Lesson09Exercise() {
    return (
        <PortfolioProvider>
            <PortfolioPanel />
        </PortfolioProvider>
    )
}
