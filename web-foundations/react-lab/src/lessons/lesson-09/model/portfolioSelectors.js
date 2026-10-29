// 派生数据不放进 reducer state 里，每次渲染时用当前 state 计算。
// 契约见 lesson-09/README.md 第 4.3 与 5.1 节。

export function selectActiveAssets(state) {
    return state.assetsByNetwork[state.activeNetwork] ?? []
}

// TODO(M1): 计算 total / changeValue / changePercent / count / watched
export function selectSummary(assets) {

    const total = assets.reduce(
        (sum, asset) => sum + asset.balance * asset.price,
        0,
    )
    const changeValue = assets.reduce(
        (sum, asset) => sum + asset.balance * asset.price * (asset.change24h / 100),
        0,
    )
    const changePercent =
        total - changeValue !== 0
            ? (changeValue / (total - changeValue)) * 100
            : 0


    return {
        total,
        changeValue,
        changePercent,
        count: assets.length,
        watched: assets.filter((asset) => asset.watched).length,
    }
}

// TODO(M2): 按 query / watchedOnly / sortKey 过滤并排序，返回新数组
export function selectVisibleAssets(assets, filters) {
    return assets
}
