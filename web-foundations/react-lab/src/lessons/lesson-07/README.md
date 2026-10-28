# Lesson 07 · useRef 与 DOM 操作

> 对应 React 官方文档：
> [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs) ·
> [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) ·
> [useRef](https://react.dev/reference/react/useRef) ·
> [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle)

## 一句话

`useRef` 给你一个跨渲染保留、修改时**不触发重渲染**的盒子；把盒子挂到 JSX 的 `ref` 上，就拿到真实的 DOM 节点。

## 本课目标

- 会创建和使用 `useRef`。
- 理解 `ref` 和 `state` 的区别，知道什么数据该放哪。
- 会给元素挂 ref，并在事件处理器或 Effect 中操作 DOM。
- 知道 `ref.current` 什么时候可用、什么时候是 `null`。
- 知道什么时候**不该**用 ref。
- 能把它和 Vue 的 template ref 对应起来。

## 1. 为什么需要 useRef

React 是声明式的：state 变了，UI 自动跟着变。但有些事天生是**命令式**的：

- 让输入框获得焦点
- 选中输入框里的文字
- 滚动到列表底部
- 播放 / 暂停视频
- 读取元素尺寸、位置
- 集成不是用 React 写的第三方图表库
- 保存定时器 ID、WebSocket 实例

这些操作不需要触发重渲染，也不应该由渲染结果推导出来。它们需要一个**在多次渲染之间保留、但改变时不影响渲染**的地方——这就是 `useRef`。

```jsx
import { useRef } from 'react'

const ref = useRef(0)

ref.current        // 0
ref.current += 1   // 直接改，不触发渲染
```

`useRef(initialValue)` 返回一个普通对象：

```js
{ current: initialValue }
```

- 这个对象在组件多次渲染之间是**同一个**。
- 修改 `current` 不会触发组件渲染。
- 初始值只在第一次渲染时使用；之后每次渲染都返回同一个对象，`initialValue` 被忽略。

注意：`useRef(expensive())` 的 `expensive()` 每次渲染都会执行，只是结果从第二次开始被忽略。真的需要惰性初始化时，用 `useState` 的初始化函数，或者 `useRef(null)` + 在 Effect 里初始化。

## 2. 两种典型用途

### 2.1 存跨渲染的可变值

```jsx
function TimerDemo() {
  const timerIdRef = useRef(null)

  function start() {
    clearTimeout(timerIdRef.current)
    timerIdRef.current = setTimeout(() => {
      console.log('已确认')
    }, 3000)
  }

  function cancel() {
    clearTimeout(timerIdRef.current)
    timerIdRef.current = null
  }

  // ...
}
```

`timerIdRef` 需要在多次事件之间保留，但它的值不需要显示在界面上，也不应该因为变化触发渲染——放 ref 里正合适。

适合放 ref 的值：

- 定时器 ID
- WebSocket / RPC 连接实例
- 上一次渲染的值
- 是否已经初始化过的标记
- “最新一次”的回调或请求参数

### 2.2 拿到 DOM 节点

```jsx
function AddressInput() {
  const inputRef = useRef(null)

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>
        聚焦
      </button>
    </>
  )
}
```

JSX 里写 `ref={inputRef}`，React 在把元素挂到 DOM 之后，会把真实的 DOM 节点写进 `inputRef.current`。之后你就可以调用浏览器原生的 API：

```js
inputRef.current.focus()
inputRef.current.select()
inputRef.current.scrollIntoView()
inputRef.current.getBoundingClientRect()
```

## 3. ref 与 state 的区别

| | `useState` | `useRef` |
| --- | --- | --- |
| 改变后触发渲染 | 是 | 否 |
| 适合放什么 | 要显示在 UI 上的数据 | 行为、资源、DOM 节点 |
| 更新方式 | `setState` | 直接改 `ref.current` |
| 跨渲染保留 | 是 | 是 |
| 渲染期间读写 | 正常读取 | 不要在渲染期间读写 |
| 初始值 | 每次渲染只用于首次 | 每次渲染只用于首次 |

一句话判断：

- **值需要出现在界面上** → `useState`
- **值只影响行为、资源或 DOM** → `useRef`
- **值既影响界面又在事件之间保留** → `useState`

反例：

```jsx
// 差：点击按钮后页面不会变，因为改 ref 不触发渲染
function Counter() {
  const count = useRef(0)

  return (
    <>
      <p>{count.current}</p>
      <button onClick={() => (count.current += 1)}>+1</button>
    </>
  )
}
```

这个组件里的按钮点了也没反应，因为 `ref.current` 的变化不会让 React 重新渲染。这种情况必须用 `useState`。

## 4. 用 ref 操作 DOM

### 4.1 DOM ref 的生命周期

```text
首次渲染：DOM 还没创建，ref.current === null
提交 DOM：React 把节点写入 ref.current
事件处理器 / Effect：可以安全使用
卸载：React 把 ref.current 置回 null
```

所以：

- **不要在渲染期间读 DOM ref**：首次渲染时它一定是 `null`，用 `ref.current.offsetWidth` 这类代码会崩。
- 事件处理器和 `useEffect` 都在 DOM 提交之后运行，可以放心使用。
- 用可选链兜底：`inputRef.current?.focus()`。

### 4.2 不要用 document.querySelector

```jsx
// 差
document.querySelector('.address-input').focus()

// 好
addressRef.current?.focus()
```

原因：

- 页面上可能有多个同 class 的元素，`querySelector` 选到哪个不确定。
- 这些元素由 React 管理，直接查 DOM 绕过了 React。
- 服务端渲染时没有 `document`，会直接报错。
- ref 天然和当前组件实例绑定，不会串。

### 4.3 操作发生在什么时候

**事件处理器里**：DOM 已经存在，直接操作。

```jsx
function handleFocus() {
  inputRef.current?.focus()
}
```

**Effect 里**：DOM 更新完成后操作。典型场景是“state 更新导致列表变长，然后滚动到底部”。

```jsx
useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}, [logs])
```

不要在 `setLogs(...)` 后面立刻调用 `scrollIntoView`：

```jsx
// 差：setLogs 只是排入更新，DOM 还是旧的
setLogs(nextLogs)
endRef.current?.scrollIntoView()
```

React 会在事件处理器结束后统一更新 DOM；handleAddLog 执行时，新的日志条目还没出现在页面上，滚动只能滚到旧位置。把操作放到依赖 `logs` 的 Effect 里，React 会在提交 DOM 之后执行它。

### 4.4 ref.current 不是响应式的

`ref.current` 的变化不会通知任何东西：

- 不会触发渲染
- 不会触发 Effect
- 把它放进依赖数组没有意义

它就是一个普通对象属性。如果你需要“值变了就更新 UI”，用 state；如果需要“值变了就重新同步外部系统”，也还是 state + Effect。

### 4.5 进阶：callback ref 与组件 ref

普通的对象 ref 只能挂到原生元素上。需要动态节点或自定义组件时，还会遇到：

```jsx
<div ref={(node) => { /* node 是 DOM 节点或 null */ }} />
```

回调 ref 在挂载时收到节点，在卸载时收到 `null`；React 19 还支持回调 ref 返回 cleanup 函数。

自定义函数组件在 React 19 里可以直接接收 `ref` prop：

```jsx
function FancyInput({ ref }) {
  return <input ref={ref} />
}
```

`forwardRef` 是 React 19 之前的写法，逐步被 ref prop 取代。需要向父组件暴露命令式方法时，用 `useImperativeHandle`。这两者本课只需要了解，后续综合练习遇到再展开。

## 5. 常见误区与边界

### 5.1 用 ref 存要显示的数据

改 ref 不触发渲染，界面不会更新。要显示的数据必须放 state。

### 5.2 在渲染期间读写 ref

```jsx
// 差：渲染必须是纯的
function Component() {
  const ref = useRef(0)
  ref.current += 1 // 每次渲染都执行
  return <p>{ref.current}</p>
}
```

渲染期间只允许**初始化** ref（例如 `useRef(null)`），读写在事件处理器或 Effect 中进行。演示里用“读取 ref”按钮把 `ref.current` 复制到 state 后才显示，这正是推荐做法：渲染只读 state，ref 只在事件处理器或 Effect 中访问。

### 5.3 忘记 null 检查

首次渲染时 ref 是 `null`；条件渲染时节点也可能不存在。养成 `ref.current?.method()` 的习惯。

### 5.4 把 ref 当响应式数据

```jsx
useEffect(() => {
  // 这段 Effect 不会因为 ref.current 变化而重新执行
}, [someRef.current]) // 没有意义
```

依赖 `ref.current` 不会产生订阅效果。想响应变化，用 state。

### 5.5 用 ref 代替状态提升 / Context

ref 不触发渲染，也不参与数据流。组件之间的共享状态仍然用 state 提升或 Context；ref 只适合“不需要出现在 UI 里”的实例数据。

## 6. 与 Vue 对照

| Vue | React |
| --- | --- |
| template 里 `ref="input"`，JS 里 `input.value` | `useRef` + `<input ref={inputRef} />` |
| `ref(0)` 创建的响应式变量 | `useState(0)` |
| `shallowRef` / 普通对象 | `useRef` 修改不触发渲染 |
| `nextTick` 后访问 DOM | 在 Effect 或事件处理器中访问 |
| `defineExpose` 暴露组件方法 | `useImperativeHandle` |
| 自动收集模板 ref | 需要为每个元素声明 ref |

最容易混的是名字：Vue 的 `ref()` 是**响应式**的，React 的 `useRef` **不是**。Vue 里改 `.value` 会更新视图，React 里改 `.current` 不会。

## 7. 练习任务卡

### 背景

做一个“链上终端”：地址输入区需要聚焦和全选，交易日志区需要在追加日志后自动滚动到最新。界面、state 和添加/清空日志的逻辑已经写好，你只需要补上 ref 与 DOM 操作。

文件：`src/lessons/lesson-07/Exercise.jsx`

### 初始状态

```js
const [address, setAddress] = useState(INITIAL_ADDRESS)
const [logs, setLogs] = useState(INITIAL_LOGS)
```

`handleAddLog`、`handleClear`、受控输入等已经接好，不要改动。

### Ref 契约

```text
1. 从 react 引入 useRef，声明 addressRef、logEndRef，初始值都是 null
2. 把 addressRef 挂到地址输入框
3. 把 logEndRef 挂到日志列表末尾的哨兵 li
4. handleFocus：聚焦 addressRef 指向的输入框
5. handleSelect：聚焦并全选输入框内容
6. 从 react 引入 useEffect，依赖 [logs]
   - DOM 更新后，让 logEndRef 滚动到底部
   - 推荐 scrollIntoView({ behavior: 'smooth', block: 'nearest' })
   - 使用可选链，避免节点不存在时崩溃
```

### 验收标准

- [ ] 点“聚焦输入框”：光标进入地址输入框。
- [ ] 点“聚焦并全选”：输入框获得焦点，且全部文字被选中。
- [ ] 点“添加日志”：列表新增一条，并自动滚动到最新一条。
- [ ] 连续添加多条：滚动仍然跟随最新；不会滚到旧位置。
- [ ] 点“清空”：列表为空并显示提示，控制台无报错；再次添加仍能自动滚动。
- [ ] 代码中没有 `document.querySelector`。
- [ ] 没有在渲染期间读写 `ref.current`。
- [ ] `npm run lint` 与 `npm run build` 通过，浏览器控制台无报错。

### 分级提示

<details>
<summary>提示 1 · 概念</summary>

- `useRef(null)` 返回 `{ current: null }`，在多次渲染之间是同一个对象。
- `ref={someRef}` 让 React 在提交 DOM 后把节点写进 `someRef.current`；卸载时写回 `null`。
- 操作 DOM 用 `ref.current?.focus()` / `.select()` / `.scrollIntoView()`。
- `setLogs` 之后 DOM 还没更新，滚动要放在依赖 `logs` 的 Effect 里。
- 改 ref 不触发渲染；只有 state 变化才触发。

</details>

<details>
<summary>提示 2 · 结构</summary>

1. 修改 import，加入 `useRef` 和 `useEffect`。
2. 声明 `const addressRef = useRef(null)` 和 `const logEndRef = useRef(null)`。
3. 给 `<input>` 加 `ref={addressRef}`，给哨兵 `<li>` 加 `ref={logEndRef}`。
4. 写两个事件处理器：`focus()` 与 `focus()` + `select()`。
5. 写一个 Effect，依赖 `[logs]`，可选链调用 `scrollIntoView`。
6. 依次验证聚焦、全选、添加日志滚动、清空后再添加。

</details>

<details>
<summary>提示 3 · 局部示例</summary>

声明与挂载：

```jsx
const addressRef = useRef(null)
const logEndRef = useRef(null)

<input ref={addressRef} /* ... */ />
<li ref={logEndRef} className="log-end" aria-hidden="true" />
```

聚焦处理器：

```jsx
const handleFocus = () => {
  addressRef.current?.focus()
}
```

滚动 Effect 的骨架：

```jsx
useEffect(() => {
  logEndRef.current?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  })
}, [logs])
```

</details>

### 完成后

保存文件，回到对话告诉我“第七课完成”。我会检查 ref 是否正确挂载、是否有 `querySelector`、滚动时机是否正确、渲染期间是否读了 ref，通过后进入第八课：自定义 Hook 与组件复用。

## 8. 自查问题

<details>
<summary>1. useRef 和 useState 的核心区别是什么？</summary>

两者都能跨渲染保留值。区别是：改 state 会触发重新渲染，改 ref.current 不会；state 是 UI 的数据源，ref 适合行为数据、外部资源和 DOM 节点。渲染期间不应读写 ref。

</details>

<details>
<summary>2. 为什么改 ref.current 不重新渲染？什么时候这是优势？</summary>

ref 只是一个普通对象属性，React 不追踪它。优势场景：定时器 ID、连接实例、编号计数器、DOM 节点等——这些值变化时没有理由重渲染界面，甚至重渲染会带来性能浪费或副作用。

</details>

<details>
<summary>3. 为什么首次渲染时 ref.current 是 null？</summary>

因为渲染阶段只是在计算 JSX，DOM 还没创建。React 提交 DOM 后才把节点写入 ref.current。因此 DOM 操作要放在事件处理器或 Effect 里，并习惯使用可选链。

</details>

<details>
<summary>4. 为什么不要用 document.querySelector？</summary>

它可能选到别的组件实例、绕开 React 的管理、在 SSR 环境直接报错，而且元素重新挂载后引用会失效。ref 与组件实例绑定，更安全、更明确。

</details>

<details>
<summary>5. 为什么“添加日志后滚动到底部”要放在 Effect 里？</summary>

事件处理器里的 `setLogs` 只是把更新排入队列，DOM 要等处理器结束后才提交。此时立刻滚动，列表里还没有新节点，只能滚到旧位置。Effect 在 DOM 提交之后运行，依赖 `logs` 正好在新条目出现后滚动。

</details>

<details>
<summary>6. 把 ref.current 放进依赖数组会怎样？</summary>

什么都不会发生。ref.current 不是响应式数据，React 不会因为它变化而重新执行 Effect；依赖比较的是那个普通属性值，但变化本身不会触发渲染，所以也谈不上重新比较。需要响应变化就用 state。
</details>
