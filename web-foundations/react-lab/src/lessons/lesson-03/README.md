# Lesson 03 · 事件处理与 useState

> 对应 React 官方文档：
> [Responding to Events](https://react.dev/learn/responding-to-events) ·
> [State: A Component's Memory](https://react.dev/learn/state-a-components-memory) ·
> [Render and Commit](https://react.dev/learn/render-and-commit) ·
> [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) ·
> [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) ·
> [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) ·
> [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)

## 一句话

事件处理器告诉 React“用户操作时做什么”；`useState` 给组件一份跨渲染保留的记忆。setter 只是请求重新渲染，安全的连续更新要用函数式 updater。

## 本课目标

- 会写事件处理器，分清“传函数”和“调用函数”。
- 会用 `useState` 声明、读取、更新状态。
- 理解状态快照、批处理，以及 updater 为什么存在。
- 会用不可变方式更新 state 里的对象和数组。
- 区分“渲染期间做的事”和“事件处理器里做的事”。

本课仍然不涉及输入框和表单，那部分在下一课。

## 1. 事件处理

### 1.1 传函数，而不是调用函数

```jsx
function handleClick() {
  console.log('clicked')
}

<button onClick={handleClick}>正确</button>
```

`onClick={handleClick}` 传的是函数本身，React 在点击时调用它。

```jsx
<button onClick={handleClick()}>错误</button>
```

`handleClick()` 会在渲染期间立刻执行，然后把返回值交给 `onClick`。这会浪费工作，返回 `undefined` 时点击也没有反应；如果处理函数里更新了 state，还可能引发重复渲染。

### 1.2 需要传参数时，包一层箭头函数

```jsx
<button onClick={() => advance(1)}>出块 +1</button>
```

箭头函数本身是事件处理器，点击时才执行 `advance(1)`。

### 1.3 按钮的默认行为

在表单里，`button` 默认有提交行为。即使现在没有写表单，也建议养成习惯：

```jsx
<button type="button" onClick={...}>
```

### 1.4 事件对象

React 会把浏览器事件对象传给处理器：

```jsx
function handleChange(event) {
  console.log(event.target.value)
}

<input onChange={handleChange} />
```

`event.preventDefault()` 可以阻止表单提交、链接跳转等默认行为，下一课会用到。

### 1.5 哪里可以放副作用

渲染函数必须是纯的；**事件处理器**才是做副作用的地方：

- 更新 state
- 发网络请求
- 写 localStorage
- 启动定时器

事件处理器在 React 的渲染过程之外执行，所以允许这些操作。

## 2. useState：组件的记忆

### 2.1 基本用法

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

`useState(0)` 返回一个数组：

- `count`：本次渲染看到的状态值。
- `setCount`：更新函数。

调用 `setCount` 不会修改当前的 `count` 变量，而是**请求 React 用新状态重新渲染这个组件**。

```jsx
function handleClick() {
  setCount(count + 1)
  console.log(count) // 还是旧值
}
```

### 2.2 为什么普通变量不行

```jsx
let count = 0

function Counter() {
  count = count + 1
  // ...
}
```

组件每次渲染都会重新执行函数，普通变量的修改不会触发渲染，也无法在多次渲染之间保持稳定。state 是 React 专门为组件保留的记忆。

- 每个组件实例有自己的一份 state。
- 组件被卸载（从页面移除）后，这份 state 会被丢掉。

### 2.3 状态是快照

一次渲染对应一份 state 快照。事件处理器里读到的 `count`，就是**产生这次渲染时**的值。

```jsx
function handleClick() {
  setCount(count + 1)
  setCount(count + 1)
  setCount(count + 1)
}
```

三次调用都用同一个 `count`，它们排队的是同一个结果，所以最终只加 1，并只触发一次渲染（批处理）。

### 2.4 updater：函数式更新

如果下一次状态依赖于上一次状态，就传函数：

```jsx
function handleClick() {
  setCount((current) => current + 1)
  setCount((current) => current + 1)
  setCount((current) => current + 1)
}
```

React 会按顺序执行这些函数，把上一个的结果传给下一个，所以最终加 3。

规则：

- 新值可以由当前值算出来：用 `setX(current => ...)`。
- 只是一个固定新值：`setX(newValue)` 就够。
- updater 必须是**纯函数**，不要在内部发请求、写 localStorage 或调用其他 setter。

### 2.5 同一个值会跳过渲染

React 用 `Object.is` 比较新旧值。如果新值和旧值相同，可能会跳过这次渲染。所以不要依赖“每调用一次 setter 就一定渲染一次”。

## 3. 更新对象和数组

state 是只读的。**不要直接修改**：

```jsx
state.name = 'Alice'        // 错
state.items.push(newItem)   // 错
state.items.sort()          // 错
```

要创建新的对象或数组，再传给 setter。

### 3.1 更新对象

```jsx
setUser((current) => ({
  ...current,
  name: 'Alice',
}))
```

嵌套对象要逐层展开：

```jsx
setUser((current) => ({
  ...current,
  profile: {
    ...current.profile,
    city: 'Shanghai',
  },
}))
```

### 3.2 更新数组

```jsx
// 追加到末尾
setItems((current) => [...current, newItem])

// 插入到开头
setItems((current) => [newItem, ...current])

// 修改某一项
setItems((current) =>
  current.map((item) =>
    item.id === targetId ? { ...item, done: true } : item,
  ),
)

// 删除某一项
setItems((current) => current.filter((item) => item.id !== targetId))
```

`map` 和 `filter` 都会返回新数组，适合更新 state。`push`、`splice`、`sort`、`reverse` 会修改原数组，不能直接用在 state 上。

### 3.3 把一起变化的数据放在一个 state 里

区块高度和出块日志必须同步变化，放在同一个对象里更安全：

```jsx
const [chain, setChain] = useState({
  block: 18_400_000,
  logs: [],
})
```

更新时一次性返回新对象：

```jsx
setChain((current) => ({
  ...current,
  block: current.block + 1,
  logs: [{ id: current.block + 1, text: '区块已确认' }, ...current.logs],
}))
```

### 3.4 派生值不要放进 state

如果某个值可以由已有状态算出来，就在渲染时计算：

```jsx
const logCount = chain.logs.length
const pendingCount = txs.filter((tx) => tx.status === 'pending').length
```

不要额外维护一个 `logCount` state，否则很容易忘记同步。

## 4. 点击一次背后发生了什么

```text
用户点击
  → 事件处理器执行
  → 多个 setter 进入更新队列
  → React 批处理，重新渲染组件
  → 用本次渲染的 state 快照生成新 JSX
  → React 提交 DOM 变化
```

事件处理器看到的是**触发这次渲染时的快照**，而不是未来某个时刻的状态。这正是快照陷阱的根源。

## 5. 与 Vue 对照

| Vue | React |
| --- | --- |
| `@click="fn"` | `onClick={fn}` |
| `ref(0)`、`reactive({})` | `useState` |
| `count.value` | `count` |
| 直接改 reactive 数据 | 创建新对象/数组交给 setter |
| `computed` | 渲染期间计算的派生变量 |
| 修改后自动追踪依赖 | React 用新引用触发更新，强调不可变 |

Vue 的响应式会追踪对象属性的修改；React 更接近“替换一份新快照”。这是两边最大的思维差异之一。

## 6. 练习任务卡

### 背景

做一个“区块脉冲”面板：手动推进区块高度，并把每次出块写入日志。

### 初始状态

在 `Lesson03Exercise` 中定义并使用：

```js
const initialChain = {
  block: 18_400_000,
  logs: [],
}
```

state：

```jsx
const [chain, setChain] = useState(initialChain)
```

日志结构：

```js
{ id: number, text: string }
```

### 行为契约

**advance(blocks)**

- 使用 `setChain` 的**函数式更新**。
- 新高度 = 当前高度 + `blocks`。
- 新日志的 `id` 等于新高度，`text` 为固定文案 `区块已确认`。
- 新日志插到数组最前面（最新在上）。
- 返回新的 chain 对象，不能修改 `current`。

**advanceThree()**

- 调用 `advance(1)` 三次。
- 一次点击后：高度 +3，并且新增 3 条日志。

**clearLogs()**

- 清空 `logs`，保持当前 `block` 不变。
- 用函数式更新和对象展开。

**reset()**

- 回到 `initialChain` 的初始状态。

### 页面结构

> `Exercise.jsx` 里的静态结构与 classname 已提前准备好。你只需要：替换占位数据、添加 state、实现四个处理函数、接上按钮的 `onClick`。

```text
section.control-card
├─ header.control-card__head
│  ├─ div
│  │  ├─ p.board-kicker            ← "BLOCK PULSE"
│  │  └─ h2                        ← "区块脉冲"
│  └─ span.board-count             ← `${chain.logs.length} 条日志`
├─ p.block-height                  ← chain.block
├─ div.button-row
│  ├─ button.btn.btn--primary      ← "出块 +1" → advance(1)
│  ├─ button.btn                   ← "三连出块" → advanceThree()
│  ├─ button.btn                   ← "清空日志" → clearLogs()
│  └─ button.btn.btn--ghost        ← "重置" → reset()
├─ h3.log-title                    ← "出块记录"
└─ logs.length === 0
     ? p.empty-inline              ← "还没有出块记录。"
     : ul.log-list
          └─ li.log-item           ← key={log.id}
               ├─ span.log-item__id    ← `#${log.id}`
               └─ span                 ← log.text
```

所有按钮都要写 `type="button"`。

### 验收标准

- [ ] 初始显示高度 18400000，日志为 0，显示空状态。
- [ ] 点击“出块 +1”，高度加 1，新增 1 条日志。
- [ ] 点击“三连出块”，高度一次加 3，新增 3 条日志。
- [ ] 日志按最新在上排列，key 使用 `log.id`。
- [ ] 点击“清空日志”，高度不变，日志清空。
- [ ] 点击“重置”，恢复初始高度和空日志。
- [ ] 更新过程中没有直接修改 state 对象或数组。
- [ ] 没有在 updater 内部调用其他 setter 或执行其他副作用。
- [ ] 浏览器控制台无报错，`npm run build` 通过。

### 分级提示

<details>
<summary>提示 1 · 概念</summary>

- 一个 state 对象同时放 `block` 和 `logs`，避免两次 setState 不一致。
- `setChain(current => ...)` 里的 `current` 永远是最新排队的值。
- 新对象用 `{ ...current, block: ..., logs: ... }`。
- 新日志放前面：`[{ id, text }, ...current.logs]`。
- “三连出块”就是连续调用三次 `advance(1)`。

</details>

<details>
<summary>提示 2 · 结构</summary>

1. 定义 `initialChain`，用 `useState` 接住。
2. 写 `advance(blocks)`，用函数式更新同时算高度和日志。
3. 写 `advanceThree()`，内部调用三次 `advance(1)`。
4. 写 `clearLogs()` 和 `reset()`。
5. 按页面结构写 JSX，先把静态结构摆好，再接按钮和列表。

</details>

<details>
<summary>提示 3 · 局部示例</summary>

`advance` 的参考实现如下，其他处理函数自己完成：

```jsx
function advance(blocks) {
  setChain((current) => {
    const nextBlock = current.block + blocks

    return {
      ...current,
      block: nextBlock,
      logs: [
        { id: nextBlock, text: '区块已确认' },
        ...current.logs,
      ],
    }
  })
}
```

</details>

### 完成后

保存文件，告诉我“第三课完成”。我会检查状态快照、不可变更新和日志顺序，通过后进入第四课：表单、受控组件与状态提升。

## 7. 自查问题

<details>
<summary>1. 为什么连续三次 setChain(chain.block + 1) 最终只加了 1？</summary>

三次调用都读取同一个渲染快照里的 `chain`，排队的是相同的新值；React 批处理后只应用最后一次。应该使用 `setChain(current => ...)`，让每次更新读取最新的排队状态。

</details>

<details>
<summary>2. 为什么不能直接 chain.logs.push(log)？</summary>

`push` 会修改原来的 state 对象，React 可能拿不到新的引用，也无法可靠地判断状态变化。应该创建新数组：`[...chain.logs, log]` 或 `[log, ...chain.logs]`。

</details>

<details>
<summary>3. 为什么 updater 必须是纯函数？</summary>

React 在开发模式下可能重复调用 updater 来检查纯度。如果里面发请求、写存储或调用其他 setter，这些副作用可能执行两次。updater 只负责根据旧状态计算新状态。

</details>
