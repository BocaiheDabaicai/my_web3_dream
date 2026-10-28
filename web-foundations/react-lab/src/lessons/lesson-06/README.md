# Lesson 06 · useEffect

> 对应 React 官方文档：
> [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) ·
> [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) ·
> [useEffect](https://react.dev/reference/react/useEffect) ·
> [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)

## 一句话

Effect 用来把组件和 React 之外的系统（定时器、浏览器 API、网络、链上订阅）同步起来；依赖数组决定何时重新同步，cleanup 保证旧的同步被正确撤销。

## 本课目标

- 知道 Effect 解决什么问题，以及什么时候**不该**用 Effect。
- 会写 `useEffect(setup, dependencies)`。
- 理解三种依赖数组形态与执行时机。
- 会写 cleanup，并理解为什么需要它。
- 会处理异步请求的基本竞态。
- 认识 StrictMode 下的双次执行。
- 能把它和 Vue 的 `watch` / `onMounted` / `onUnmounted` 对应起来。

## 1. 为什么需要 useEffect

### 1.1 渲染必须是纯的

React 要求组件函数只根据 props 和 state 计算 JSX。渲染过程中不能：

- 修改 DOM
- 发请求
- 开定时器
- 订阅事件

因为这些操作有副作用，而且组件可能被多次调用（StrictMode、并发渲染），重复执行会出问题。

但真实应用必须和外部世界打交道。React 的解法是：**渲染保持纯净，副作用放到 Effect 里，在渲染提交之后执行。**

### 1.2 Effect 是“同步外部系统”的地方

典型场景：

- 用 `setInterval` 轮询区块高度
- 用 `addEventListener` 监听网络状态、窗口尺寸、钱包事件
- 用 WebSocket / RPC 订阅链上日志
- 请求 API 并把结果写回 state
- 同步 `document.title`

共同点：**React 之外还有一份状态**，Effect 负责让两边保持一致。

### 1.3 什么时候不需要 Effect

Effect 很容易被滥用。以下情况不要用：

| 场景 | 正确做法 |
| --- | --- |
| 由 state 直接算出的值 | 在渲染时计算，不要 `useEffect` + `setState` |
| 用户点击、提交后的逻辑 | 放在事件处理器里 |
| 两个组件共享状态 | 状态提升或 Context |
| 重置一个组件的 state | 用 `key` 让组件重新挂载 |

反例：派生状态

```jsx
// 差：多一次渲染，还容易和源状态不同步
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(firstName + ' ' + lastName)
}, [firstName, lastName])

// 好：渲染时直接算
const fullName = firstName + ' ' + lastName
```

反例：事件逻辑

```jsx
// 差：提交是用户事件，不需要“同步”什么
useEffect(() => {
  if (submitted) {
    post('/api/order', { amount })
  }
}, [submitted])

// 好：放在提交处理器里
function handleSubmit() {
  post('/api/order', { amount })
}
```

一个判断标准：**这段代码是在响应用户动作，还是在让 React 状态与外部系统保持同步？** 前者放事件处理器，后者才放 Effect。

## 2. 基本语法与执行时机

```jsx
import { useEffect } from 'react'

useEffect(() => {
  // setup：建立订阅、启动定时器、发起请求
  return () => {
    // cleanup：撤销 setup 做过的事
  }
}, [dep1, dep2])
```

执行流程：

```text
首次渲染
  → 提交 DOM
  → 浏览器绘制
  → 执行 effect setup

依赖变化后重新渲染
  → 提交 DOM
  → 浏览器绘制
  → 执行上一次的 cleanup
  → 执行新的 setup

组件卸载
  → 执行 cleanup
```

要点：

- Effect 在渲染提交**之后**异步执行，不会阻塞绘制。
- 每次重新渲染后，React 先比较依赖；只有依赖变化才会清理并重新执行。
- 依赖不变化时，Effect 不会重复执行。
- `useEffect` 不是生命周期钩子，它描述的是“如何同步”，不是“在某个时刻做什么”。

### 2.1 不要在 Effect 里直接写 async 函数

```jsx
// 差：async 函数返回 Promise，React 期待返回 cleanup 函数或 undefined
useEffect(async () => {
  const data = await fetchPrice()
  setPrice(data)
}, [])

// 好：在 Effect 内部定义并调用 async 函数
useEffect(() => {
  async function load() {
    const data = await fetchPrice()
    setPrice(data)
  }

  load()
}, [])
```

`useEffect` 的回调必须返回 `undefined` 或一个清理函数；`async` 函数永远返回 Promise，所以不能直接作为回调。

### 2.2 useLayoutEffect 是什么

`useLayoutEffect` 和 `useEffect` 用法相同，但它在浏览器绘制**之前**同步执行，适合测量布局、避免闪烁。绝大多数场景用 `useEffect`；本课不展开。

## 3. 依赖数组

### 3.1 三种写法

| 写法 | 执行时机 | 用途 |
| --- | --- | --- |
| `useEffect(fn)` | 每次渲染后都执行 | 几乎不需要 |
| `useEffect(fn, [])` | 只在挂载后执行一次，卸载时 cleanup | 只建立一次的外部订阅 |
| `useEffect(fn, [a, b])` | 挂载后执行；`a` 或 `b` 变化时重新执行 | 依赖某些 state / props 的同步 |

严格来说，依赖数组为空表示“这个 Effect 没有响应式依赖”，而不是“永远只运行一次”；StrictMode 下它会执行两次，见第 5.5 节。

### 3.2 依赖用 Object.is 比较

React 用 `Object.is` 比较依赖的**引用**，不是深比较。

```jsx
useEffect(() => {
  // ...
}, [options]) // options 每次渲染都是新对象 → 每次渲染都重新执行
```

所以依赖里放对象、数组、函数时，很容易变成“每次渲染都执行”，甚至配合 `setState` 形成无限循环。

### 3.3 依赖要诚实

Effect 里用到的每个响应式值（props、state、组件内定义的变量和函数）都应该出现在依赖数组里。漏掉依赖会产生 **stale closure**：Effect 里读到的是旧值。

```jsx
// 差：count 永远是 0
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1)
  }, 1000)
  return () => clearInterval(id)
}, [])

// 好：用函数式更新，Effect 不需要依赖 count
useEffect(() => {
  const id = setInterval(() => {
    setCount((current) => current + 1)
  }, 1000)
  return () => clearInterval(id)
}, [])
```

函数式更新是处理“下一个状态依赖上一个状态”的标准方式，Lesson 03 已经用过。

### 3.4 无限循环

```jsx
// 差：无依赖 → 每次渲染都执行 → setState → 再渲染 → ...
useEffect(() => {
  setCount(count + 1)
})
```

另一种常见变体：

```jsx
// 差：每次渲染都创建一个新对象，依赖永远“变了”
const options = { network }
useEffect(() => {
  connect(options)
}, [options])
```

修复方向：

- 依赖原始值而不是对象：`[network]`
- 在 Effect 内部创建对象
- 确实需要缓存对象/函数时，再考虑 `useMemo` / `useCallback`（后续课程）
- 需要读取最新值又不想触发重新同步时，React 提供 `useEffectEvent`（进阶，本课不展开）

### 3.5 lint 只能帮你一部分

当前项目启用了 `react/rules-of-hooks`（保证 Hook 调用顺序合法），但没有启用 exhaustive-deps 检查。也就是说：**依赖数组漏了什么，lint 不会提醒你。** 这必须靠你自己按“Effect 里用到了什么”逐个检查。

## 4. 清理函数

### 4.1 为什么必须清理

Effect 的 setup 建立了外部资源，如果重新执行或卸载时不撤销，就会出现：

- 多个定时器同时跑，区块高度一次跳 2、3
- 同一个事件被重复监听，处理函数执行多次
- WebSocket 连接泄漏
- 组件卸载后仍然 `setState`
- 旧请求返回后覆盖新请求的结果

### 4.2 清理时机

cleanup 在两种时机执行：

1. 依赖变化，React 重新执行 setup **之前**
2. 组件卸载时

一个常用的心智模型：

```text
setup 里建立了什么，cleanup 就撤销什么
```

- `setInterval` → `clearInterval`
- `addEventListener` → `removeEventListener`
- `subscribe` → `unsubscribe`
- `new WebSocket` → `socket.close()`
- `fetch` → `AbortController.abort()` 或 ignore 标志

### 4.3 经典模式：定时器

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setHeight((current) => current + 1)
  }, 1000)

  return () => clearInterval(id)
}, [])
```

如果依赖里加了 `speed`，速度变化时 React 会自动先清掉旧定时器，再按新速度建立一个：

```jsx
useEffect(() => {
  if (!isLive) return

  const id = setInterval(() => {
    setHeight((current) => current + 1)
  }, speed)

  return () => clearInterval(id)
}, [isLive, speed])
```

`if (!isLive) return` 表示暂停时不建立定时器；函数隐式返回 `undefined`，React 视为没有 cleanup。

### 4.4 经典模式：事件订阅

```jsx
useEffect(() => {
  function handleOnline() {
    setOnline(true)
  }

  function handleOffline() {
    setOnline(false)
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}, [])
```

注意：`removeEventListener` 必须拿到**同一个函数引用**才能移除。所以在 Effect 内部定义具名函数，setup 和 cleanup 共用它。

### 4.5 不是每个 Effect 都需要 cleanup

例如同步 `document.title`：

```jsx
useEffect(() => {
  document.title = `#${height} · 链上监听台`
}, [height])
```

它没有建立“持续存在的资源”，只是把最新值写进外部系统。组件卸载后标题留在最后的值，通常无害。如果产品要求离开页面时恢复标题，也可以在 cleanup 里恢复：

```jsx
useEffect(() => {
  document.title = `#${height} · 链上监听台`
  return () => {
    document.title = 'Web Foundations · React Lab'
  }
}, [height])
```

但要知道：这个 cleanup 会在每次 `height` 变化前都执行一次。本课练习只要求同步，不要求恢复。

### 4.6 cleanup 读取的是哪一次的值

每次 Effect 执行都有自己的闭包。cleanup 同样捕获**本次 setup** 时的变量值。

```jsx
useEffect(() => {
  const connection = connect(network)
  return () => connection.close() // 关闭的是本次建立的连接
}, [network])
```

依赖正确时，cleanup 永远和对应的 setup 配对，不会关错连接。

## 5. 常见错误

### 5.1 在 Effect 里同步派生状态

见 1.3。能直接算的值不要放进 state，更不要用 Effect 同步。

### 5.2 把事件逻辑塞进 Effect

用户点击、表单提交是离散事件，逻辑放事件处理器。Effect 里适合放“因为某状态就应持续同步”的逻辑。

### 5.3 依赖遗漏

```jsx
// 差：network 变了，Effect 不会重新请求
useEffect(() => {
  loadGasPrice(network)
}, [])
```

正确依赖是 `[network]`。不要用“关闭 lint 规则”解决提示；先确认依赖是否真的需要。

### 5.4 异步请求的竞态

用户快速切换网络，两个请求可能乱序返回，旧网络的结果覆盖新网络：

```jsx
useEffect(() => {
  let ignore = false

  async function load() {
    const data = await fetchGasPrice(network)
    if (!ignore) {
      setGasPrice(data)
    }
  }

  load()

  return () => {
    ignore = true
  }
}, [network])
```

- Effect 重新执行前，旧 Effect 的 cleanup 把旧请求标记为 `ignore`。
- 旧请求即使后返回，也不会写入 state。
- 更完整的做法是 `AbortController` 取消请求，API 阶段（Lesson 22）会展开。

### 5.5 StrictMode 为什么执行两次

开发环境下，StrictMode 会在组件首次挂载时故意执行：

```text
setup → cleanup → setup
```

目的是检查你的 Effect 是否**可重复建立和撤销**。

- 有正确 cleanup：最终只有一个定时器/订阅，行为正常。
- 没有 cleanup：会出现两个定时器，高度每 tick 加 2；事件监听执行两次。

所以看到开发环境打印两次、请求发两次，不要慌；先检查 cleanup。生产环境不会双执行。

### 5.6 Effect 里读到的 state 是旧值

```jsx
function handleClick() {
  setCount(count + 1)
  setCount(count + 1) // 两次都基于同一个快照
}
```

这是 Lesson 03 的批处理与快照规则，在 Effect 里同样成立。需要基于最新值更新时用函数式写法。

## 6. 与 Vue 对照

| Vue | React |
| --- | --- |
| `onMounted` | `useEffect(setup, [])` |
| `onUnmounted` | cleanup 函数 |
| `watch(source, cb)` | `useEffect(cb, [source])` 并对依赖诚实 |
| `watchEffect` | 没有直接对应；依赖必须显式列出 |
| 响应式自动追踪依赖 | 依赖数组手动声明 + `Object.is` 比较 |
| `nextTick` | 通常在 Effect 中已完成 DOM 更新 |
| `onUpdated` | 没有对应生命周期；依赖变化才重新同步 |

最大的差异：Vue 的 `watchEffect` 会自动追踪依赖；React 不会，**依赖是你和 React 的契约**。写错了不会报错，只会产生旧值或重复执行。

## 7. 练习任务卡

### 背景

做一个“链上监听台”：区块订阅、网络监听、页面标题三个区域共享同一份组件状态。界面和事件处理器已写好，你只需要实现三个 `useEffect`。

文件：`src/lessons/lesson-06/Exercise.jsx`

### 初始状态

```js
const INITIAL_HEIGHT = 18_400_000

const [height, setHeight] = useState(INITIAL_HEIGHT)
const [isLive, setIsLive] = useState(false)
const [speed, setSpeed] = useState(1000) // 毫秒
const [online, setOnline] = useState(navigator.onLine)
```

`handleReset`、`simulateNetwork`、开始/暂停按钮等已经接好，不要改动。

> 初始骨架里 `setOnline` 暂时没有使用者，`npm run lint` 会提示一条 unused warning；实现 Effect 2 后它会自动消失。

### Effect 契约

**Effect 1 · 区块订阅**

```text
依赖：[isLive, speed]

- isLive 为 false：不建立定时器，直接 return
- isLive 为 true：每隔 speed 毫秒把 height + 1
- 返回 cleanup：clearInterval
- 递增必须使用函数式更新（不能依赖旧的 height 闭包）
- 暂停、变速、卸载时旧定时器都必须被清理
```

**Effect 2 · 网络监听**

```text
依赖：[]

- 监听 window 的 'online' 事件：setOnline(true)
- 监听 window 的 'offline' 事件：setOnline(false)
- 返回 cleanup：移除上面两个监听
- 监听函数必须在 Effect 内部定义，保证 add / remove 使用同一引用
```

**Effect 3 · 标题同步**

```text
依赖：[height, isLive]

- document.title = formatTitle(isLive, height)
- 不需要 cleanup
- 思考：为什么依赖不能是空数组？
```

`formatTitle` 已定义：

```js
function formatTitle(isLive, height) {
  return `${isLive ? '同步中' : '已暂停'} · #${height.toLocaleString()} · 链上监听台`
}
```

### 验收标准

- [ ] 初始显示 18,400,000，状态“已暂停”，标题以“已暂停”开头。
- [ ] 点“开始监听”：状态变为“监听中”，每 1 秒高度 +1；标题同步为“同步中”。
- [ ] 点“暂停”：高度立即停止变化，标题变为“已暂停”。
- [ ] 监听中把间隔切到 2 秒：之后每 2 秒 +1，不能出现一秒加两次。
- [ ] “重置”：回到 18,400,000 且暂停，标题同步更新。
- [ ] 点“模拟断网”/“模拟恢复”：网络状态在“离线/在线”之间切换。
- [ ] 控制台无报错；StrictMode 下高度每个间隔只 +1（不重复计数）。
- [ ] `npm run lint` 与 `npm run build` 通过。

### 分级提示

<details>
<summary>提示 1 · 概念</summary>

- Effect 在渲染提交后执行，依赖变化时先 cleanup 再重新 setup。
- 定时器模式：`setInterval` 建立，`clearInterval` 撤销。
- 事件模式：Effect 内定义具名处理函数，`addEventListener` 和 `removeEventListener` 用同一个引用。
- 依赖数组要包含 Effect 里用到的所有响应式值；不要对 React 撒谎。
- 定时器里更新 state 用 `setHeight((current) => current + 1)`，避免闭包读到旧的 height。

</details>

<details>
<summary>提示 2 · 结构</summary>

1. 先写 Effect 1：判断 `isLive`，建立定时器，返回 cleanup。
2. 再写 Effect 2：在内部定义 `handleOnline` / `handleOffline`，订阅并返回移除函数。
3. 最后写 Effect 3：一条赋值语句，依赖 `[height, isLive]`。
4. 用 1 秒、2 秒间隔和暂停/恢复各验证一次，重点看有没有重复计数。

</details>

<details>
<summary>提示 3 · 局部示例</summary>

Effect 1 的骨架如下，其余两个自己完成：

```jsx
useEffect(() => {
  if (!isLive) return

  const timer = setInterval(() => {
    // 用函数式更新把 height + 1
  }, speed)

  return () => clearInterval(timer)
}, [isLive, speed])
```

Effect 2 的 cleanup 形状：

```jsx
return () => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
}
```

</details>

### 完成后

保存文件，回到对话告诉我“第六课完成”。我会检查依赖数组、cleanup 是否成对、StrictMode 下是否重复计数、标题是否同步，再进入第七课：`useRef` 与 DOM 操作。

## 8. 自查问题

<details>
<summary>1. useEffect 和事件处理器分别负责什么？</summary>

事件处理器响应用户动作（点击、提交、输入），只在事件发生时执行一次。Effect 负责在渲染后让 React 状态与外部系统保持同步，依赖变化时重新同步。判断标准：是在响应用户动作，还是在维持外部同步。

</details>

<details>
<summary>2. 依赖数组三种写法的执行时机？</summary>

省略：每次渲染后都执行；`[]`：挂载后执行一次、卸载时 cleanup；`[a, b]`：挂载后执行，任一依赖按 `Object.is` 变化时 cleanup 再重新执行。依赖不是深比较，对象/函数每次新建引用都会被视为变化。

</details>

<details>
<summary>3. 为什么需要 cleanup？</summary>

因为 Effect 建立的定时器、监听、连接、请求都是外部资源，重新执行或卸载时必须撤销，否则会重复订阅、泄漏、重复计数，或在卸载后更新 state。原则：setup 建立了什么，cleanup 就撤销什么。

</details>

<details>
<summary>4. 为什么依赖里放对象/函数容易无限循环？</summary>

React 用引用比较依赖。每次渲染创建的新对象/新函数引用都不同，Effect 每次都执行；如果 Effect 里又 setState，就会再次渲染，形成循环。解决：依赖原始值、把对象创建移到 Effect 内部，或在确实需要时用 memo 化。

</details>

<details>
<summary>5. StrictMode 为什么执行两次 Effect？</summary>

开发环境用“挂载 → 卸载 → 再挂载”来检查 Effect 是否能重复建立和撤销。正确的 cleanup 会让最终状态保持一致；没有 cleanup 的定时器或监听会重复，表现为高度一次加 2、日志打两遍。生产环境不会双执行。

</details>

<details>
<summary>6. 异步请求为什么需要 ignore 标志或 AbortController？</summary>

快速切换依赖时会有多个请求并发，返回顺序不保证。旧请求可能后返回并覆盖新结果。cleanup 把旧请求标记为 ignore 或 abort，确保只有最新一次请求能写入 state。

</details>
