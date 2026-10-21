import { createContext, useContext, useReducer } from 'react'

const initialSync = {
  status: 'idle',
  height: 18_400_000,
  error: null,
}

const syncStatusLabel = {
  idle: '空闲',
  syncing: '同步中',
  synced: '已同步',
  error: '失败',
}

const syncStatusTone = {
  idle: 'active',
  syncing: 'warn',
  synced: 'done',
  error: 'error',
}

function syncReducer(state, action) {
  switch (action.type) {
    case 'started':
      return { ...state, status: 'syncing', error: null }

    case 'advanced':
      return { ...state, height: state.height + action.blocks }

    case 'finished':
      return { ...state, status: 'synced' }

    case 'failed':
      return { ...state, status: 'error', error: action.message }

    case 'reset':
      return initialSync

    default:
      throw new Error(`未知 action: ${action.type}`)
  }
}

function BlockSyncDemo() {
  const [state, dispatch] = useReducer(syncReducer, initialSync)

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">REDUCER</p>
          <h2>区块同步状态机</h2>
        </div>
        <span className={`status status--${syncStatusTone[state.status]}`}>
          {syncStatusLabel[state.status]}
        </span>
      </header>

      <p className="block-height">{state.height.toLocaleString()}</p>

      {state.error && <p className="notice notice--error">{state.error}</p>}

      <div className="button-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => dispatch({ type: 'started' })}
        >
          开始同步
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => dispatch({ type: 'advanced', blocks: 1 })}
        >
          推进 1 块
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => dispatch({ type: 'finished' })}
        >
          完成
        </button>
        <button
          type="button"
          className="btn"
          onClick={() =>
            dispatch({ type: 'failed', message: 'RPC 节点超时' })
          }
        >
          模拟失败
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => dispatch({ type: 'reset' })}
        >
          重置
        </button>
      </div>

      <p className="control-note">
        组件只负责 dispatch 描述发生了什么，syncReducer 决定状态怎么变。
        action 可以携带数据，例如推进的区块数和失败信息。
      </p>
    </section>
  )
}

const initialWallet = {
  connected: false,
  address: '',
  network: 'Ethereum',
}

const WalletContext = createContext(null)

function walletReducer(state, action) {
  switch (action.type) {
    case 'connected':
      return { ...state, connected: true, address: action.address }

    case 'disconnected':
      return { ...state, connected: false, address: '' }

    case 'networkChanged':
      return { ...state, network: action.network }

    default:
      throw new Error(`未知 action: ${action.type}`)
  }
}

function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(walletReducer, initialWallet)

  return (
    <WalletContext.Provider value={{ state, dispatch }}>
      {children}
    </WalletContext.Provider>
  )
}

function useWallet() {
  const context = useContext(WalletContext)

  if (!context) {
    throw new Error('useWallet 必须在 WalletProvider 内使用')
  }

  return context
}

function WalletStatus() {
  const { state, dispatch } = useWallet()

  return (
    <div className="field">
      <span className="field__label">钱包</span>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() =>
          dispatch(
            state.connected
              ? { type: 'disconnected' }
              : {
                  type: 'connected',
                  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                },
          )
        }
      >
        {state.connected ? '断开连接' : '连接钱包'}
      </button>
      <span className="muted">
        {state.connected ? '已连接' : '未连接'}
      </span>
    </div>
  )
}

function NetworkSelect() {
  const { state, dispatch } = useWallet()

  return (
    <label className="field">
      <span className="field__label">网络</span>
      <select
        className="select"
        value={state.network}
        onChange={(event) =>
          dispatch({ type: 'networkChanged', network: event.target.value })
        }
      >
        <option value="Ethereum">Ethereum</option>
        <option value="Arbitrum">Arbitrum</option>
        <option value="Optimism">Optimism</option>
      </select>
    </label>
  )
}

function PreviewRow({ label, value }) {
  return (
    <div className="preview-row">
      <span className="preview-row__label">{label}</span>
      <span className="preview-row__value">{value}</span>
    </div>
  )
}

function WalletSummary() {
  const { state } = useWallet()

  return (
    <div className="preview-card">
      <h3>钱包快照</h3>
      <div className="preview-rows">
        <PreviewRow label="状态" value={state.connected ? '已连接' : '未连接'} />
        <PreviewRow label="地址" value={state.address || '—'} />
        <PreviewRow label="网络" value={state.network} />
      </div>
    </div>
  )
}

function WalletPanel() {
  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">CONTEXT</p>
          <h2>钱包状态共享</h2>
        </div>
        <span className="board-count">Provider 持有 state</span>
      </header>

      <div className="form-grid">
        <WalletStatus />
        <NetworkSelect />
      </div>

      <WalletSummary />

      <p className="control-note">
        WalletPanel 没有接收任何 props。WalletStatus、NetworkSelect 和
        WalletSummary 都直接通过 useWallet() 读取同一份 state 和 dispatch，
        修改后三个区域一起更新。
      </p>
    </section>
  )
}

function WalletContextDemo() {
  return (
    <WalletProvider>
      <WalletPanel />
    </WalletProvider>
  )
}

export default function Lesson05Demo() {
  return (
    <div className="stack">
      <BlockSyncDemo />
      <WalletContextDemo />

      <p className="demo-note">
        useReducer 把状态变化收进纯函数；Context 把 state 和 dispatch
        送到深层组件。两者组合，就得到一个不需要逐层传 props 的局部状态容器。
      </p>
    </div>
  )
}
