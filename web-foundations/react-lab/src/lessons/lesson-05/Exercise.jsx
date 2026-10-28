// Lesson 05 练习 · 交易池
// 界面、Context 管道和 useReducer 已经接好。你需要：
// 1. 实现 txReducer 的 added / confirmed / removed / reset；
// 2. 在 TxToolbar 和 TxRow 里通过 useTx() 取出 dispatch 并接上操作。
// 契约与提示见 lesson-05/README.md 第 7 节。

import {createContext, useContext, useReducer} from 'react'

const initialTxState = {
    txs: [
        {id: 1, type: 'Transfer', amount: 0.5, status: 'pending'},
        {id: 2, type: 'Approve', amount: 120, status: 'confirmed'},
        {id: 3, type: 'Swap', amount: 2, status: 'pending'},
    ],
    nextId: 4,
}

const TxContext = createContext(null)

function useTx() {
    const context = useContext(TxContext)

    if (!context) {
        throw new Error('useTx 必须在 Lesson05Exercise 的 Provider 内使用')
    }

    return context
}

function txReducer(state, action) {
    // TODO(核心): 用 switch 实现 added / confirmed / removed / reset，
    // default 抛出错误。现在暂时返回原 state，保证界面能渲染。
    switch (action.type) {
        case "added":
            return {
                ...state,
                txs: [
                    ...state.txs,
                    {
                        id: state.nextId,
                        type: action.txType,
                        amount: action.amount,
                        status: 'pending',
                    }
                ],
                nextId: state.nextId + 1,
            }
        case "confirmed":
            return {
                ...state,
                txs: state.txs.map(tx => tx.id === action.id ? {...tx, status: 'confirmed'} : tx),
            }
        case "removed":
            return {
                ...state,
                txs: state.txs.filter(tx => tx.id !== action.id)
            }
        case "reset":
            return initialTxState
        default:
            throw new Error(`Unknown action type: ${action.type}`)
    }
}

function TxToolbar() {
    const {state, dispatch} = useTx()
    // TODO(核心): 从 useTx() 取出 dispatch
    const pendingCount = state.txs.filter(
        (tx) => tx.status === 'pending',
    ).length

    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">TX POOL</p>
                    <h2>交易池</h2>
                </div>
                <span className="board-count">{pendingCount} 待确认</span>
            </header>

            <div className="button-row">
                {/* TODO(核心): dispatch({ type: 'added', txType: 'Transfer', amount: 1 }) */}
                <button type="button" className="btn btn--primary"
                        onClick={() => dispatch({type: 'added', txType: 'Transfer', amount: 1})}>
                    添加交易
                </button>
                {/* TODO(核心): dispatch({ type: 'reset' }) */}
                <button type="button" className="btn btn--ghost" onClick={() => dispatch({type: 'reset'})}>
                    重置
                </button>
            </div>

            <p className="control-note">
                操作只描述发生了什么，具体状态变化由 reducer 决定。
            </p>
        </section>
    )
}

function TxRow({tx}) {
    const isConfirmed = tx.status === 'confirmed'
    const {dispatch} = useTx()

    return (
        <li className={`tx ${isConfirmed ? 'tx--done' : ''}`}>
            <span className="tx__id">#{tx.id}</span>
            <span className="tx__type">{tx.type}</span>
            <span className="tx__amount">{tx.amount}</span>
            <span
                className={`status ${isConfirmed ? 'status--done' : 'status--active'}`}
            >
        {isConfirmed ? '已确认' : '待确认'}
      </span>

            <div className="tx__actions">
                {/* TODO(核心): useTx() 取 dispatch，点击时 dispatch confirmed */}
                <button type="button" className="btn btn--sm" disabled={isConfirmed}
                        onClick={() => dispatch({id: tx.id, type: 'confirmed'})}>
                    确认
                </button>
                {/* TODO(核心): 点击时 dispatch removed */}
                <button type="button" className="btn btn--sm btn--ghost"
                        onClick={() => dispatch({id: tx.id, type: 'removed'})}>
                    删除
                </button>
            </div>
        </li>
    )
}

function TxList() {
    const {state} = useTx()

    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">QUEUE</p>
                    <h2>交易队列</h2>
                </div>
                <span className="board-count">{state.txs.length} 笔</span>
            </header>

            {state.txs.length === 0 ? (
                <p className="empty-inline">交易池是空的，添加一笔交易试试。</p>
            ) : (
                <ul className="tx-list">
                    {state.txs.map((tx) => (
                        <TxRow key={tx.id} tx={tx}/>
                    ))}
                </ul>
            )}
        </section>
    )
}

function StatRow({label, value}) {
    return (
        <div className="preview-row">
            <span className="preview-row__label">{label}</span>
            <span className="preview-row__value">{value}</span>
        </div>
    )
}

function TxSummary() {
    const {state} = useTx()
    const pending = state.txs.filter((tx) => tx.status === 'pending')
    const confirmedCount = state.txs.length - pending.length
    const pendingAmount = pending.reduce((sum, tx) => sum + tx.amount, 0)

    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">DERIVED</p>
                    <h2>交易统计</h2>
                </div>
                <span className="board-count">由 state 计算</span>
            </header>

            <div className="preview-rows">
                <StatRow label="待确认" value={`${pending.length} 笔`}/>
                <StatRow label="已确认" value={`${confirmedCount} 笔`}/>
                <StatRow label="待确认金额" value={pendingAmount.toFixed(2)}/>
            </div>
        </section>
    )
}

export default function Lesson05Exercise() {
    const [state, dispatch] = useReducer(txReducer, initialTxState)


    return (
        <TxContext.Provider value={{state, dispatch}}>
            <div className="stack">
                <TxToolbar/>
                <TxList/>
                <TxSummary/>
            </div>
        </TxContext.Provider>
    )
}
