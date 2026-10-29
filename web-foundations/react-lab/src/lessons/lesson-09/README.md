# Lesson 09 · 综合练习：静态链上资产面板

> 对应 React 官方文档：
> [Thinking in React](https://react.dev/learn/thinking-in-react) ·
> [Managing State](https://react.dev/learn/managing-state) ·
> [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) ·
> [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

## 一句话

把前八课拆开的零件组装成一个可交互的资产面板：reducer 管数据，Context 下发，selector 算派生值，自定义 Hook 管外部节奏，组件只负责渲染和 dispatch。

## 本课定位

这是 React 阶段的综合练习，**没有新概念**。目标是检验你能不能把下面这些能力连起来用：

- 组件拆分、props 与组合（01）
- 条件渲染、列表渲染与 key（02）
- useState、函数式更新（03）
- 受控表单、校验、状态提升（04）
- useReducer 与 Context（05）
- useEffect、依赖数组、cleanup（06）
- useRef 与 DOM（07）
- 自定义 Hook（08）

建议按 **M1 → M2 → M3** 三个里程碑完成，每完成一个阶段就回来验收，不要一次写完全部。

## 1. 项目目标

做一个“静态链上资产面板”：

- 在 Ethereum / Arbitrum / Base 之间切换网络；
- 展示当前网络的总价值、24h 盈亏、资产数量和关注数量；
- 资产列表支持搜索、按市值/涨幅/名称排序、只看关注；
- 可以关注/取消关注，状态在切换网络后仍然保留；
- 可以手动添加一个资产（受控表单 + 校验）；
- 按 `/` 快速聚焦搜索框；
- 可选开启“实时行情”，每 4 秒模拟一次价格变化；
- 所有数据来自本地 mock，不请求真实 API。

左侧 Demo 是一个更小的参考切片，只演示“reducer + Context + 列表 + 关注”。你的练习会在此之上加入派生总览、筛选排序、表单、快捷键和定时行情。

## 2. 文件说明

```text
src/lessons/lesson-09/
├── data.js                     # 已提供：网络、初始资产、格式化工具
├── Demo.jsx                    # 已提供：参考切片
├── Exercise.jsx                # 已接线：只改 M2 / M3 的两处 TODO
├── model/
│   ├── portfolioReducer.js     # 你写：四个 action
│   ├── portfolioSelectors.js   # 你写：总览、筛选、排序
│   └── PortfolioContext.jsx    # 已提供：Provider 与 usePortfolio
└── hooks/
    └── usePriceTicker.js       # 你写：定时行情
```

约束：

- 不要修改 `data.js` 里的数据和格式化函数。
- `PortfolioContext.jsx` 已按 Lesson 05 的模式写好，阅读即可。
- `Exercise.jsx` 的界面和事件接线已完成，只补两处标了 TODO 的逻辑。
- 核心状态逻辑放在 `model/`，外部节奏放在 `hooks/`，不要把派生数据塞进 state。

## 3. 数据模型

### 3.1 state 形状

```js
{
  activeNetwork: 'ethereum',
  assetsByNetwork: {
    ethereum: [asset, asset, ...],
    arbitrum: [asset, asset, ...],
    base: [asset, asset, ...],
  },
}
```

`activeNetwork` 是当前网络的 id；`assetsByNetwork` 按网络分组保存资产。切换网络只改 `activeNetwork`，三组资产始终都在 state 里，所以关注状态不会因为切走而丢失。

### 3.2 资产形状

```js
{
  id: 'eth-ETH',      // 全局唯一
  symbol: 'ETH',
  name: 'Ether',
  balance: 12.84,     // 数量
  price: 3421.18,     // 单价（USD）
  change24h: 2.4,     // 24h 涨跌幅，单位 %
  watched: true,      // 是否关注
}
```

价值不是资产字段，而是每次渲染时用 `balance * price` 算出来的**派生数据**。

## 4. 里程碑 M1 · 状态层

目标：让数据真正流动起来——切换网络、关注、添加、改价都能通过 reducer 完成，总览数字由 selector 计算。

### 4.1 portfolioReducer 的四个 action

文件：`model/portfolioReducer.js`

所有分支都必须是**纯函数**：返回新对象/新数组，不修改 `state`、不调用 `Math.random()`、不发请求。

| action type | payload | 行为 |
| --- | --- | --- |
| `SWITCH_NETWORK` | `{ networkId }` | 把 `state.activeNetwork` 设为 `networkId` |
| `TOGGLE_WATCH` | `{ assetId }` | 找到对应资产，翻转它的 `watched` |
| `ADD_ASSET` | `{ asset }` | 把 `action.asset` 追加到当前网络的数组末尾 |
| `SET_PRICES` | `{ updates: [{ id, price }] }` | 按 id 更新价格，其他资产保持不变 |

实现要点：

- `TOGGLE_WATCH` 至少要更新当前网络的数组；不要直接 `assets[index].watched = ...`。
- `ADD_ASSET` 要返回新的数组，不要 `push`。
- `SET_PRICES` 的 `updates` 可能只包含部分资产；没出现在 updates 里的资产保持原对象。
- 其他 action 的资产组、关注状态、价格都必须保留。
- 未知 action 已经在骨架里抛错，保留这个行为。

### 4.2 Context

文件：`model/PortfolioContext.jsx`（已提供）

Provider 内部就是：

```jsx
const [state, dispatch] = useReducer(portfolioReducer, initialState)
```

然后通过 `PortfolioContext.Provider` 下发 `{ state, dispatch }`；`usePortfolio()` 在 Context 缺失时抛出明确错误。组件里只需要 `const { state, dispatch } = usePortfolio()`。

### 4.3 selectSummary

文件：`model/portfolioSelectors.js`

```text
selectSummary(assets) → { total, changeValue, changePercent, count, watched }

total        = Σ(balance * price)
changeValue  = Σ(balance * price * change24h / 100)
changePercent = total - changeValue !== 0
  ? changeValue / (total - changeValue) * 100
  : 0
count        = assets.length
watched      = assets 中 watched === true 的数量
```

这些值每次渲染时计算，**不要**写进 reducer state。

### 4.4 M1 验收

- [ ] 初始网络是 Ethereum；点击 Arbitrum / Base，总览和列表切换，回到 Ethereum 后关注状态与添加的资产仍然存在。
- [ ] Ethereum 初始总价值约为 `$60,246.15`，24h 盈亏约为 `$1,255.04`（`+2.13%`），资产 4 项、关注 2 项。
- [ ] 点击某行的“关注/取消关注”：行高亮切换，总览的关注数变化。
- [ ] 每次操作后没有直接修改原数组/对象；React 能正常重新渲染。
- [ ] 控制台无报错。

M1 完成后可以先停在这里，回来验收后进入 M2。

## 5. 里程碑 M2 · 交互层

目标：搜索、排序、关注过滤、快捷键和添加资产表单全部可用。

### 5.1 selectVisibleAssets

文件：`model/portfolioSelectors.js`

```text
selectVisibleAssets(assets, { query, watchedOnly, sortKey }) → asset[]

1. query 去空格并转小写；为空时不按关键词过滤
2. 关键词匹配 symbol 或 name（包含即可，大小写不敏感）
3. watchedOnly 为 true 时只保留 watched === true 的资产
4. sortKey 决定排序：
   - 'value'  → balance * price 从大到小
   - 'change' → change24h 从大到小
   - 'symbol' → symbol 按字母升序（localeCompare 或 < 比较）
5. 返回新数组，不要原地 sort 传入的 assets
```

过滤和排序都要基于**当前网络的 assets**（`selectActiveAssets(state)`）进行。

### 5.2 “/”聚焦快捷键

文件：`Exercise.jsx` 中 `PortfolioPanel` 的第一个 `useEffect`（TODO M2）

```text
1. useEffect 依赖 []，监听 window 的 'keydown'
2. 只处理 event.key === '/'
3. 如果 event.target 是 input / textarea / select，或 target.isContentEditable 为 true，直接返回
4. event.preventDefault()，然后 searchRef.current?.focus()
5. cleanup 中移除监听
```

不需要在依赖里放 ref 或 setState；它们在整个组件生命周期内稳定。

### 5.3 添加资产表单

文件：`Exercise.jsx` 中 `AddAssetForm.handleSubmit`（TODO M3，但属于 M2 的交互验收）

表单字段已经接好受控 state：`form.symbol`、`form.name`、`form.balance`、`form.price` 都是字符串。

```text
1. event.preventDefault()
2. symbol / name 去空格；symbol 转大写
3. 校验：
   - symbol、name 不能为空
   - balance 是数字且 >= 0
   - price 是数字且 > 0
   - 任一不通过：setError(具体原因)，直接 return，不 dispatch
4. 通过后构造资产：
   {
     id: `custom-${Date.now()}`,
     symbol,
     name,
     balance: Number(...),
     price: Number(...),
     change24h: 0,
     watched: true,
   }
5. dispatch({ type: 'ADD_ASSET', asset })
6. 重置 form 为空字符串，setError('')
```

新资产默认 `watched: true`，所以打开“只看关注”也能看到它。重复 symbol 允许添加；`id` 保证唯一即可。

### 5.4 M2 验收

- [ ] 搜索 `eth` 只剩 ETH（Ether）；搜索 `usd` 只剩 USDC；搜索 `zzz` 显示空状态；清空后恢复全部。
- [ ] 打开“只看关注”后再搜索，两个条件同时生效。
- [ ] 按市值排序：Ethereum 顺序为 ETH → USDC → LINK → ARB。
- [ ] 按 24h 涨幅排序：LINK → ETH → USDC → ARB。
- [ ] 按名称排序：ARB → ETH → LINK → USDC（按 symbol）。
- [ ] 在页面其他位置按 `/`，搜索框获得焦点；在搜索框或表单输入框里按 `/`，正常输入斜杠，不会被抢焦点。
- [ ] 表单空提交、数量为负、价格为 0 或非数字时显示错误且列表不变。
- [ ] 合法提交后：列表新增一行、总览数量 +1、表单清空、当前网络正确；切到别的网络再切回来，新资产还在。
- [ ] 控制台无报错。

## 6. 里程碑 M3 · 行情同步

目标：用自定义 Hook 定时模拟价格变化，理解“ref 保存最新值 + 定时器只依赖开关”的组合。

### 6.1 usePriceTicker 契约

文件：`hooks/usePriceTicker.js`

```text
usePriceTicker({ assets, enabled, interval = 4000, onPrices })

assets   当前网络的资产数组
enabled  是否开启
interval 毫秒
onPrices 收到 updates 的回调
```

行为：

```text
1. 用 useRef 保存最新的 assets 和 onPrices（initial 值分别为传入值）
2. 一个 Effect 依赖 [assets, onPrices]，把最新值写进两个 ref
3. 另一个 Effect 依赖 [enabled, interval]：
   - enabled 为 false：不创建定时器，返回 undefined
   - enabled 为 true：setInterval(interval)
   - 每次触发：
       const updates = assetsRef.current.map((asset) => ({
         id: asset.id,
         price: 新价格,
       }))
       onPricesRef.current(updates)
   - cleanup 返回 clearInterval
```

新价格：在现价基础上加 `±0.5%` 的随机波动，例如：

```js
const drift = (Math.random() - 0.5) * 0.01
const nextPrice = asset.price * (1 + drift)
```

`price >= 1` 保留 2 位小数，`price < 1` 保留 4 位小数，避免把 DEGEN 这种小价格抹掉。

### 6.2 为什么用 ref

如果把 `assets` 或 `onPrices` 放进定时器 Effect 的依赖数组，会出现：

```text
第一个 tick → dispatch SET_PRICES → state 变化 → assets 数组变化
→ Effect 重新执行 → 清除定时器 → 重新建定时器
```

界面看起来还能动，但定时器被反复重建，节奏不稳定，而且每次渲染都重新设置。用 ref 保存“最新的 assets 和回调”，定时器 Effect 只依赖 `[enabled, interval]`，就能稳定运行。

这不是 Lesson 08 的 `useDebouncedValue` 那种“依赖变化就重新计时”的场景，而是“外部节奏不变、读最新数据”的场景。

### 6.3 M3 验收

- [ ] 关闭“实时行情”时，等待 5 秒，价格和总额完全不变。
- [ ] 开启后约 4 秒，价格、总价值和 24h 盈亏发生变化；表格价格与总览同步。
- [ ] 反复开关多次，不会出现速度翻倍（说明 cleanup 生效）。
- [ ] 开启状态下切换网络，下一次 tick 作用于新网络的资产；列表与总览继续更新。
- [ ] 关闭后等待，数字冻结；控制台无报错。
- [ ] 组件卸载时定时器被清理（代码审查确认 cleanup）。
- [ ] `npm run lint` 与 `npm run build` 通过。

## 7. 总验收

- [ ] M1、M2、M3 全部通过。
- [ ] reducer 与 selector 都是纯函数；没有直接修改传入的 state / assets。
- [ ] 派生数据（总额、盈亏、过滤结果）没有存进 state。
- [ ] Hook 只在组件或自定义 Hook 的顶层调用，没有条件调用。
- [ ] 所有 Effect 都有正确的依赖数组和 cleanup。
- [ ] 代码中没有 `document.querySelector` 来操作这些 React 管理的节点。
- [ ] `npm run lint` 和 `npm run build` 通过，浏览器控制台无报错。

## 8. 分级提示

<details>
<summary>提示 1 · 概念</summary>

- reducer 只描述“状态怎么变”，不计算派生值，也不做随机/请求。`Math.random()` 放在 hook 或事件处理器里。
- 不可变更新：用 `map`、展开运算符、`Object.fromEntries`；不要 `push`、不要直接改字段。
- 总额、盈亏、筛选、排序都是渲染时的派生数据；每次渲染重新计算即可，不需要 useMemo。
- 搜索、排序、关注过滤是三个条件的组合；先过滤，再排序。
- 快捷键 Effect 只做“监听 window + 聚焦 ref”，cleanup 移除监听。
- 表单提交前先校验，失败就 `setError` 并 return；成功才 dispatch。
- 定时器 Hook 用 ref 保存最新数据，Effect 依赖只放 `[enabled, interval]`；cleanup 必须 `clearInterval`。

</details>

<details>
<summary>提示 2 · 结构</summary>

reducer：

```js
switch (action.type) {
  case 'SWITCH_NETWORK':
    return { ...state, activeNetwork: action.networkId }

  case 'TOGGLE_WATCH':
    // 取出当前网络数组
    // map 找到 id 匹配的资产，返回新对象 { ...asset, watched: !asset.watched }
    // 返回新的 assetsByNetwork

  case 'ADD_ASSET':
    // 当前网络数组 + action.asset
    // 其他网络原样保留

  case 'SET_PRICES':
    // 把 updates 转成 id → price 的查找表
    // 遍历所有网络，map 替换匹配价格的资产
}
```

selectSummary：

```js
const total = assets.reduce((sum, asset) => sum + asset.balance * asset.price, 0)
const changeValue = assets.reduce(/* 类似，乘 change24h / 100 */, 0)
const changePercent = total - changeValue !== 0
  ? (changeValue / (total - changeValue)) * 100
  : 0
```

selectVisibleAssets：

```js
const keyword = query.trim().toLowerCase()
const visible = assets.filter(/* 关键词 + watchedOnly */)

return [...visible].sort((a, b) => {
  // 根据 sortKey 返回比较结果
})
```

快捷键：

```jsx
useEffect(() => {
  function handleKeyDown(event) {
    // 只处理 '/'
    // 判断 event.target 是否是输入控件
    // preventDefault + searchRef.current?.focus()
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

表单：

```jsx
const symbol = form.symbol.trim().toUpperCase()
const balance = Number(form.balance)
const price = Number(form.price)

if (/* 校验失败 */) {
  setError('...')
  return
}

dispatch({ type: 'ADD_ASSET', asset: { /* ... */ } })
setForm({ symbol: '', name: '', balance: '', price: '' })
setError('')
```

定时器 Hook：

```js
useEffect(() => {
  if (!enabled) return undefined

  const id = setInterval(() => {
    const updates = assetsRef.current.map(/* 生成 { id, price } */)
    onPricesRef.current(updates)
  }, interval)

  return () => clearInterval(id)
}, [enabled, interval])
```

</details>

<details>
<summary>提示 3 · 局部示例</summary>

`TOGGLE_WATCH` 的当前网络 map 骨架：

```js
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
```

`SET_PRICES` 的查找表骨架：

```js
const priceById = new Map(
  action.updates.map((update) => [update.id, update.price]),
)
```

排序比较函数需要覆盖三种 `sortKey`；`value` 要用 `balance * price`，不要用 `price`。

快捷键里判断输入控件：

```js
const tag = event.target.tagName
const isTyping =
  tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' ||
  event.target.isContentEditable
if (isTyping) return
```

表单里的数字校验要单独判断空字符串，因为 `Number('')` 是 `0`：

```js
if (form.balance.trim() === '' || Number.isNaN(balance) || balance < 0) {
  setError('数量必须是大于等于 0 的数字')
  return
}
```

</details>

## 9. 完成后

可以按里程碑汇报：

- “M1 完成”：我检查 reducer 的不可变性、四个 action 和 selectSummary，再让你进入 M2；
- “M2 完成”：我检查筛选排序、快捷键、表单校验与添加流程；
- “M3 完成 / 第九课完成”：我检查定时器依赖、ref 最新值、cleanup，并做完整验收。

## 10. 自查问题

<details>
<summary>1. 为什么 total、盈亏、筛选结果不放进 reducer state？</summary>

它们是当前 state 的派生值，可以随时由 state 算出来。存进 state 会引入冗余，还需要每次资产/价格/网络变化时手动同步，容易出现不一致。React 的推荐做法是渲染时计算派生数据。

</details>

<details>
<summary>2. reducer 为什么必须是纯函数？Math.random 应该放在哪？</summary>

React 可能多次调用 reducer（StrictMode、并发渲染），纯函数保证同样的 state + action 总得到同样结果，便于调试和预测。随机数、时间戳、请求都属于副作用，应放在事件处理器或 Effect 里，再把结果通过 action 传进来。

</details>

<details>
<summary>3. 这个项目为什么用 Context，而不是把 dispatch 一层层传下去？</summary>

网络切换、资产列表、总览、表单都需要同一份 state 和 dispatch，层级较深且多个分支共用。Context 避免中间组件被迫接收并转发 props。若只有一两个子组件，直接 props 更简单。

</details>

<details>
<summary>4. usePriceTicker 为什么用 ref 保存 assets / onPrices？</summary>

如果把它们放进定时器 Effect 的依赖，每次价格更新导致 assets 变化，Effect 都会清理并重建定时器，节奏不稳定。ref 让定时器读取最新值，而 Effect 只依赖 `[enabled, interval]`，保持节奏稳定。

</details>

<details>
<summary>5. 点击“关注”后，数据是怎么流到界面的？</summary>

组件 dispatch TOGGLE_WATCH → reducer 返回新的 state → Provider 重新渲染 → 所有 usePortfolio 的组件拿到新 state → selector 重新计算派生值 → 列表和总览更新。组件不直接修改资产对象。

</details>

<details>
<summary>6. 添加资产后，为什么它默认出现在“只看关注”视图里？</summary>

契约里新资产 `watched: true`。如果你希望新资产默认不关注，可以改成 false，但要考虑用户在关注过滤下看不到新资产是否会困惑。

</details>

<details>
<summary>7. 真实链上数据阶段，这个结构要怎么扩展？</summary>

把 mock 数据换成 API / RPC 请求：用 Effect 拉取资产与价格，用 reducer 管理 loading / error / data；把请求和取消逻辑封装成自定义 Hook（类似后续的 useFetch）。组件和 selector 的结构基本不变。
</details>
