import { createContext, useContext, useReducer, useState } from 'react'
import {
  ACCOUNT_ADDRESS,
  INITIAL_ASSETS,
  NETWORKS,
  changeTone,
  formatPercent,
  formatToken,
  formatUsd,
  shortAddress,
} from './data'

const DEMO_NETWORKS = NETWORKS.slice(0, 2)

const demoInitialState = {
  activeNetwork: DEMO_NETWORKS[0].id,
  assetsByNetwork: {
    ethereum: structuredClone(INITIAL_ASSETS.ethereum.slice(0, 3)),
    arbitrum: structuredClone(INITIAL_ASSETS.arbitrum.slice(0, 3)),
  },
}

function demoReducer(state, action) {
  switch (action.type) {
    case 'SWITCH_NETWORK':
      return { ...state, activeNetwork: action.networkId }

    case 'TOGGLE_WATCH': {
      const assets = state.assetsByNetwork[state.activeNetwork]

      return {
        ...state,
        assetsByNetwork: {
          ...state.assetsByNetwork,
          [state.activeNetwork]: assets.map((asset) =>
            asset.id === action.assetId
              ? { ...asset, watched: !asset.watched }
              : asset,
          ),
        },
      }
    }

    case 'SET_PRICES': {
      const priceById = new Map(
        action.updates.map((update) => [update.id, update.price]),
      )
      const nextAssets = {}

      for (const [networkId, assets] of Object.entries(state.assetsByNetwork)) {
        nextAssets[networkId] = assets.map((asset) =>
          priceById.has(asset.id)
            ? { ...asset, price: priceById.get(asset.id) }
            : asset,
        )
      }

      return { ...state, assetsByNetwork: nextAssets }
    }

    default:
      throw new Error(`未知 action: ${action.type}`)
  }
}

const DemoContext = createContext(null)

function DemoProvider({ children }) {
  const [state, dispatch] = useReducer(demoReducer, demoInitialState)

  return (
    <DemoContext.Provider value={{ state, dispatch }}>
      {children}
    </DemoContext.Provider>
  )
}

function useDemo() {
  const context = useContext(DemoContext)

  if (!context) {
    throw new Error('useDemo 必须在 DemoProvider 内使用')
  }

  return context
}

function DemoNetworkTabs() {
  const { state, dispatch } = useDemo()

  return (
    <div className="button-row">
      {DEMO_NETWORKS.map((network) => (
        <button
          key={network.id}
          type="button"
          className={`btn ${
            state.activeNetwork === network.id ? 'btn--primary' : 'btn--ghost'
          }`}
          onClick={() =>
            dispatch({ type: 'SWITCH_NETWORK', networkId: network.id })
          }
        >
          {network.label}
        </button>
      ))}
    </div>
  )
}

function DemoSummary() {
  const { state, dispatch } = useDemo()
  const assets = state.assetsByNetwork[state.activeNetwork]

  const total = assets.reduce(
    (sum, asset) => sum + asset.balance * asset.price,
    0,
  )
  const changeValue = assets.reduce(
    (sum, asset) =>
      sum + asset.balance * asset.price * (asset.change24h / 100),
    0,
  )
  const changePercent =
    total - changeValue !== 0 ? (changeValue / (total - changeValue)) * 100 : 0
  const watched = assets.filter((asset) => asset.watched).length

  const refreshPrices = () => {
    const updates = assets.map((asset) => ({
      id: asset.id,
      price: Number(
        (asset.price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(
          asset.price < 1 ? 4 : 2,
        ),
      ),
    }))

    dispatch({ type: 'SET_PRICES', updates })
  }

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">REDUCER · CONTEXT</p>
          <h2>资产面板切片</h2>
        </div>
        <span className="board-count">{shortAddress(ACCOUNT_ADDRESS)}</span>
      </header>

      <DemoNetworkTabs />

      <p className="counter-value">{formatUsd(total)}</p>

      <div className="preview-rows">
        <div className="preview-row">
          <span className="preview-row__label">24h 盈亏</span>
          <span className={`change change--${changeTone(changePercent)}`}>
            {formatUsd(changeValue)} · {formatPercent(changePercent)}
          </span>
        </div>
        <div className="preview-row">
          <span className="preview-row__label">资产 / 关注</span>
          <span className="preview-row__value">
            {assets.length} 项 · {watched} 项
          </span>
        </div>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={refreshPrices}
        >
          刷新价格
        </button>
      </div>

      <p className="control-note">
        网络、关注和价格都存在 reducer state 里；点击刷新通过 SET_PRICES
        生成新价格。派生值（总额、盈亏）每次渲染时计算，不存进 state。
      </p>
    </section>
  )
}

function DemoAssetList({ query }) {
  const { state, dispatch } = useDemo()
  const assets = state.assetsByNetwork[state.activeNetwork]

  const keyword = query.trim().toLowerCase()
  const visibleAssets = keyword
    ? assets.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(keyword) ||
          asset.name.toLowerCase().includes(keyword),
      )
    : assets

  return (
    <section className="watchlist">
      <header className="watchlist__head">
        <h2>资产列表</h2>
        <span className="watchlist__count">{visibleAssets.length} 项</span>
      </header>

      {visibleAssets.length === 0 ? (
        <p className="empty-state">没有匹配的资产。</p>
      ) : (
        <ul className="token-list">
          {visibleAssets.map((asset) => (
            <li
              key={asset.id}
              className={`token ${asset.watched ? 'token--favorite' : ''}`}
            >
              <span className="token__mark">{asset.symbol.slice(0, 3)}</span>

              <div className="token__info">
                <div className="token__title">
                  <h3>{asset.name}</h3>
                  {asset.watched && (
                    <span className="token__star">已关注</span>
                  )}
                </div>
                <span className="muted">
                  {formatToken(asset.balance, asset.symbol)} ·{' '}
                  {formatUsd(asset.price)}
                </span>
              </div>

              <div className="token__numbers">
                <span className="token__balance">
                  {formatUsd(asset.balance * asset.price)}
                </span>
                <span
                  className={`change change--${changeTone(asset.change24h)}`}
                >
                  {formatPercent(asset.change24h)}
                </span>
              </div>

              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() =>
                  dispatch({ type: 'TOGGLE_WATCH', assetId: asset.id })
                }
              >
                {asset.watched ? '取消关注' : '关注'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function DemoPanel() {
  const [query, setQuery] = useState('')

  return (
    <div className="stack">
      <DemoSummary />

      <section className="control-card">
        <label className="field">
          <span className="field__label">搜索当前网络资产</span>
          <input
            className="input"
            value={query}
            placeholder="ETH / Ether"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className="control-note">
          搜索是组件本地 state，不需要进 reducer；列表只负责根据关键词过滤。
        </p>
      </section>

      <DemoAssetList query={query} />

      <p className="demo-note">
        示例只演示“状态层 + 列表 + 关注”的组合：reducer 管数据，Context
        下发，组件派发 action。练习还会加入总览派生、搜索排序、受控表单、
        “/”聚焦和定时行情。
      </p>
    </div>
  )
}

export default function Lesson09Demo() {
  return (
    <DemoProvider>
      <DemoPanel />
    </DemoProvider>
  )
}
