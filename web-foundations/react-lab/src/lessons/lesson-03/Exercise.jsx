import {useState} from "react";

const initialChain = {
    block: 18_400_000,
    logs: [],
}


export default function Lesson03Exercise() {
    const [chain, setChain] = useState(initialChain)

    const advance = function (data) {
        setChain((current) => {
            const nextBlock = current.block + data
            return {
                ...current,
                block: nextBlock,
                logs: [{id: nextBlock, text: '区块已确认'}, ...current.logs],
            }
        })
    }
    const advanceThree = function () {
        advance(1)
        advance(1)
        advance(1)
    }
    const clearLogs = function () {
        setChain((current) => {
            return {...current, logs: []}
        })
    }
    const reset = function () {
        setChain(initialChain)
    }

    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">BLOCK PULSE</p>
                    <h2>区块脉冲</h2>
                </div>
                <span className="board-count">{chain.logs.length} 条日志</span>
            </header>

            <p className="block-height">{chain.block}</p>

            <div className="button-row">
                <button type="button" className="btn btn--primary" onClick={() => advance(1)}>
                    出块 +1
                </button>
                <button type="button" className="btn" onClick={advanceThree}>
                    三连出块
                </button>
                <button type="button" className="btn" onClick={clearLogs}>
                    清空日志
                </button>
                <button type="button" className="btn btn--ghost" onClick={reset}>
                    重置
                </button>
            </div>

            <h3 className="log-title">出块记录</h3>

            {chain.logs.length === 0 ? (
                <p className="empty-inline">还没有出块记录。</p>
            ) : (
                <ul className="log-list">
                    {chain.logs.map((log) => (
                        <li key={log.id} className="log-item">
                            <span className="log-item__id">#{log.id}</span>
                            <span>{log.text}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
