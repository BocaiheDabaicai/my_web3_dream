import {INITIAL_ASSETS, NETWORKS} from '../data'

export const initialState = {
    activeNetwork: NETWORKS[0].id,
    assetsByNetwork: structuredClone(INITIAL_ASSETS),
}

// TODO(M1): 实现四个 action，契约见 lesson-09/README.md 第 4.1 节。
// 所有更新都必须返回新对象/新数组，不能修改 state。
export function portfolioReducer(state, action) {
    switch (action.type) {
        case 'SWITCH_NETWORK':
            // TODO(M1): 切换 activeNetwork
            return {...state, activeNetwork: action.networkId}

        case 'TOGGLE_WATCH': {
            // TODO(M1): 翻转对应资产的 watched
            const assets = state.assetsByNetwork[state.activeNetwork]

            return {
                ...state,
                assetsByNetwork: {
                    ...state.assetsByNetwork,
                    [state.activeNetwork]: assets.map((asset) => asset.id === action.assetId ? {
                        ...asset, watched: !asset.watched
                    } : asset),
                }
            }
        }


        case 'ADD_ASSET':
            // TODO(M1): 把 action.asset 追加到当前网络
            const assets = state.assetsByNetwork[state.activeNetwork]

            return {
                ...state,
                assetsByNetwork: {
                    ...state.assetsByNetwork,
                    [state.activeNetwork]: [...assets, action.asset]
                }
            }

        case 'SET_PRICES': {

            // TODO(M1): 按 action.updates 中的 id / price 更新价格
            const assets = state.assetsByNetwork[state.activeNetwork]
            const priceById = new Map(action.updates.map((update) => [update.id, update.price]))

            return {
                ...state,
                assetsByNetwork: {
                    ...state.assetsByNetwork,
                    [state.activeNetwork]: assets.map((asset) => priceById.has(asset.id) ? {
                        ...asset,
                        price: priceById.get(asset.id)
                    } : asset),
                }
            }
        }

        default:
            throw new Error(`未知 action: ${action.type}`)
    }
}
