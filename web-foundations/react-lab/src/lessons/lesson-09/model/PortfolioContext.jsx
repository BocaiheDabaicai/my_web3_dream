import { createContext, useContext, useReducer } from 'react'
import { initialState, portfolioReducer } from './portfolioReducer'

const PortfolioContext = createContext(null)

// Provider 与 usePortfolio 已提供，读一遍即可。
// 本课的状态逻辑集中在 portfolioReducer.js，派生逻辑在 portfolioSelectors.js。
export function PortfolioProvider({ children }) {
    const [state, dispatch] = useReducer(portfolioReducer, initialState)

    return (
        <PortfolioContext.Provider value={{ state, dispatch }}>
            {children}
        </PortfolioContext.Provider>
    )
}

// Provider 与 Hook 同文件是常见写法，该警告只影响 Fast Refresh。
// oxlint-disable-next-line react/only-export-components
export function usePortfolio() {
    const context = useContext(PortfolioContext)

    if (!context) {
        throw new Error('usePortfolio 必须在 PortfolioProvider 内使用')
    }

    return context
}
