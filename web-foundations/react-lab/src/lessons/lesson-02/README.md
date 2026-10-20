# Lesson 02 · 条件渲染、列表与 key

> 对应 React 官方文档：
> [Conditional Rendering](https://react.dev/learn/conditional-rendering) ·
> [Rendering Lists](https://react.dev/learn/rendering-lists) ·
> [Keeping Components Pure](https://react.dev/learn/keeping-components-pure)

## 一句话

界面里的“显示 / 不显示”和“重复多少份”都由普通 JavaScript 表达式决定；列表项用稳定的 `key`，让 React 在多次渲染之间认出谁是谁。

## 本课目标

- 知道条件渲染的几种写法，并能选对场景。
- 会用 `map` 把数据数组变成 JSX 列表。
- 理解 `key` 的用途，避免用数组下标埋坑。
- 理解纯函数组件：渲染期间不做修改、不做副作用。

本课仍然不涉及事件和 state，所有数据都是静态的。

## 1. 条件渲染

### 1.1 提前 return

适合整个组件“要么显示这个，要么显示那个”：

```jsx
function TaskSummary({ tasks }) {
  const pendingCount = tasks.filter((task) => !task.done).length

  if (tasks.length === 0) {
    return <span className="board-count">暂无任务</span>
  }

  return (
    <span className="board-count">
      {pendingCount > 0 ? `${pendingCount} 项待完成` : '全部完成'}
    </span>
  )
}
```

### 1.2 三元表达式

适合两个结果都很短的情况：

```jsx
{task.done ? '已完成' : '进行中'}
```

```jsx
<span className={`status ${done ? 'status--done' : 'status--active'}`}>
  {done ? '已完成' : '进行中'}
</span>
```

### 1.3 `&&`：有就显示，没有就什么都不渲染

```jsx
{isHighPriority && <span className="priority">高优先级</span>}
```

**注意 falsy 值**：

```jsx
{items.length && <List />}     // 数组为空时会渲染数字 0
{items.length > 0 && <List />} // 正确
```

`&&` 左边为 `0`、`''`、`null` 时，React 会把 `0` 渲染出来，但 `null`、`false`、`undefined` 不会显示任何内容。

### 1.4 先算好，再放进 JSX

分支变多时，先赋值给变量，JSX 会更清楚：

```jsx
let content
if (isLoading) {
  content = <Spinner />
} else if (error) {
  content = <ErrorMessage error={error} />
} else {
  content = <List items={items} />
}

return <main>{content}</main>
```

### 1.5 用 `null` 表示什么都不渲染

组件可以返回 `null`。这不是错误，代表它此刻没有 UI。

## 2. 列表渲染与 key

### 2.1 用 `map` 生成 JSX

```jsx
<ul>
  {tasks.map((task) => (
    <TaskItem key={task.id} task={task} />
  ))}
</ul>
```

`map` 返回一个新数组，里面是 JSX 元素；React 会把它们依次渲染。

### 2.2 为什么需要 key

React 通过 `key` 在两次渲染之间识别同一个列表项，从而正确地复用、移动或删除 DOM。没有 key 时，React 会在控制台警告，并且可能复用错误的节点。

key 的三条规则：

1. 在**同一组兄弟节点**中唯一，不需要全局唯一。
2. 在多次渲染之间保持**稳定**，通常使用数据本身的 `id`。
3. 不要用 `Math.random()` 或每次渲染都生成的新值，否则每一项都会被认为“换了人”。

```jsx
{tasks.map((task) => (
  <TaskItem key={task.id} task={task} />
))}
```

### 2.3 数组下标可以当 key 吗

```jsx
{tasks.map((task, index) => (
  <TaskItem key={index} task={task} />
))}
```

只有在列表**不增删、不排序、不筛选**时才勉强安全。列表一旦重排或删除，下标对应的元素就会变化，React 可能保留错误的内部状态。业务列表优先用业务 ID。

### 2.4 key 不是 props

`key` 是 React 内部用的，不会传进组件的 props。子组件如果需要 id，要再显式传一次：

```jsx
<TaskItem key={task.id} taskId={task.id} task={task} />
```

### 2.5 先筛选，再渲染

```jsx
const favoriteAssets = assets.filter((asset) => asset.favorite)

<ul>
  {favoriteAssets.map((asset) => (
    <TokenRow key={asset.id} token={asset} />
  ))}
</ul>
```

也可以直接链式调用：

```jsx
{assets
  .filter((asset) => asset.favorite)
  .map((asset) => (
    <TokenRow key={asset.id} token={asset} />
  ))}
```

### 2.6 空列表要单独处理

```jsx
{tasks.length === 0 ? (
  <EmptyTasks />
) : (
  <ul>
    {tasks.map((task) => (
      <TaskItem key={task.id} task={task} />
    ))}
  </ul>
)}
```

如果没有这一层判断，用户只会看到一片空白。

## 3. 组件必须是纯函数

“纯”的意思是：**同样的输入，永远得到同样的输出，并且不修改外部世界。**

渲染期间不要做这些事：

- 修改 props 或 props 里的对象 / 数组。
- 修改组件外部定义的变量。
- 直接修改传入的数组，比如 `tasks.push(...)`、`tasks.sort()`、`tasks.reverse()`。
- 发网络请求、写 localStorage、启动定时器、手动改 DOM。

`filter`、`map`、`slice` 都会返回新数组，不会改原数组；`sort`、`reverse`、`push` 会改原数组。需要排序时先复制：

```jsx
const sortedTasks = [...tasks].sort((a, b) => a.title.localeCompare(b.title))
```

也可以使用现代的 `toSorted`，它不会修改原数组。

开发环境的 StrictMode 会故意把组件多调用一次，用来暴露不纯的代码。纯组件被调用两次结果一样，所以不会出问题；这也是为什么不纯的代码在 StrictMode 下容易露馅。

## 4. 与 Vue 对照

| Vue | React |
| --- | --- |
| `v-if` / `v-else` | `if` / 三元 / `&&` |
| `v-for` | `array.map()` |
| `:key` | `key` |
| `computed` 过滤列表 | 渲染前 `filter`（性能优化后面再学） |
| 在渲染中改数据 | 禁止；副作用放到事件或 `useEffect` |

## 5. 练习任务卡

### 背景

给链上资产做一个观察列表：有的资产涨，有的跌，有的没变化；还能看到哪些是自选。

### 目标

打开 `Exercise.jsx`，实现四个组件，并渲染两个资产列表。

### 使用的数据

在 `Lesson02Exercise` 上方定义：

```js
const assets = [
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 1.24,
    change24h: 3.8,
    favorite: true,
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    balance: 18.5,
    change24h: -2.4,
    favorite: false,
  },
  {
    id: 'arb',
    symbol: 'ARB',
    name: 'Arbitrum',
    balance: 420,
    change24h: 0,
    favorite: true,
  },
]
```

### 接口契约

**ChangeBadge**

```text
ChangeBadge({ change })

change > 0   → span.change.change--up   内容 +3.8%
change < 0   → span.change.change--down 内容 -2.4%
change === 0 → span.change.change--flat 内容 0%
```

**EmptyState**

```text
EmptyState({ message })
结构：div.empty-state > p
p 的内容是 message
```

**TokenRow**

```text
TokenRow({ token })
token 包含：id、symbol、name、balance、change24h、favorite

结构：li.token
  favorite 为 true 时追加 token--favorite 类

  ├─ div.token__mark        ← symbol
  ├─ div.token__info
  │    ├─ div.token__title  ← h3(symbol)
  │    │                       favorite 为 true 时追加 span.token__star("自选")
  │    └─ p.muted           ← name
  └─ div.token__numbers
       ├─ span.token__balance ← `${balance} ${symbol}`
       └─ ChangeBadge(change={change24h})
```

**Watchlist**

```text
Watchlist({ title, tokens })

结构：section.watchlist
  ├─ header.watchlist__head
  │    ├─ h2(title)
  │    └─ span.watchlist__count ← `${tokens.length} 项`
  └─ tokens.length === 0
       ? EmptyState(message="没有找到资产。")
       : ul.token-list
            └─ tokens.map(...) → TokenRow，key 使用 token.id
```

**Lesson02Exercise**

```text
用 div.stack 包住两个 Watchlist：
1. title="全部资产"，tokens={assets}
2. title="自选"，tokens={assets.filter(asset => asset.favorite)}
```

### 验收标准

- [ ] “全部资产”渲染 3 行，“自选”渲染 2 行。
- [ ] ETH 显示绿色 `+3.8%`，SOL 显示红色 `-2.4%`，ARB 显示中性 `0%`。
- [ ] 自选资产有 `token--favorite` 样式和“自选”标签。
- [ ] 临时把 `tokens` 改成 `[]`，能看到空状态；测试后改回来。
- [ ] 列表 key 使用 `token.id`，没有使用数组下标。
- [ ] 没有修改 `assets` 数组，没有 state、事件或副作用。
- [ ] 浏览器控制台无报错，`npm run build` 通过。

### 分级提示

<details>
<summary>提示 1 · 概念</summary>

- 涨跌徽章可以用嵌套三元：先算 tone，再算 label，最后拼 className。
- 自选标签可以用 `favorite && <span>...</span>`。
- `map` 的回调要返回一个 JSX 元素，`key` 加在这个元素上。
- 空状态和列表二选一，用 `tokens.length === 0 ? ... : ...`。

</details>

<details>
<summary>提示 2 · 结构</summary>

1. 先写 `ChangeBadge`，它是最小的条件渲染练习。
2. 写 `EmptyState`，只接收 message。
3. 写 `TokenRow`，把 `token` 的字段放到对应位置，内部使用 `ChangeBadge`。
4. 写 `Watchlist`，先处理空数组，再写 `map`。
5. 最后在 `Lesson02Exercise` 定义 assets 并渲染两个 Watchlist。

</details>

<details>
<summary>提示 3 · 局部示例</summary>

`ChangeBadge` 的参考实现如下，其余组件自己完成：

```jsx
export function ChangeBadge({ change }) {
  const tone = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  const label = change > 0 ? `+${change}%` : `${change}%`

  return <span className={`change change--${tone}`}>{label}</span>
}
```

</details>

### 完成后

保存文件，回到对话告诉我“第二课完成”。我会检查条件分支、key 和纯函数问题，通过后进入第三课：事件处理与 useState。

## 6. 自查问题

<details>
<summary>1. 为什么列表需要 key？用 index 有什么风险？</summary>

React 用 key 在多次渲染之间识别列表项。使用 index 时，一旦前面插入、删除或重排元素，下标就会对应到别的数据；React 可能错误复用 DOM 或组件内部状态。业务 ID 能稳定标识一项。

</details>

<details>
<summary>2. 为什么 `{items.length && <List />}` 在空数组时会渲染 0？</summary>

空数组的 length 是数字 0，是 falsy。`0 && ...` 的结果就是 0，而 React 会把数字 0 渲染成文字。改成 `items.length > 0 && ...` 就没有这个问题。

</details>

<details>
<summary>3. 在 render 里直接 `tasks.sort()` 有什么问题？</summary>

`sort()` 会修改原数组。React 渲染函数必须是纯的，不能修改 props 或外部数据；否则父组件数据、其他组件看到的顺序都可能被意外改变。需要排序时先复制数组。

</details>
