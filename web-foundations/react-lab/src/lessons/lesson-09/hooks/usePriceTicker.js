import { useEffect, useRef } from 'react'

// TODO(M3): 契约见 lesson-09/README.md 第 6 节。
// 目标：enabled 为 true 时，每隔 interval 毫秒生成一批价格更新并调用 onPrices。
export function usePriceTicker({ assets, enabled, interval = 4000, onPrices }) {
    const assetsRef = useRef(assets)
    const onPricesRef = useRef(onPrices)

    useEffect(() => {
        assetsRef.current = assets
        onPricesRef.current = onPrices
    }, [assets, onPrices])

    useEffect(() => {
        // TODO(M3): enabled 为 true 时设置定时器；回调里读 assetsRef.current，
        // 生成 [{ id, price }]，调用 onPricesRef.current(updates)。
        // 返回 cleanup 清除定时器。

        return undefined
    }, [enabled, interval])
}
