# Lesson 05 · useReducer 与 Context

> 对应 React 官方文档：
> [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) ·
> [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) ·
> [useReducer](https://react.dev/reference/react/useReducer) ·
> [useContext](https://react.dev/reference/react/useContext) ·
> [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)

## 一句话

`useReducer` 把散落在事件处理器里的状态变化收进一个纯函数；Context 把共享数据和 `dispatch` 送到深层组件，省掉逐层传 props。

## 本课目标

- 理解什么时候该从 `useState` 换成 `useReducer`。
- 会写 `reducer(state, action)` 和 `dispatch(action)`。
- 理解 action 描述“发生了什么”，reducer 决定“状态怎么变”。
- 会创建 Context、Provider，并用 `useContext` 读取。
- 会把 `useReducer` 和 Context 组合起来，做一个局部的状态容器。
- 知道 Context 不是状态本身，也不是全局 store 的替代品。

## 1. 为什么需要 useReducer

`useState` 适合简单、独立的状态：一个开关、一个计数器、一个输入框。组件状态变复杂后，会出现这些信号：

- 多个事件处理器都在改同一份 state。
- 下一个状态依赖上一个状态的多个字段。
- state 有多个子字段，更新逻辑散落在各处。
- 想单独测试状态变化逻辑。

例如交易池：

```jsx
const [txs, setTxs] = useState([])
const [nextId, setNextId] = useState(1)
```

添加、确认、删除、重置会分散在四个处理器里，并且每个都要同时考虑 `txs` 和 `nextId`。逻辑越多，越容易漏掉某个字段。把这些规则收进一个 reducer，状态变化会集中、可读、可测试。

| | `useState` | `useReducer` |
| --- | --- | --- |
| 适合 | 简单、独立的状态 | 复杂对象、多个相关更新 |
| 更新方式 | 直接给新值 | `dispatch` 一个 action |
| 逻辑位置 | 散在事件处理器里 | 集中在 reducer 函数里 |
| 可测试性 | 依赖组件 | reducer 是纯函数，可直接测试 |
| 代价 | 结构简单 | 多一层 action / reducer 概念 |

不要为了“看起来高级”把所有 state 都换成 `useReducer`。简单状态用 `useState` 更直接。

## 2. reducer 与 action

### 2.1 形状

```js
function reducer(state, action) {
  // 根据 action 返回新的 state
}
```

- `state`：当前状态。
- `action`：描述发生了什么的对象，通常有 `type`，可以带其他字段。
- 返回值：**新的 state**，不是修改旧的。

```jsx
const action = { type: 'added', txType: 'Transfer', amount: 1 }

function txReducer(state, action) {
  switch (action.type) {
    case 'added':
      return {
        ...state,
        txs: [
          ...state.txs,
          {
            id: state.nextId,
            type: action.txType,
            amount: action.amount,
            status: 'pending',
          },
        ],
        nextId: state.nextId + 1,
      }

    case 'confirmed':
      return {
        ...state,
        txs: state.txs.map((tx) =>
          tx.id === action.id ? { ...tx, status: 'confirmed' } : tx,
        ),
      }

    case 'removed':
      return {
        ...state,
        txs: state.txs.filter((tx) => tx.id !== action.id),
      }

    case 'reset':
      return initialTxState

    default:
      throw new Error(`未知 action: ${action.type}`)
  }
}
```

### 2.2 action 描述“发生了什么”

action 的 `type` 用业务语言，而不是 setter 语言：

```js
{ type: 'added', txType: 'Transfer', amount: 1 }  // 好
{ type: 'setTxs', txs: [...] }                    // 差：把结果也算好了
```

让 reducer 决定新状态，组件只负责“用户做了什么”。这样同一个 action 可以从不同组件发出，状态逻辑仍然只有一份。

### 2.3 reducer 必须是纯函数

规则和前面学过的一样：

- 不修改 `state` 和 `action`。
- 不发请求、不写 localStorage、不启动定时器。
- 不调用 `dispatch`。
- 同样的 `(state, action)` 永远返回同样的新状态。

开发环境的 StrictMode 会故意把 reducer 调用两次来检查纯度；不纯的 reducer 很容易在这里暴露问题。

### 2.4 用 `switch` + `default` 报错

`switch` 可读性最好；`default` 直接抛错，能尽早发现拼错的 `action.type`，而不是悄悄返回 `undefined` 把界面弄崩。

## 3. useReducer 基本用法

```jsx
import { useReducer } from 'react'

const [state, dispatch] = useReducer(txReducer, initialTxState)

dispatch({ type: 'added', txType: 'Transfer', amount: 1 })
```

- 返回值和 `useState` 一样是数组：当前 state 和更新函数。
- `dispatch` 不直接改 state，而是把 action 交给 reducer。
- 多次 `dispatch` 仍然会批处理：同一事件里发出的多个 action 按顺序进入队列，React 依次用 reducer 计算，最后渲染一次。
- `dispatch` 的引用在多次渲染之间稳定，之后讲 `useEffect` 时会用到这一点。

一次点击的流程：

```text
用户点击
  → 事件处理器 dispatch(action)
  → action 进入更新队列
  → React 读取当前 state，调用 reducer(state, action)
  → 得到新 state
  → 重新渲染
```

### 3.1 初始值较复杂时用初始化函数

```jsx
function createInitialState() {
  return { txs: [], nextId: 1 }
}

const [state, dispatch] = useReducer(txReducer, undefined, createInitialState)
```

第三个参数是初始化函数，适合需要计算或从 props 构造初始值的场景。本课先用固定对象即可。

## 4. Context：跨层传递数据

### 4.1 prop drilling 问题

```text
Lesson05Exercise（state、dispatch）
  └─ TxList（只负责布局）
       └─ TxRow（真正需要 dispatch）
```

如果只有最里层需要 dispatch，中间每一层都得接收并原样传下去：

```jsx
<TxList dispatch={dispatch} />
  <TxRow dispatch={dispatch} />
```

层级一深，组件就被“数据管道”污染了。Context 让深层组件直接读取数据，不用经过中间层。

### 4.2 三个 API

```jsx
import { createContext, useContext } from 'react'

const TxContext = createContext(null)

function Lesson05Exercise() {
  const [state, dispatch] = useReducer(txReducer, initialTxState)

  return (
    <TxContext.Provider value={{ state, dispatch }}>
      <TxToolbar />
      <TxList />
      <TxSummary />
    </TxContext.Provider>
  )
}
```

子组件：

```jsx
function TxToolbar() {
  const { state, dispatch } = useContext(TxContext)
  // ...
}
```

- `createContext(defaultValue)`：创建一个 Context 对象。
- `<Context.Provider value={...}>`：给子树提供值，必须在消费者上方。
- `useContext(Context)`：读取最近一层 Provider 的值；没有 Provider 时返回 default value。

### 4.3 Context 不是状态

Context 只是**传递数据的方式**，它自己不会保存、更新状态。状态仍然放在 `useState` / `useReducer` 里，通常由 Provider 所在组件持有。

```text
useReducer 负责“状态怎么变”
Context 负责“状态怎么送到深层组件”
```

两者组合起来，才是一个小型的局部状态容器。

### 4.4 自定义 Hook 包一层

直接 `useContext` 的问题是：Provider 忘了包、组件放错位置时，得到的是 `null`，报错信息不直观。常见做法是包一个 Hook：

```jsx
function useTx() {
  const context = useContext(TxContext)

  if (!context) {
    throw new Error('useTx 必须在 Lesson05Exercise 的 Provider 内使用')
  }

  return context
}
```

注意：默认值适合“有意义的默认行为”；如果默认值 `null` 只是为了占位，就应该像上面这样主动报错，避免错误被默认值掩盖。

### 4.5 Provider 的 value 变化会通知消费者

```jsx
<TxContext.Provider value={{ state, dispatch }}>
```

每次 Provider 重新渲染，这个对象字面量都是新的引用，所有消费者都会收到新值并重新渲染。对本课的规模完全没问题。后续需要优化时，可以考虑拆分 state/dispatch 两个 Context，或用 `useMemo` 稳定 value；现在不要提前优化。

### 4.6 不要把所有东西都塞进 Context

只有**多层组件共享**的数据才值得放进 Context。一个组件自己的输入框状态、开关状态，继续用 `useState` 放在本地。Context 放得越广，组件越难复用，更新影响面也越大。

## 5. useReducer + Context 组合

```text
Lesson05Exercise
├─ useReducer(txReducer, initialTxState)
├─ <TxContext.Provider value={{ state, dispatch }}>
│    ├─ TxToolbar   → useTx() 读 state，dispatch({ type: 'added' })
│    ├─ TxList      → useTx() 读 state
│    │    └─ TxRow  → useTx() 取 dispatch({ type: 'confirmed' / 'removed' })
│    └─ TxSummary   → useTx() 读出 state 计算统计
```

- state 和 dispatch 都集中在一处。
- 子组件不需要接收 `state` / `dispatch` props，只拿自己需要的局部数据（例如 `TxRow` 的 `tx`）。
- 状态变化路径统一：组件 dispatch → reducer 计算 → Provider 重新渲染 → 消费者拿到新值。

这就是 React 官方文档里的“Reducer + Context”模式。它适合中小型局部状态；再大就需要专门的 store 方案，但核心思想仍然相同。

## 6. 与 Vue 对照

| Vue | React |
| --- | --- |
| `provide` / `inject` | `Context.Provider` / `useContext` |
| Vuex / Pinia 的 state | `useReducer` 返回的 state |
| `commit` / action 分发 | `dispatch(action)` |
| store 里的 mutation / reducer | `reducer(state, action)` |
| `reactive` 深层响应式 | 不可变更新，返回新对象 |
| 全局 store | Context + reducer（本课是局部模式，不是全局 store） |

`useReducer` + Context 很像一个只作用于子树的小型 store，但它没有插件、调试工具和持久化；它的优势是简单、显式、和 React 本身一致。

## 7. 练习任务卡

### 背景

做一个“交易池管理器”：工具箱、交易队列、统计面板三个区域共享同一份交易状态。状态由父组件的 `useReducer` 管理，通过 Context 提供给所有子组件，不逐层传 props。

### 初始状态

在 `Exercise.jsx` 中定义：

```js
const initialTxState = {
  txs: [
    { id: 1, type: 'Transfer', amount: 0.5, status: 'pending' },
    { id: 2, type: 'Approve', amount: 120, status: 'confirmed' },
    { id: 3, type: 'Swap', amount: 2, status: 'pending' },
  ],
  nextId: 4,
}
```

### reducer 契约

实现 `txReducer(state, action)`：

**added**

```text
action: { type: 'added', txType: string, amount: number }

- 新交易：{ id: state.nextId, type: action.txType, amount: action.amount, status: 'pending' }
- 追加到 txs 末尾
- nextId + 1
- 返回新的 state 对象，不修改 current
```

**confirmed**

```text
action: { type: 'confirmed', id: number }

- 找到 id 对应的交易，把 status 改成 'confirmed'
- 其余交易保持原对象
- 返回新的 state 对象
```

**removed**

```text
action: { type: 'removed', id: number }

- 从 txs 中删除 id 对应的交易
- 返回新的 state 对象
```

**reset**

```text
action: { type: 'reset' }

- 回到 initialTxState
```

**default**

- 抛出错误：`未知 action: ${action.type}`

### Context 契约

- 使用 `createContext(null)` 创建 `TxContext`。
- `useTx()` 读取 context；如果为 `null`，抛出错误：`useTx 必须在 Lesson05Exercise 的 Provider 内使用`。
- `Lesson05Exercise` 用 `useReducer(txReducer, initialTxState)` 创建 state 和 dispatch，并通过 `<TxContext.Provider value={{ state, dispatch }}>` 提供给子树。
- 子组件通过 `useTx()` 读取，不接收 `state` / `dispatch` props。

### 组件契约

**TxToolbar**

```text
useTx() 读取 state

section.control-card
  header.control-card__head
    div
      p.board-kicker        ← "TX POOL"
      h2                    ← "交易池"
    span.board-count        ← `${pendingCount} 待确认`
  div.button-row
    button.btn.btn--primary ← "添加交易"
         dispatch({ type: 'added', txType: 'Transfer', amount: 1 })
    button.btn.btn--ghost   ← "重置"
         dispatch({ type: 'reset' })
  p.control-note
```

**TxList**

```text
useTx() 读取 state

section.control-card
  header.control-card__head
    div
      p.board-kicker        ← "QUEUE"
      h2                    ← "交易队列"
    span.board-count        ← `${state.txs.length} 笔`
  txs.length === 0
    ? p.empty-inline        ← "交易池是空的，添加一笔交易试试。"
    : ul.tx-list
        txs.map(tx => TxRow key={tx.id} tx={tx})
```

**TxRow**

```text
TxRow({ tx })
useTx() 读取 dispatch

li.tx（已确认时追加 tx--done）
  span.tx__id       ← `#${tx.id}`
  span.tx__type     ← tx.type
  span.tx__amount   ← tx.amount
  span.status.status--done / status--active ← "已确认" / "待确认"
  div.tx__actions
    button.btn.btn--sm ← "确认"
         disabled={isConfirmed}
         dispatch({ type: 'confirmed', id: tx.id })
    button.btn.btn--sm.btn--ghost ← "删除"
         dispatch({ type: 'removed', id: tx.id })
```

**TxSummary**

```text
useTx() 读取 state

section.control-card
  header.control-card__head
    div
      p.board-kicker        ← "DERIVED"
      h2                    ← "交易统计"
  div.preview-rows
    StatRow("待确认", `${pendingCount} 笔`)
    StatRow("已确认", `${confirmedCount} 笔`)
    StatRow("待确认金额", pendingAmount.toFixed(2))
```

`StatRow({ label, value })` 的结构：

```text
div.preview-row
  ├─ span.preview-row__label ← label
  └─ span.preview-row__value ← value
```

### 页面结构

```text
div.stack
├─ TxToolbar
├─ TxList
└─ TxSummary
```

> 界面结构、Context 对象、`useTx()`、`useReducer` 和只读展示已经准备好。你只需要：实现 reducer，在工具栏和交易行里接上 `dispatch`。

### 验收标准

- [ ] 初始显示 3 笔交易，待确认 2 笔，已确认 1 笔，待确认金额 2.50。
- [ ] 点“添加交易”：新增第 4 笔 Transfer、金额 1、状态待确认；再点一次 id 为 5。
- [ ] 点某一行的“确认”：状态变为已确认，确认按钮禁用，统计同步变化。
- [ ] 点“删除”：该行消失，统计同步变化。
- [ ] 点“重置”：回到初始 3 笔交易，`nextId` 回到 4。
- [ ] 所有状态变化都经过 reducer；reducer 内没有修改 `state` / `action`，没有副作用。
- [ ] 子组件没有接收 `state` / `dispatch` props；通过 `useTx()` 读取。
- [ ] `default` 分支对未知 action 抛出错误。
- [ ] 浏览器控制台无报错，`npm run lint` 和 `npm run build` 通过。

### 分级提示

<details>
<summary>提示 1 · 概念</summary>

- reducer 就是 `switch (action.type)`；每个 case 返回新的 state 对象。
- `added` 用 `nextId` 生成 id，然后把 `nextId + 1`。
- `confirmed` 用 `map`；`removed` 用 `filter`；`reset` 返回 `initialTxState`。
- `useReducer` 的返回值是 `[state, dispatch]`，把两者放进 Provider 的 value。
- 子组件里 `const { dispatch } = useTx()`，点击时 dispatch 一个 action 对象。

</details>

<details>
<summary>提示 2 · 结构</summary>

1. 先写 `txReducer` 的四个 case 和 default。
2. `TxToolbar` 里从 `useTx()` 取出 `dispatch`，接上添加和重置按钮。
3. `TxRow` 里调用 `useTx()` 取出 `dispatch`，接上确认和删除按钮。
4. 依次验证添加、确认、删除、重置和统计数字。

</details>

<details>
<summary>提示 3 · 局部示例</summary>

`confirmed` case 的参考实现如下，其余 case 自己完成：

```jsx
case 'confirmed':
  return {
    ...state,
    txs: state.txs.map((tx) =>
      tx.id === action.id ? { ...tx, status: 'confirmed' } : tx,
    ),
  }
```

dispatch 的形状：

```jsx
dispatch({ type: 'confirmed', id: tx.id })
```

</details>

### 完成后

保存文件，回到对话告诉我“第五课完成”。我会检查 reducer 的纯度、action 形状、Context 接线和是否有 prop drilling，通过后进入第六课：`useEffect`。

## 8. 自查问题

<details>
<summary>1. 什么时候应该从 useState 换成 useReducer？</summary>

当状态更新逻辑复杂、多个事件处理器修改同一份状态、下一个状态依赖多个字段，或者你希望单独测试状态变化逻辑时。简单的独立状态继续用 useState；useReducer 不是“更高级”的替代品。

</details>

<details>
<summary>2. 为什么 reducer 必须是纯函数？</summary>

React 可能在开发环境重复调用 reducer 来检查纯度；它也可能在并发渲染中多次重放。如果 reducer 里有请求、写存储、随机数或修改参数，状态结果就不可预测。reducer 只能根据 state 和 action 计算新 state。

</details>

<details>
<summary>3. 为什么 action 用“发生了什么”，而不是“把 state 改成什么”？</summary>

action 是业务事件，reducer 是状态变化的唯一入口。组件只表达用户做了什么，具体如何更新由 reducer 集中决定；这样同一类操作可以从多个地方发出，逻辑不会分散。

</details>

<details>
<summary>4. Context 能替代 useReducer 或状态管理库吗？</summary>

不能。Context 只负责把值传给子树，本身不保存也不更新状态。状态仍需要 useState/useReducer；Context 只是让深层组件不用逐层接收 props。它也没有持久化、调试工具和跨页面能力。

</details>

<details>
<summary>5. 为什么 Provider 的 value 每次渲染都是新对象时，消费者会重新渲染？</summary>

Context 用引用比较判断值是否变化。`value={{ state, dispatch }}` 每次都会创建一个新对象，所以所有消费者都会收到通知。当前规模没有问题；需要优化时再拆分 Context 或稳定 value。

</details>
