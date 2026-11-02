# Lesson 10 · App Router：目录即路由

> 对应 Next.js 官方文档：
> [Routing Fundamentals](https://nextjs.org/docs/app/getting-started/project-structure) ·
> [Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) ·
> [Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)

## 一句话

文件夹决定网址：`page.jsx` 是这个网址的页面，`layout.jsx` 是一组页面共用的外壳。

## 先跑起来

```bash
cd web-foundations/next-lab
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。顶部导航里的 `Demo` 是我写的示例，`练习` 需要你自己建出来。

## 1. 四个概念

### 1.1 文件夹 = URL

```text
src/app/page.jsx                      → /
src/app/demo/page.jsx                 → /demo
src/app/demo/networks/page.jsx        → /demo/networks
```

规则：**一个文件夹只有放了 `page.jsx`，才会变成一个可访问的页面。**

### 1.2 page.jsx

一个路由的正文。文件必须叫 `page.jsx`，默认导出一个 React 组件。

```jsx
export default function DemoPage() {
  return <h1>我是 /demo 页面</h1>
}
```

### 1.3 layout.jsx

包住它所在文件夹和所有子页面的外壳。

- `src/app/layout.jsx` 是根布局，所有页面都套用它，必须有 `<html>` 和 `<body>`。
- `src/app/demo/layout.jsx` 只包住 `/demo`、`/demo/networks`、`/demo/about`。
- 子页面切换时，layout 不会重新挂载，所以导航会一直留在页面上。
- `children` 就是被包住的那个页面。

```jsx
export default function DemoLayout({children}) {
  return (
    <section>
      <nav>...</nav>
      {children}
    </section>
  )
}
```

### 1.4 Link

站内跳转用 `next/link` 的 `<Link>`，不要用 `<a>`。

```jsx
import Link from 'next/link'

<Link href="/demo/networks">去看网络页</Link>
```

`<Link>` 是客户端跳转：URL 会变，页面不会整页刷新。

## 2. Demo 在哪看

打开 `/demo`、`/demo/networks`、`/demo/about`，然后对照四个文件读一遍：

```text
src/app/layout.jsx            根布局：顶部导航
src/app/demo/layout.jsx       局部布局：Demo 的子导航
src/app/demo/page.jsx         /demo 页面
src/app/demo/networks/page.jsx  /demo/networks 页面
```

## 3. 练习任务卡

目标：在 `/exercise` 下从零做一个静态小站。**只要静态文字，不写状态、不取数据、不碰 Web3 逻辑。**

创建这四个文件：

| 文件 | 内容 |
| --- | --- |
| `src/app/exercise/layout.jsx` | 子导航：首页 / 区块 / 关于；下面渲染 `{children}` |
| `src/app/exercise/page.jsx` | 标题“练习首页”、一段说明、一个去 `/exercise/blocks` 的 Link |
| `src/app/exercise/blocks/page.jsx` | 标题“区块”、一个包含 3 个区块高度的 `<ul>` |
| `src/app/exercise/about/page.jsx` | 标题“关于”、一段说明 |

约束：

- 每个文件控制在 30 行以内。
- 不引入 `useState`、`useEffect`，不做数据请求。
- 站内跳转一律用 `<Link>`。
- 不要修改 `demo` 目录。

## 4. 验收

- [ ] 直接访问 `/exercise`、`/exercise/blocks`、`/exercise/about` 都能打开
- [ ] 三个页面共用同一套子导航；点击导航时 URL 变化、导航不消失
- [ ] 从地址栏直接打开 `/exercise/blocks` 也能正常显示
- [ ] 访问 `/exercise/foo` 显示 404
- [ ] 浏览器控制台无报错，`npm run build` 通过
- [ ] 四个文件都很短，能一眼看完

## 5. 分级提示

<details>
<summary>提示 1 · 概念</summary>

- 先在脑子里把 URL 画出来：`/exercise` → `exercise/page.jsx`，`/exercise/blocks` → `exercise/blocks/page.jsx`。
- 导航写在 `exercise/layout.jsx` 里，三个子页面自动共用；页面自己不写导航。
- `children` 就是当前子页面；layout 只负责外壳。

</details>

<details>
<summary>提示 2 · 结构</summary>

```jsx
// src/app/exercise/layout.jsx
import Link from 'next/link'

export default function ExerciseLayout({children}) {
  return (
    <>
      <nav className="sub-nav">
        <Link href="/exercise">首页</Link>
        <Link href="/exercise/blocks">区块</Link>
        <Link href="/exercise/about">关于</Link>
      </nav>
      {children}
    </>
  )
}
```

```jsx
// src/app/exercise/page.jsx
import Link from 'next/link'

export default function ExercisePage() {
  return (
    <div className="panel">
      <h2>练习首页</h2>
      <p>这是你自己创建的 /exercise 页面。</p>
      <Link className="button" href="/exercise/blocks">去看区块</Link>
    </div>
  )
}
```

</details>

<details>
<summary>提示 3 · 区块页</summary>

```jsx
// src/app/exercise/blocks/page.jsx
export default function BlocksPage() {
  return (
    <div className="panel">
      <h2>区块</h2>
      <ul>
        <li>#21,000,001</li>
        <li>#21,000,002</li>
        <li>#21,000,003</li>
      </ul>
    </div>
  )
}
```

</details>

## 6. 自查

<details>
<summary>1. 为什么 /demo/networks 需要 networks 文件夹里有一个 page.jsx？</summary>

Next.js 用文件夹路径拼出 URL；只有带 `page.jsx` 的文件夹才会成为可访问路由，否则只是普通文件夹。

</details>

<details>
<summary>2. page.jsx 和 layout.jsx 的分工是什么？</summary>

`page.jsx` 是某个网址独有的正文；`layout.jsx` 是一组网址共用的外壳。切子页面时 layout 保持挂载，page 被替换。

</details>

<details>
<summary>3. 为什么站内跳转用 Link，而不是 a？</summary>

`<Link>` 做客户端跳转：只替换需要变化的部分，不整页刷新；`<a>` 会让浏览器重新加载整个文档。

</details>

## 7. 完成后

告诉我一声，我检查文件位置、布局嵌套和 Link 跳转，然后进入 Lesson 11 · Server Components 与 Client Components。
