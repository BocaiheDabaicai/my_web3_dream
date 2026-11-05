# Lesson 13 · 服务端数据获取与缓存基础

> 对应 Next.js 官方文档：
> [Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data) ·
> [Caching (Previous Model)](https://nextjs.org/docs/app/guides/caching-without-cache-components) ·
> [React.cache](https://react.dev/reference/react/cache)

## 一句话

Server Component 可以直接 `async/await` 取数据，不需要 `useEffect`；`React.cache` 负责在一次请求内去重。

## 1. 在服务端取数据

页面默认就是 Server Component。把它写成 `async` 函数，直接 `await`：

```jsx
async function getNetworkStats() {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return {blockHeight: 21000042, gasPrice: 18, peers: 24}
}

export default async function StatsPage() {
  const stats = await getNetworkStats()
  return <p>区块高度：{stats.blockHeight}</p>
}
```

和客户端取数据相比：

- 数据在服务端取好，组件直接渲染成 HTML，再发给浏览器。
- 不需要 `useState`、`useEffect`，也不会有“先空一下再加载”的客户端状态。
- 数据库、密钥、内部接口都只留在服务端，不会进浏览器 bundle。
- 慢请求会拖慢整段渲染，用上一课的 `loading.jsx` 或 `<Suspense>` 兜住。

## 2. React.cache：同一次请求内去重

同一次服务端渲染里，如果有两个组件都要同一份数据，直接调用会查两次。用 `cache` 包一层：

```jsx
import {cache} from 'react'

const getCachedStats = cache(getNetworkStats)
```

之后同一次请求内、参数相同的调用，只会真正执行一次，其余调用复用结果。

- 缓存范围是**一次请求**，请求结束就没了。
- 不同参数是不同缓存项，例如 `getBlock('a')` 和 `getBlock('b')`。
- 刷新页面就是新请求，函数会重新执行。

## 3. 缓存的两个层次

| 层次 | 手段 | 生效范围 |
| --- | --- | --- |
| 同一次请求内去重 | `React.cache` | 当前请求 |
| 跨请求缓存 | `fetch(..., {cache: 'force-cache'})`、`next: {revalidate: n}` | 多次请求之间 |

当前 Next.js 16 的默认行为：

- `fetch` **默认不缓存**，每次请求都重新取。
- `fetch(url, {cache: 'force-cache'})` 会跨请求复用结果。
- `fetch(url, {next: {revalidate: 60}})` 缓存 60 秒后重新验证。
- 数据库等非 `fetch` 调用，跨请求缓存以前用 `unstable_cache`；Next 16 更推荐开启 Cache Components 后用 `'use cache'`。本 lab 没有开启 `cacheComponents`，所以这节课先掌握服务端取数和 `React.cache`，跨请求缓存知道概念即可。

> 开发模式下页面每次都按请求渲染；生产构建时，没有动态数据的页面会被预渲染成静态 HTML。这是另一层缓存，本节不展开。

## 4. Demo

打开 `/demo/server-data`，对照 `src/app/demo/server-data/page.jsx`：

1. 上面两张卡片都调用 `getCachedStats()`，查询 ID 相同 → 800ms 的查询只执行了一次。
2. 下面两张卡片直接调用 `getNetworkStats()`，查询 ID 不同 → 各查各的。
3. 两部分都包在 `<Suspense>` 里，页面先出现“正在查询节点…”再换出结果。
4. 点“重新加载”发起新请求，所有 ID 都会变。

## 5. 练习任务卡

目标：做一个服务端渲染的“网络数据”页面，用 `React.cache` 让两张卡片共享同一次查询。

### 5.1 整理导航

修改 `src/app/exercise/layout.jsx`：

- 删掉重复的那条“区块”链接。
- 新增一条指向 `/exercise/stats` 的链接，文字用“网络数据”。

### 5.2 新建页面

新建 `src/app/exercise/stats/page.jsx`，不要写 `'use client'`：

- 从 `react` 引入 `cache`，从 `./data` 引入已提供的 `getNetworkStats`。
- 在模块顶层包一层：`const getCachedStats = cache(getNetworkStats)`。
- 写一个 `async function StatCard({title})`：
  - `const stats = await getCachedStats()`
  - 显示标题、查询 ID（`stats.queryId`）、区块高度、Gas、节点数。
- 默认导出的页面渲染两张卡片，标题例如“概览”和“明细”。
- 页面本身不需要 `async`，只有真正 `await` 数据的 `StatCard` 需要。

`data.js` 已经放在 `src/app/exercise/stats/data.js`，每次执行会等待 800ms 并返回一个随机 `queryId`。

## 6. 接口契约

| 文件 | 要求 |
| --- | --- |
| `exercise/stats/data.js` | 已提供，不要改 |
| `exercise/stats/page.jsx` | Server Component，无 `'use client'` |
| `StatCard` | 异步组件，`await` 缓存后的函数 |
| 两张卡片 | 使用同一个 `getCachedStats`，参数相同 |

页面渲染结果里两张卡片的 `queryId` 必须一致。

## 7. 验收

- [ ] `/exercise/stats` 能打开，显示两张卡片
- [ ] 两张卡片的查询 ID 相同
- [ ] 整页刷新后，两张卡片换成同一个新 ID
- [ ] 页面文件没有 `'use client'`，没有 `useState` / `useEffect`
- [ ] 导航里有“网络数据”，重复的“区块”链接已删掉
- [ ] `npm run build` 通过

## 8. 分级提示

<details>
<summary>提示 1 · 概念</summary>

- Server Component 不需要客户端状态：在组件里 `await` 数据函数，然后直接渲染。
- `cache(fn)` 是包一层，返回一个“同参数只执行一次”的新函数；不要在渲染时临时包。
- 两张卡片必须调用**同一个被缓存过的函数**，否则缓存不起来。

</details>

<details>
<summary>提示 2 · 结构</summary>

```jsx
// exercise/stats/page.jsx
import {cache} from 'react'
import {getNetworkStats} from './data'

const getCachedStats = cache(getNetworkStats)

async function StatCard({title}) {
  const stats = await getCachedStats()

  return (
    <article className="card">
      {/* 标题、查询 ID、区块高度、Gas、节点数 */}
    </article>
  )
}

export default function StatsPage() {
  return (
    <div className="card-row">
      <StatCard title="概览" />
      <StatCard title="明细" />
    </div>
  )
}
```

</details>

<details>
<summary>提示 3 · 定位</summary>

- 缓存包装：`const getCachedStats = cache(getNetworkStats)`
- 取数据：`const stats = await getCachedStats()`
- 查询 ID 显示：`<code>{stats.queryId}</code>`
- 其余字段：`stats.blockHeight`、`stats.gasPrice`、`stats.peers`
- 导航：`<Link href="/exercise/stats">网络数据</Link>`

</details>

## 9. 自查

<details>
<summary>1. 为什么这里不用 useEffect 取数据？</summary>

数据在服务端组件渲染时就已经取好，浏览器只接收渲染后的 HTML。用 `useEffect` 取数据意味着先发空页面、到浏览器再请求，多一次往返，还要自己管理 loading 和错误状态。

</details>

<details>
<summary>2. 为什么两张卡片的查询 ID 相同？</summary>

它们调用的是同一个 `getCachedStats`，参数也相同。同一次请求内，`React.cache` 发现这个组合已经执行过，就直接返回上次的结果。

</details>

<details>
<summary>3. 刷新页面后 ID 为什么又变了？</summary>

`React.cache` 的生命周期只有一次请求。刷新产生新请求，缓存作用域重新开始，函数会重新执行。

</details>

<details>
<summary>4. React.cache 和 fetch 的 force-cache 是一回事吗？</summary>

不是。`React.cache` 只在一次请求内去重，不跨请求；`fetch(..., {cache: 'force-cache'})` 才是把结果存到多次请求之间。前者解决重复调用，后者解决重复请求。

</details>

<details>
<summary>5. 如果一张卡片查区块、另一张查节点列表，还能共享缓存吗？</summary>

不能。`React.cache` 以“函数 + 参数”区分缓存项；不同参数或不同函数就是不同的查询。

</details>

## 10. 完成后

告诉我一声，我会检查页面是否为 Server Component、两张卡片的 ID 是否一致、刷新后的行为、导航整理，然后进入 Lesson 14 · Route Handlers：编写 API。
