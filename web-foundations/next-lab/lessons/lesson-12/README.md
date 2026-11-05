# Lesson 12 · 动态路由、导航、loading 与 error

> 对应 Next.js 官方文档：
> [Dynamic Route Segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) ·
> [loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading) ·
> [error.js](https://nextjs.org/docs/app/api-reference/file-conventions/error) ·
> [Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)

## 一句话

把会变化的地址段写成方括号文件夹，就得到动态路由；同目录再放 `loading.jsx` 和 `error.jsx`，加载和出错都有兜底。

## 1. 动态路由

区块详情不可能是无数个固定文件夹，所以用 `[height]` 占位：

```text
src/app/demo/blocks/[height]/page.jsx

/demo/blocks/21000001  → params = { height: '21000001' }
/demo/blocks/999       → params = { height: '999' }
```

方括号里的名字就是参数名。地址里对应的那一段会被抓出来，交给页面的 `params` prop。

**Next.js 16 的 `params` 是 Promise，页面必须 `async` 并 `await`：**

```jsx
export default async function BlockPage({params}) {
  const {height} = await params
  return <p>当前高度：{height}</p>
}
```

- 捕获到的值永远是字符串，例如 `'21000001'`，不是数字。
- 旧教程里直接 `params.height` 的写法属于 Next.js 14 及以前；当前版本要 `await`。
- 只有一个方括号段就够用；`[...slug]` 这类 catch-all 以后再学。

## 2. loading.jsx

在 `page.jsx` 旁边放一个 `loading.jsx`，Next.js 会自动用 `<Suspense>` 包住这个页面：

```jsx
export default function Loading() {
  return <p>加载中…</p>
}
```

- 页面渲染慢时，先显示 `loading.jsx`，渲染完再自动替换。
- 它**不接收 props**，所以拿不到 `params.height`。所有子路径共用这一份加载界面。
- 文件名固定，必须和页面在同一个目录。

## 3. error.jsx

在同一个目录再放 `error.jsx`，页面渲染过程中抛出的错误会落到这个界面：

```jsx
'use client'

export default function Error({error, retry}) {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={() => retry()}>重试</button>
    </div>
  )
}
```

- 第一行必须是 `'use client'`，错误边界本身是客户端组件。
- 接收两个 props：`error`（抛出的错误）和 `retry`（重新渲染这段路由）。
- 当前 Next.js 16 主推 `retry`；旧教程里的 `reset` 是另一层行为（只清错误状态，不重新取数据）。
- 只接住**渲染期间**的错误。事件处理函数里的 `throw` 不会被它接住。
- 生产环境里，服务端错误的 `message` 会被替换成通用文案，细节看服务端日志。

## 4. 导航

动态地址也是普通地址，`<Link>` 照常使用：

```jsx
<Link href="/demo/blocks/21000001">区块 #21000001</Link>
<Link href={`/demo/blocks/${height}`}>区块 #{height}</Link>
```

- 站内跳转继续用 `next/link`，不要用 `<a>`。
- 父级 `layout.jsx` 不会卸载，所以子导航在详情页里仍然在。

## 5. Demo

打开 `/demo/blocks`，然后对照这四个文件：

```text
src/app/demo/blocks/page.jsx              列表，链接到每个区块
src/app/demo/blocks/[height]/page.jsx     动态页，await params
src/app/demo/blocks/[height]/loading.jsx  加载界面，没有 props
src/app/demo/blocks/[height]/error.jsx    'use client'，error + retry
```

观察顺序：

1. 从列表点进任意区块。因为页面故意等了 1.2 秒，会先看到 `loading.jsx`。
2. 加载结束后，高度、Hash、交易数出现。
3. 直接访问 `/demo/blocks/999`，会看到页面自己的“没有区块”分支。
4. 点列表底部的“区块 #0”，页面在渲染时抛错，显示 `error.jsx`；点“重试”仍会失败，因为参数还是 `0`。

## 6. 练习任务卡

目标：把 `/exercise/blocks` 升级成可以点进详情的动态路由，并补上 loading 和 error。四个文件都很小。

### 6.1 给列表加链接

修改 `src/app/exercise/blocks/page.jsx`：

- 三个 `<li>` 里的数字分别链接到 `/exercise/blocks/21000001`、`/exercise/blocks/21000002`、`/exercise/blocks/21000003`。
- 用 `<Link>`，文字可以保留 `#21,000,001` 这种格式。

### 6.2 新建动态页

新建 `src/app/exercise/blocks/[height]/page.jsx`：

- 默认导出 `async function`，从 props 取 `params`，并 `await` 出 `height`。
- 使用下面的数据（直接抄进文件）：

```js
const BLOCKS = {
  '21000001': {hash: '0xa1c4f3', txs: 12},
  '21000002': {hash: '0xb2d5a8', txs: 8},
  '21000003': {hash: '0xc3e6b1', txs: 21},
}
```

- 如果 `height === 'boom'`，抛出一个错误，例如 `throw new Error('区块读取失败')`。
- 然后等待 1.5 秒，让 `loading.jsx` 能被看见：

```js
await new Promise((resolve) => setTimeout(resolve, 1500))
```

- 用 `BLOCKS[height]` 查数据：
  - 查得到：显示区块高度、Hash、交易数，并放一个返回 `/exercise/blocks` 的 `<Link>`。
  - 查不到：显示“没有区块 #height”和返回链接，不要抛错。

### 6.3 新建 loading.jsx

新建 `src/app/exercise/blocks/[height]/loading.jsx`：

- 一个没有 props 的默认导出组件。
- 显示“区块加载中…”之类的文字即可。
- 不要尝试读取 `params`。

### 6.4 新建 error.jsx

新建 `src/app/exercise/blocks/[height]/error.jsx`：

- 第一行 `'use client'`。
- 接收 `{error, retry}`。
- 显示 `error.message`，并提供“重试”按钮，点击调用 `retry()`。

## 7. 接口契约

| 地址 | 结果 |
| --- | --- |
| `/exercise/blocks/21000001` | `params` 为 `Promise<{height: '21000001'}>`，渲染详情 |
| `/exercise/blocks/999` | 渲染“没有区块 #999”，不报错 |
| `/exercise/blocks/boom` | 渲染期间抛错，显示 `error.jsx` |

| 文件 | 要求 |
| --- | --- |
| `page.jsx` | `async` 函数，`const {height} = await params` |
| `loading.jsx` | 默认导出，无 props |
| `error.jsx` | 首行 `'use client'`，props 为 `{error, retry}` |

## 8. 验收

- [ ] `/exercise/blocks` 的三个数字可以点击，跳到对应详情
- [ ] 直接访问 `/exercise/blocks/21000001` 也能看到详情
- [ ] 进入详情时先看到 loading 界面，约 1.5 秒后变成区块内容
- [ ] `/exercise/blocks/999` 显示“没有区块 #999”，页面不崩
- [ ] `/exercise/blocks/boom` 显示 error 界面；点“重试”仍然失败
- [ ] `error.jsx` 第一行是 `'use client'`
- [ ] 详情页里子导航仍然存在，`npm run build` 通过

## 9. 分级提示

<details>
<summary>提示 1 · 概念</summary>

- 会变的地址段 → 方括号文件夹；参数名和括号里的名字一致。
- `params` 是 Promise：`async` 组件里 `await params`，再解构。
- `loading.jsx` 和 `error.jsx` 放在 `page.jsx` 同一目录，文件名固定。
- loading 没有 props；error 是客户端组件，拿 `error` 和 `retry`。

</details>

<details>
<summary>提示 2 · 结构</summary>

```jsx
// exercise/blocks/page.jsx（只改 li 里的内容）
<li>
  <Link href="/exercise/blocks/21000001">#21,000,001</Link>
</li>
```

```jsx
// exercise/blocks/[height]/page.jsx
import Link from 'next/link'

const BLOCKS = {
  // 任务卡里的三个区块
}

export default async function BlockDetailPage({params}) {
  // 1. 从 params 取 height
  // 2. boom 时 throw
  // 3. 等 1500ms
  // 4. 查 BLOCKS[height]
  // 5. 找不到 / 找得到，各 return 一段 JSX
}
```

```jsx
// exercise/blocks/[height]/loading.jsx
export default function Loading() {
  // 纯静态文字
}
```

```jsx
// exercise/blocks/[height]/error.jsx
'use client'

export default function Error({error, retry}) {
  // 显示 error.message + 重试按钮
}
```

</details>

<details>
<summary>提示 3 · 定位</summary>

- 取参数：`const {height} = await params`
- 触发错误（放在等待之前）：
  ```js
  if (height === 'boom') {
    throw new Error('区块读取失败')
  }
  ```
- 模拟慢请求：
  ```js
  await new Promise((resolve) => setTimeout(resolve, 1500))
  ```
- 查数据：`const block = BLOCKS[height]`，然后 `if (!block)` 走找不到的分支。
- 重试按钮：`onClick={() => retry()}`

</details>

## 10. 自查

<details>
<summary>1. 为什么页面必须 async 并 await params？</summary>

当前版本把 `params` 设计成 Promise。直接读 `params.height` 拿到的是 Promise 上的属性，不是值。`await` 之后才是真正的 `{height: '...'}`。

</details>

<details>
<summary>2. loading.jsx 能不能显示当前区块高度？</summary>

不能。它不接收 props，是整段路由共用的兜底界面。需要参数的话，得在页面内部用 `<Suspense>` 自己拆，或者到客户端组件里用 `useParams()`。

</details>

<details>
<summary>3. error.jsx 为什么必须写 'use client'？</summary>

错误边界是 React 的客户端能力，要接住渲染错误并在浏览器里显示兜底 UI，所以必须是 Client Component。

</details>

<details>
<summary>4. 为什么点“重试”之后 boom 页面还是错误？</summary>

`retry()` 会重新渲染同一段路由，但地址还是 `/exercise/blocks/boom`，页面又执行到同一个 `throw`，所以继续失败。重试适合临时性错误，例如网络抖动。

</details>

<details>
<summary>5. 按钮 onClick 里抛错，会被 error.jsx 接住吗？</summary>

不会。错误边界只接住渲染期间抛出的错误；事件处理函数里的异常需要自己 `try/catch`。

</details>

## 11. 完成后

告诉我一声，我会检查四个文件、从列表跳转、loading 的出现时机、`/999` 和 `/boom` 两个分支，然后进入 Lesson 13 · 服务端数据获取与缓存基础。
