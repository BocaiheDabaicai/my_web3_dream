const assets = [
    {
        id: 'eth',
        symbol: 'ETH',
        name: 'Ethereum',
        balance: 1.24,
        change24h: 3.8,
        favorite: true,
    },
    {
        id: 'sol',
        symbol: 'SOL',
        name: 'Solana',
        balance: 18.5,
        change24h: -2.4,
        favorite: false,
    },
    {
        id: 'arb',
        symbol: 'ARB',
        name: 'Arbitrum',
        balance: 420,
        change24h: 0,
        favorite: true,
    },
]


// ChangeBadge({ change }) → span.change.change--up/down/flat
export function ChangeBadge({change}) {
    const tone = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
    const label = change > 0 ? `+${change}%` : change < 0 ? `${change}%` : '0%'

    return (
        <span className={`change change--${tone}`}>
        {label}
      </span>
    )
}

// EmptyState({ message }) → div.empty-state
export function EmptyState({message}) {
    return <div className="empty-state">
        <p>{message}</p>
    </div>
}

// TokenRow({ token }) → li.token；token: { id, symbol, name, balance, change24h, favorite }
export function TokenRow({token}) {
    return (
        <li className={token.favorite ? "token token--favorite" : "token"}>
            <div className="token__mark">{token.symbol}</div>
            <div className="token__info">
                <div className="token__title">
                    <h3>{token.symbol}</h3>
                    {token.favorite && <span className="token__star">自选</span>}
                </div>
                <p className="muted">{token.name}</p>
            </div>
            <div className="token__numbers">
                <span className="token__balance">{token.balance} {token.symbol}</span>
                <ChangeBadge change={token.change24h}/>
            </div>
        </li>
    )
}

// Watchlist({ title, tokens }) → section.watchlist；空数组时渲染 EmptyState
export function Watchlist({title, tokens}) {
    return (
        <section className="watchlist">
            <header className="watchlist__head">
                <h2>{title}</h2>
                <span className="watchlist__count">{tokens.length} 项</span>
            </header>

            {tokens.length === 0 ? (
                <EmptyState message="没有找到资产。"/>
            ) : (
                <ul className="token-list">
                    {tokens.map((token) => (
                        <TokenRow key={token.id} token={token}/>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default function Lesson02Exercise() {
    return (
        <div className="stack">
            <Watchlist title="全部资产" tokens={assets}/>
            <Watchlist title="自选" tokens={assets.filter(item => item.favorite)}/>
        </div>
    )
}
