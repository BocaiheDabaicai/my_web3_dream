# Lesson 11 · Server Components 与 Client Components

> 对应 Next.js 官方文档：
> [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

## 一句话

App Router 里的组件默认在服务端执行；需要状态或点击事件的文件，第一行加 `'use client'`。

## 1. 两种组件

### Server Component（默认）

普通函数组件就是 Server Component，不需要任何指令。

- 在服务端执行，可以读取服务端信息，例如 `process.version`。
- 不能使用 `useState`、`useEffect`、`onClick`。
- 适合放静态内容、读取数据、渲染页面骨架。

### Client Component

在文件第一行写 `'use client'`。

```jsx
'use client'

import {useState} from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

- 可以使用 state、Effect、事件处理函数。
- 会被打包送到浏览器，负责交互。

### 怎么选

先默认用 Server Component；只有“需要点击、输入、状态变化”的那一小块，才拆成 Client Component。

## 2. Demo

打开 `/demo/server-client`，对照两个文件：

```text
src/app/demo/server-client/page.jsx       没有指令 → Server Component
src/app/demo/server-client/Counter.jsx    第一行 'use client' → Client Component
```

页面里的 Node 版本由服务端渲染；下面的点赞按钮由客户端组件处理点击。

## 3. 练习任务卡

目标：做一个只有“标题 + 点赞按钮”的页面。**两个文件，每个不超过 20 行。**

1. 新建 `src/app/exercise/server-client/page.jsx`：
   - 不写 `'use client'`。
   - 显示标题“Server / Client”、一段说明，并渲染 `<LikeButton />`。
2. 新建 `src/app/exercise/server-client/LikeButton.jsx`：
   - 第一行 `'use client'`。
   - 用 `useState` 保存点赞数，初始 0。
   - 一个按钮，文字“点赞 +1”，点击后数量加一。
3. 在 `src/app/exercise/layout.jsx` 的子导航里加一条指向 `/exercise/server-client` 的 Link，文字用“Server/Client”。

约束：不取数据、不写其它逻辑，只用 `useState`。页面文件保持 Server Component，不要在 page.jsx 里加 `'use client'`。

## 4. 验收

- [ ] 直接访问 `/exercise/server-client` 能打开
- [ ] 子导航新增的链接能跳转，导航保持
- [ ] 页面文件没有 `'use client'`，按钮文件有
- [ ] 点击按钮，数字从 0 变 1、再点变 2
- [ ] 浏览器控制台无报错，`npm run build` 通过

## 5. 分级提示

<details>
<summary>提示 1 · 概念</summary>

- 问自己：这个文件里有没有 `useState` 或 `onClick`？有 → 第一行加 `'use client'`；没有 → 保持默认。
- page.jsx 只负责标题和说明，按钮拆到 LikeButton.jsx。
- page.jsx 可以直接 `import LikeButton from './LikeButton'`。

</details>

<details>
<summary>提示 2 · 结构</summary>

```jsx
// LikeButton.jsx
'use client'

import {useState} from 'react'

export default function LikeButton() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>点赞数：{count}</p>
      <button
        className="button"
        type="button"
        onClick={() => setCount((current) => current + 1)}
      >
        点赞 +1
      </button>
    </div>
  )
}
```

```jsx
// page.jsx
import LikeButton from './LikeButton'

export default function ServerClientPage() {
  return (
    <div className="panel">
      <h2>Server / Client</h2>
      <p>这个页面是 Server Component，按钮是 Client Component。</p>
      <LikeButton />
    </div>
  )
}
```

</details>

<details>
<summary>提示 3 · 导航</summary>

在 `exercise/layout.jsx` 的 `nav` 里加一行：

```jsx
<Link href="/exercise/server-client">Server/Client</Link>
```

</details>

## 6. 自查

<details>
<summary>1. 为什么 page.jsx 不需要 'use client'？</summary>

它没有使用 state、Effect 或事件处理函数，只渲染静态内容，默认当 Server Component 即可。

</details>

<details>
<summary>2. 如果把 LikeButton.jsx 的 'use client' 删掉会怎样？</summary>

`useState` 不能在 Server Component 里使用，构建或运行时会报错。指令告诉 Next.js：这个文件及其导入内容需要进入客户端。

</details>

<details>
<summary>3. 点击按钮后，页面是重新请求服务器才更新的吗？</summary>

不是。点赞数保存在客户端组件的 state 里，点击只更新这一小块 UI。

</details>

## 7. 完成后

告诉我一声，我检查两个文件、点击行为和导航，然后进入 Lesson 12 · 动态路由与导航。
