# Lesson 08 · 自定义 Hook 与组件复用

> 对应 React 官方文档：
> [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) ·
> [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) ·
> [Built-in React Hooks](https://react.dev/reference/react)

## 一句话

自定义 Hook 是一个以 `use` 开头、内部调用其他 Hook 的函数：它把**状态和副作用逻辑**从组件里抽出来复用。共享的是逻辑，不是状态。

## 本课目标

- 理解“组件复用”和“逻辑复用”的区别。
- 会把重复的 state + Effect 提取成自定义 Hook。
- 遵守 Hook 规则，知道为什么不能条件调用。
- 会设计 Hook 的参数与返回值。
- 理解每次调用 Hook 都是独立实例。
- 会用 Hook 组合 Hook。
- 知道什么时候**不该**抽 Hook。
- 能把它和 Vue 的 composable 对应起来。

## 1. 为什么需要自定义 Hook

React 的组件复用解决的是“界面结构 + 行为”的复用。但真实项目里更常见的需求是：**界面完全不同，逻辑却一模一样**。

比如：

- RPC 状态卡需要监听 `online` / `offline`；
- 行情推送卡也需要同一套监听；
- 以后任何需要“是否在线”的组件，都要再复制一遍。

把 `useState` + `useEffect` + 两个处理函数复制过去能跑，但会带来问题：

- 同一段逻辑散落在多个文件，改一处要改多处；
- 监听注册和移除容易漏掉，造成泄漏；
- 组件被细节淹没，看不出它真正的职责。

自定义 Hook 就是把这段“带状态、带副作用”的逻辑装进一个函数，让所有组件调用它。

## 2. 什么是自定义 Hook

```jsx
import { useEffect, useState } from 'react'

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}
```

使用：

```jsx
function RpcStatus() {
  const online = useOnlineStatus()
  return <span>{online ? 'RPC 在线' : 'RPC 离线'}</span>
}

function MarketStatus() {
  const online = useOnlineStatus()
  return <span>{online ? '行情同步中' : '行情已断开'}</span>
}
```

要点：

- 它就是一个普通 JavaScript 函数，没有特殊 API，也没有“注册”步骤。
- 名字必须以 `use` 开头。这不是装饰，而是 React 和 lint 识别 Hook 的约定。
- 内部可以调用任意内置 Hook，也可以调用其他自定义 Hook。
- 返回值由你决定：标量、数组、对象都可以。

### 2.1 提取前与提取后

提取前，两个组件各写一份：

```jsx
function RpcStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    // 注册两个监听 + cleanup
  }, [])
  return <span>{online ? 'RPC 在线' : 'RPC 离线'}</span>
}

function MarketStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    // 同一套代码再写一遍
  }, [])
  return <span>{online ? '行情同步中' : '行情已断开'}</span>
}
```

提取后，两个组件只保留自己的状态名和界面：

```jsx
function RpcStatus() {
  const online = useOnlineStatus()
  return <span>{online ? 'RPC 在线' : 'RPC 离线'}</span>
}

function MarketStatus() {
  const online = useOnlineStatus()
  return <span>{online ? '行情同步中' : '行情已断开'}</span>
}
```

关键理解：`useOnlineStatus()` 被调用两次，**不等于共享一份 state**。React 为每个调用点维护独立的一份 state。两个组件显示同样的值，是因为它们监听同一个浏览器事件源，而不是因为共享了变量。

## 3. Hook 规则

### 3.1 只在顶层调用

不要在 `if` / `else` / `switch`、循环、嵌套函数里调用 Hook，也不要在提前 `return` 之后调用：

```jsx
// 差
function Profile({ user }) {
  if (!user) return null
  const [name, setName] = useState('') // 违反规则：这次渲染少调用了一个 Hook
  // ...
}
```

正确写法是让所有 Hook 在提前返回之前执行：

```jsx
function Profile({ user }) {
  const [name, setName] = useState('')

  if (!user) return null
  // ...
}
```

如果某个副作用只在特定条件下需要，把条件放到 Effect **内部**，而不是决定要不要调用 Effect：

```jsx
useEffect(() => {
  if (!enabled) return
  // ...
}, [enabled])
```

### 3.2 只在组件或自定义 Hook 中调用

Hook 必须直接出现在 React 函数组件或另一个以 `use` 开头的函数体里。不能从普通工具函数、class 方法、事件处理器里调用 `useState` / `useEffect`。

### 3.3 为什么有这些规则

React 不记录 Hook 的名字，而是按照**调用顺序**把 state 和 effect 对应到组件实例上：

```text
第一次渲染：useState(A) → useEffect(B) → useState(C)
第二次渲染：useState(A) → useEffect(B) → useState(C)   // 顺序必须一致
```

如果第二次渲染跳过了中间的 Hook：

```text
第一次渲染：useState(A) → useEffect(B) → useState(C)
第二次渲染：useState(A) → useEffect(B)               // C 消失了，顺序错位
```

React 无法知道消失的是哪一个，只能把后面的 Hook 全部对错位置，导致状态串线。条件调用正是最容易破坏顺序的写法。

`.oxlintrc.json` 已启用 `react/rules-of-hooks`，违反规则会直接报错。

### 3.4 命名必须以 use 开头

- 让 lint 按 Hook 的规则检查调用位置。
- 让调用者知道这个函数带着状态和副作用，不能随便放进条件里。
- 普通函数不要用 `use` 开头；如果函数里真的调用了 Hook，就必须把它当作 Hook 使用。

## 4. 从重复代码到自定义 Hook

提取流程：

1. 找到重复的状态和副作用。
2. 建一个 `useXxx` 函数，把 `useState`、`useEffect` 和处理函数搬进去。
3. 决定参数：哪些值来自外部，并且变化时需要重新同步（例如 `delay`、`interval`）。
4. 决定返回值：组件真正需要什么。
5. 在组件里调用，删除重复代码。
6. 验证多实例互不干扰、卸载时能清理。

### 4.1 例子：useDebouncedValue

搜索框常见需求：输入时不要每个字符都查询，停下来 400ms 后再用最后的值。

```jsx
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
```

组件只关心两件事：

```jsx
const [query, setQuery] = useState('')
const debouncedQuery = useDebouncedValue(query, 400)
```

`value` 和 `delay` 是参数，`debouncedQuery` 是返回值，中间的计时逻辑被封装起来。每次 `value` 变化都会重新执行 Effect，cleanup 取消上一次的计时——所以只有最后一次会生效。

## 5. 共享逻辑，不共享状态

这是自定义 Hook 最容易被误解的地方。

```jsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)
  return [count, () => setCount((current) => current + 1)]
}

function CardA() {
  const [count, increment] = useCounter(10)
  return <button onClick={increment}>A: {count}</button>
}

function CardB() {
  const [count, increment] = useCounter(10)
  return <button onClick={increment}>B: {count}</button>
}
```

点 A 的按钮，B 不会变。两个 `useCounter` 调用各有各的 `count`。Hook 复用的是**创建状态的方式**，不是状态本身。

如果两个组件确实要共享状态：

- 把 state 提升到共同父组件（Lesson 04）；
- 或者放进 Context（Lesson 05）。

自定义 Hook 可以读取 Context，把“读取 + 操作”封装得更顺手，但 Hook 本身不是状态容器，也不会让状态自动共享。

## 6. 参数与返回值设计

### 6.1 参数

参数像普通函数参数，但变化时通常会触发 Hook 内部的重新同步：

```jsx
const height = useBlockHeight(18_400_000, speed)
```

`speed` 改变时，内部依赖 `[speed]` 的 Effect 会重新执行。注意：**参数变化不会自动重置 Hook 内部的 state**，除非你在 Hook 里显式处理。

### 6.2 返回值

- 返回单个值：直接返回，例如 `return online`。
- 返回“值 + 操作方法”：用数组或对象。

```jsx
// 对象：字段多，可读性好
return { online, retry }

// 元组：模仿 useState，调用方可以自由重命名
return [value, setValue]
```

命名要表达行为：`useOnlineStatus`、`useBlockHeight`、`useDebouncedValue`，而不是 `useData` 这种含糊的名字。

### 6.3 不要返回 JSX

Hook 负责逻辑，组件负责 UI：

```jsx
// 差：Hook 返回界面
function useProfileCard(user) {
  return <div>{user.name}</div>
}

// 好：Hook 返回数据，组件决定怎么渲染
function useProfile(user) {
  const displayName = user.nickname || user.address
  return { displayName }
}
```

如果复用的是一个带状态的界面块，应该抽**组件**；如果复用的是一个行为或数据，才抽 Hook。

## 7. Hook 组合

自定义 Hook 可以调用内置 Hook，也可以调用其他自定义 Hook。

```jsx
function useBlockHeight(start, interval) {
  const [height, setHeight] = useState(start)

  useEffect(() => {
    const id = setInterval(() => {
      setHeight((current) => current + 1)
    }, interval)

    return () => clearInterval(id)
  }, [interval])

  return height
}
```

几个细节：

- `setHeight((current) => current + 1)` 使用函数式更新，定时器回调里不会读到过期的快照（Lesson 03）。
- 依赖 `[interval]`：间隔变化时先清理旧定时器，再建立新的。没有 cleanup 就会出现两个定时器叠加，计数翻倍。
- 组件卸载时，React 执行 cleanup，停止定时器。

组合能力会随着课程推进越来越有价值。比如阶段四做数据请求时，可以写一个 `useFetch`：内部组合 loading / error / cancel 等多段逻辑，组件只拿到 `{ data, loading, error }`。

### 7.1 进阶：回调身份与最新值

如果把回调函数传给定时器 Hook，每次渲染都会创建新的函数。若把 `callback` 直接放进依赖，定时器会反复重建。常见解法是用 `useRef` 保存最新回调（Lesson 07）：

```jsx
function useInterval(callback, delay) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const id = setInterval(() => callbackRef.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
```

本课练习不需要这个模式，知道它存在即可。

## 8. 常见误区与边界

### 8.1 以为 Hook 共享状态

Hook 共享的是逻辑。每个调用点各自拥有 state；需要共享数据就提升 state 或使用 Context。

### 8.2 条件调用 Hook

```jsx
// 差
if (isOnline) {
  useEffect(() => {
    // ...
  }, [])
}
```

Hook 顺序必须稳定。把条件放进 Effect 内部，或把条件判断放在所有 Hook 之后。

### 8.3 忘记 cleanup

订阅、定时器、事件监听、WebSocket 都可能泄漏。写出“建立资源”的代码时，同时写出“撤销资源”的代码。自定义 Hook 让 cleanup 集中在一处，这正是它的优势。

### 8.4 依赖数组漏项

Hook 把 Effect 藏起来后，依赖问题也更隐蔽。谁在 Effect 里被读取，谁就应该出现在依赖里；需要“只执行一次”就明确写 `[]`，并确保不会读到过期值。

### 8.5 过度抽象

不是所有重复都值得抽 Hook：

- 只用一次、未来也大概率只在一个地方用的逻辑，先留在组件里；
- 只有一两行的简单派生值，不值得单独建 Hook；
- 表面上相似、但依赖和清理方式不同的逻辑，硬抽会把两边的差异塞进一堆参数和分支里。

判断标准：**这段逻辑有没有一个清晰、可命名的能力**（在线状态、区块高度、防抖值），并且会被复用或需要独立测试。有，就抽；没有，就先放着。

### 8.6 用 Hook 返回 JSX

Hook 返回界面会失去组件的组合、props 和渲染控制能力。需要复用界面就用组件。

## 9. 与 Vue 对照

| Vue | React |
| --- | --- |
| composable：`useXxx()`，在 `setup` 中调用 | 自定义 Hook：`useXxx()`，在组件函数体内调用 |
| 返回 `ref` / `computed` | 返回普通值、setter 或处理函数 |
| 依赖自动收集 | 手动声明依赖数组 |
| `onMounted` / `onUnmounted` / `watch` | `useEffect` + cleanup |
| `provide` / `inject` | Context + 自定义 Hook 封装 |
| 每次调用也是独立实例 | 每次调用也是独立实例 |

最容易混的是“名字像、语义不同”：

- Vue 的 `ref()` 是**响应式**的，`.value` 变化会更新视图；
- React 的 `useRef` **不是**响应式的，`.current` 变化不会触发渲染（Lesson 07）；
- 两边的 `useXxx` 都只是函数命名约定，不复用状态。

另一处差异在规则严格程度：React 依赖调用顺序定位状态，因此禁止条件调用，lint 会直接报错；Vue 的 composable 也建议在 `setup` 中同步调用，但约束没有 React 这么刚性。

## 10. 练习任务卡

### 背景

做一个“链上数据看板”：网络状态需要跟随浏览器在线事件；主网和测试网各有一张区块高度卡片，按各自的间隔增长；地址搜索需要防抖，停止输入后才更新结果。

界面、组件拆分、事件接线都已经写好，你只需要在 `hooks.js` 里实现三个自定义 Hook。

### 文件

- 你写：`src/lessons/lesson-08/hooks.js`
- 已接线、不要改动：`src/lessons/lesson-08/Exercise.jsx`

`hooks.js` 里的占位返回值让面板先能渲染；实现时替换成真实逻辑。

### Hook 契约

```text
useOnlineStatus()
- 参数：无
- 返回：boolean
- 初始值：navigator.onLine
- 用 useEffect 订阅 window 的 'online' / 'offline' 事件，更新返回值
- 依赖数组为 []
- cleanup 中移除两个监听

useBlockHeight(start, interval)
- 参数：start 起始高度（number）；interval 毫秒（number）
- 返回：当前高度（number）
- 初始值：start
- 每隔 interval 毫秒 +1，使用函数式更新
- useEffect 依赖 [interval]
- interval 变化或组件卸载时 clearInterval

useDebouncedValue(value, delay)
- 参数：value 任意值；delay 毫秒
- 返回：延迟后的 value
- 初始返回值等于初始 value
- value / delay 变化后，等待 delay 毫秒再更新返回值
- 等待期间再次变化要重置计时（cleanup 取消上一次 setTimeout）
- useEffect 依赖 [value, delay]
```

### 验收标准

- [ ] 点“模拟断网 / 模拟恢复”：网络状态立即切换；DevTools 的 Offline 开关也能触发变化。
- [ ] 主网、测试网两张卡各自按自己的间隔增长，互不影响。
- [ ] 切换任意一张卡的出块间隔：高度不会重置，速度切换正确，**不会出现原来的定时器还在跑导致翻倍**。
- [ ] 取消勾选“显示测试网”：测试网卡片卸载；重新勾选后高度从初始值重新开始（说明 state 属于每次调用，不是全局共享）。
- [ ] 地址搜索：输入时输入值立即回显，结果区要等停止输入约 400ms 后才变化；连续输入不出现中间结果的跳变。
- [ ] 清空输入后显示全部演示地址；输入不存在的关键词显示空状态。
- [ ] 控制台无报错；组件卸载时不留下定时器或监听（通过间隔切换与卡片卸载观察）。
- [ ] 没有条件调用 Hook；Hook 只在 `hooks.js` 中定义、在组件顶层调用。
- [ ] `npm run lint` 与 `npm run build` 通过。

### 分级提示

<details>
<summary>提示 1 · 概念</summary>

- 三个函数都以 `use` 开头，内部使用 `useState` / `useEffect`。
- 每个 Hook 的返回值就是组件要用的值；state 在 Hook 内部创建，调用方每次调用都有独立一份。
- `useOnlineStatus`：state 初始化为 `navigator.onLine`；Effect 里注册两个监听，cleanup 移除。
- `useBlockHeight`：state 初始化为 `start`；Effect 里 `setInterval`，回调里用函数式更新；cleanup `clearInterval`。
- `useDebouncedValue`：state 初始化为 `value`；Effect 里 `setTimeout` 写入新值；cleanup `clearTimeout`。
- cleanup 会在依赖变化导致 Effect 重新执行前、以及组件卸载时运行。

</details>

<details>
<summary>提示 2 · 结构</summary>

1. 在 `hooks.js` 顶部引入 `useEffect` 和 `useState`。
2. `useOnlineStatus`：`const [online, setOnline] = useState(navigator.onLine)`；Effect 依赖 `[]`。
3. `useBlockHeight`：`const [height, setHeight] = useState(start)`；Effect 依赖 `[interval]`。
4. `useDebouncedValue`：`const [debounced, setDebounced] = useState(value)`；Effect 依赖 `[value, delay]`。
5. 三个 Effect 都要 `return` 清理函数。
6. 三个函数分别 `return` 对应的值。

</details>

<details>
<summary>提示 3 · 局部示例</summary>

`useBlockHeight` 的骨架：

```jsx
export function useBlockHeight(start, interval) {
  const [height, setHeight] = useState(start)

  useEffect(() => {
    // 创建定时器：每隔 interval 用函数式更新 height
    // 返回 cleanup
  }, [interval])

  return height
}
```

`useDebouncedValue` 的骨架：

```jsx
export function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    // 用 setTimeout 延迟写入 setDebounced
    // 返回 cleanup 取消计时
  }, [value, delay])

  return debounced
}
```

`useOnlineStatus` 的骨架：

```jsx
export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    // 定义 handleOnline / handleOffline
    // 注册两个监听
    // 返回 cleanup 移除两个监听
  }, [])

  return online
}
```

</details>

### 完成后

保存文件，回到对话告诉我“第八课完成”。我会检查三个 Hook 的参数、返回值、依赖数组与 cleanup，以及多实例是否互不干扰、搜索防抖是否只有最后一次生效。通过后进入 Lesson 09：React 阶段综合练习。

## 11. 自查问题

<details>
<summary>1. 自定义 Hook 和普通函数的核心区别是什么？</summary>

写法上它可以是普通函数，但必须遵守 Hook 的规则：名字以 `use` 开头、只在组件或其他 Hook 顶层调用、内部可以调用其他 Hook。核心区别不在语法，而在于它承载了跨渲染的状态和副作用，必须让 React 能稳定地按顺序关联它们。

</details>

<details>
<summary>2. 两个组件调用同一个自定义 Hook，state 会共享吗？</summary>

不会。每次调用都是一份独立的 state。共享的是创建状态和副作用的逻辑。需要共享数据时，把 state 提升到父组件或放进 Context。

</details>

<details>
<summary>3. 为什么 Hook 不能写在 if 或循环里？</summary>

React 按调用顺序为每个 Hook 分配 state。条件调用会让不同渲染的 Hook 数量或顺序不同，后面的 state 全部错位。条件逻辑应放到 Hook 内部的 Effect 里，或者拆成子组件。

</details>

<details>
<summary>4. Hook 里的 Effect cleanup 什么时候执行？</summary>

在组件卸载时执行；如果依赖数组中的值变化导致 Effect 重新执行，cleanup 会在下一次 Effect 之前先执行。所以“取消上一次计时 / 移除上一次监听”是 cleanup 的主要职责。

</details>

<details>
<summary>5. 为什么 useDebouncedValue 的依赖是 [value, delay]？</summary>

`value` 变化需要重新开始计时；`delay` 变化也需要用新时长重新计时。每次变化时 cleanup 会取消上一次的 `setTimeout`，因此只有最后一次的计时会真正写入 state。

</details>

<details>
<summary>6. 什么时候不该抽自定义 Hook？</summary>

只在一个地方使用、且没有清晰可命名的能力；逻辑只有一两行；几个组件表面相似但依赖与清理方式不同；或者真正需要的是共享状态而不是共享逻辑。过早抽象会把差异堆成参数和分支，比重复更难维护。

</details>

<details>
<summary>7. Vue 的 composable 和 React 的自定义 Hook 怎么对应？</summary>

两者都是 `useXxx` 函数，都用于提取带状态的逻辑，每次调用都是独立实例。区别在于 Vue 通过响应式系统自动收集依赖，React 需要手动写依赖数组；Vue 用生命周期钩子/`watch`，React 用 `useEffect` + cleanup；React 对调用顺序的约束更严格。

</details>
