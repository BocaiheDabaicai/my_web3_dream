# Lesson 01 · 组件、JSX 与 Props

> 对应 React 官方文档：
> [Your First Component](https://react.dev/learn/your-first-component) ·
> [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components) ·
> [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) ·
> [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) ·
> [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)

## 一句话

React 用**组件**描述界面：组件是返回 JSX 的 JavaScript 函数，数据通过 **props** 从父组件流向子组件。

## 本课五个核心认知

1. React 应用是一棵组件树。
2. 组件是返回 JSX 的函数，名字必须大写开头。
3. JSX 是 JavaScript 的语法扩展，不是 HTML 字符串。
4. props 是父组件传入的只读数据。
5. `children` 让组件能够包裹任意内容，是组件组合的基础。

本课只处理**静态界面**。状态、事件、条件渲染、列表和副作用都会在后面的课程出现。

## 1. 页面是怎么跑起来的

```text
index.html
└─ <div id="root">             浏览器里预留的挂载点
   └─ src/main.jsx              createRoot(...).render(<App />)
      └─ src/App.jsx            根组件
         └─ 组件树
```

`main.jsx` 只做一件事：找到 `#root`，把根组件渲染进去。

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`<App />` 看起来像 HTML 标签，实际是调用 `App` 这个函数，把它返回的 JSX 交给 React 渲染。

> **关于 StrictMode**：开发环境下，它会故意把组件函数多调用一次，用来暴露不纯的代码。页面不会因此重复显示，现在不用管它；第 6 课讲 `useEffect` 时会再次遇到。

## 2. 组件：返回 JSX 的函数

```jsx
function Avatar({ src, alt, size = 84 }) {
  return <img src={src} alt={alt} width={size} height={size} />
}
```

拆开看：

- 函数名 `Avatar` 大写开头：React 只有看到大写标签，才会把它当作组件。
- 返回值是 JSX：这个组件要渲染的内容。
- 参数解构 `{ src, alt, size = 84 }`：从 props 取值，并给 `size` 一个默认值。

组件可以像 HTML 标签一样使用：

```jsx
<Avatar src="/avatar.svg" alt="林舟的头像" />
```

渲染过程可以粗略理解为：

```text
数据（props / state）
        ↓
   组件函数执行
        ↓
    返回 JSX
        ↓
  React 更新 DOM
```

本课的数据只有 props，所以组件是“纯”的：同样的 props，得到同样的 JSX。

### 命名规则

- 大写开头（PascalCase）：React 认为是组件。
- 小写开头：React 认为是原生 HTML 标签，比如 `<div>`。
- 一个文件可以有多个组件。小组件放一起便于阅读；生产代码通常一个文件一个主组件。

### 文件与导入导出

```jsx
// Demo.jsx
export default function Lesson01Demo() {
  return <h1>Hello</h1>
}
```

```jsx
// App.jsx
import Lesson01Demo from './lessons/lesson-01/Demo'
```

`export default` 对应默认导入；`export function Badge()` 对应命名导入 `{ Badge }`。本课 Demo 文件内部还有 `Avatar`、`Tag`、`Card` 三个辅助组件，它们没有单独导出。

Vite 使用现代 JSX 转换，写 JSX **不需要**在文件顶部 `import React`。

## 3. JSX：在 JavaScript 里写界面

JSX 不是 HTML。它会被编译成 JavaScript 函数调用，所以它遵循 JavaScript 的规则。

### 3.1 只能返回一个根节点

错误：

```jsx
return (
  <h1>标题</h1>
  <p>内容</p>
)
```

正确：用 Fragment 包起来。

```jsx
return (
  <>
    <h1>标题</h1>
    <p>内容</p>
  </>
)
```

Fragment `<>...</>` 不会在 DOM 里产生额外的节点。

### 3.2 `{}` 里放 JavaScript 表达式

```jsx
const name = '林舟'
const size = 84

<h3>{name}</h3>
<img width={size} />
<span>{2 + 2}</span>
<span>{name.toUpperCase()}</span>
```

`{}` 里是**表达式**（有返回值），不能直接写 `if`、`for` 这类语句。条件与列表会在下一课专门讲。

### 3.3 属性名与 HTML 不同

| HTML | JSX |
| --- | --- |
| `class="tag"` | `className="tag"` |
| `for="email"` | `htmlFor="email"` |
| `style="color: red"` | `style={{ color: 'red' }}` |
| `onclick="..."` | `onClick={...}` |

`style` 的两层大括号：外层是 JSX 表达式，内层是 JavaScript 对象。

### 3.4 标签必须闭合

```jsx
<img src="/avatar.svg" alt="头像" />
<input type="text" />
<br />
```

### 3.5 字符串与表达式

```jsx
<Tag>React</Tag>              // 直接写文字
<Tag>{language}</Tag>         // 变量
<Tag>{`${a} + ${b}`}</Tag>    // 模板字符串
```

属性也一样：

```jsx
<Avatar alt="林舟的头像" />    // 字符串
<Avatar alt={userName} />     // 表达式
```

### 3.6 注释

```jsx
{/* 这是 JSX 里的注释 */}
```

### 3.7 安全

React 会转义 `{}` 里的文本，默认避免把用户输入当成 HTML 执行。不要为了偷懒使用 `dangerouslySetInnerHTML`，除非你非常确定内容安全。

## 4. Props：从父组件传入数据

```jsx
<Avatar src="/avatar.svg" alt="林舟的头像" size={96} />
```

```jsx
function Avatar({ src, alt, size = 84 }) {
  return <img src={src} alt={alt} width={size} height={size} />
}
```

需要记住三件事：

1. **只读**：子组件不能修改 props。会变化的数据属于 state（第 3 课）。
2. **任意类型**：字符串、数字、布尔、对象、数组、函数、JSX 都能传。
3. **向下流动**：父 → 子。子组件想通知父组件，需要回调函数（第 3 课）。

默认值通过解构赋值：

```jsx
function Tag({ tone = 'default', children }) {
  ...
}
```

## 5. children 与组件组合

写在组件标签中间的内容，会作为 `children` 传入：

```jsx
<Card title="成员资料">
  <p>这里的内容就是 children。</p>
</Card>
```

```jsx
function Card({ title, children }) {
  return (
    <article>
      <h2>{title}</h2>
      <div>{children}</div>
    </article>
  )
}
```

`Card` 不需要知道里面具体是什么，只负责布局；内容由使用它的人决定。这就是组件组合。

Vue 的 `slot` 与此最接近。区别是 Vue 还提供具名插槽和作用域插槽；React 用“普通 prop”和“函数 prop”实现类似能力。

### JSX 也能作为普通 prop 传入

```jsx
<Card title="成员资料" footer={<small>更新于今天</small>} />
```

```jsx
function Card({ title, footer, children }) {
  return (
    <article>
      <h2>{title}</h2>
      <div>{children}</div>
      <footer>{footer}</footer>
    </article>
  )
}
```

## 6. 与 Vue 对照

| Vue | React |
| --- | --- |
| `.vue` 单文件组件 | 函数组件 + 普通 CSS |
| `<template>` | JSX |
| `props` | `props`（同样只读、单向） |
| `slot` | `children` / JSX prop |
| `v-if` | 条件表达式（第 2 课） |
| `v-for` | `array.map()`（第 2 课） |
| `ref` / `reactive` | `useState`（第 3 课） |
| `watch` / `onMounted` | `useEffect`（第 6 课） |

你的 Vue 经验在组件拆分、props、单向数据流上可以直接迁移。真正需要重新建立的是 **JSX 的表达方式**和后续 **state / 渲染**的心智模型。

## 7. 练习任务卡

### 背景

你在为“链上研究小组”做成员介绍区。需要把设计里的卡片组件化，供以后复用。

### 目标

打开 `Exercise.jsx`，实现三个组件，并用它们渲染两张成员卡：

- `Badge`：状态徽章。
- `Panel`：带小标题的面板，通过 `children` 放内容。
- `MemberCard`：成员卡，内部使用 `Badge`。

### 使用的数据

1. 林舟 / Frontend Engineer / Shanghai / 开放合作（success）/ “正在把 Vue 的经验迁移到 React，目标是能独立做链上数据面板。”
2. Maya Chen / Protocol Researcher / Remote / 专注中（warning）/ “研究 L2 状态增长与数据可用性，喜欢把复杂问题画成图。”

### 接口契约

**Badge**

```text
Badge({ children, tone = 'default' })
tone: 'default' | 'success' | 'warning'
渲染：<span className="badge badge--{tone}">{children}</span>
```

**Panel**

```text
Panel({ kicker, title, children })
结构：section.panel
  ├─ p.panel__kicker   ← kicker
  ├─ h2                ← title
  └─ div.panel__body   ← children
```

**MemberCard**

```text
MemberCard({ name, role, location, status, statusTone, intro })
结构：article.member
  ├─ div.member__avatar       ← name 的第一个字符
  └─ div.member__content
       ├─ div.member__head    ← h3(name) + Badge
       ├─ p.muted             ← role · location
       └─ p.member__intro     ← intro
```

**Lesson01Exercise 根组件**

用 `Panel` 包住两个 `MemberCard`。`kicker` 用 `TEAM`，`title` 用“链上研究小组”。

### 验收标准

- [ ] 页面出现一个面板，面板内有两张成员卡。
- [ ] 所有成员文字都来自 props，组件内部没有写死某个人。
- [ ] 修改 `tone` 后徽章颜色随之变化。
- [ ] `Panel` 和 `Badge` 都通过 `children` 接收内容。
- [ ] 两张卡复用同一个 `MemberCard` 组件，没有复制两遍结构。
- [ ] 浏览器控制台无报错，`npm run build` 通过。
- [ ] 暂时不要使用 `map`，下一课再做列表。

### 分级提示

<details>
<summary>提示 1 · 概念</summary>

- JSX 里 class 要写 `className`。
- 拼接类名用模板字符串，把 `tone` 拼进 `badge--` 后面。
- `children` 不需要手动传，写在标签中间的内容会自动进入 props。
- 解构参数时可以直接写默认值，例如 `tone = 'default'`。

</details>

<details>
<summary>提示 2 · 结构</summary>

1. 先写 `Badge`，它最小，只有一个 `<span>`。
2. 再写 `Panel`，把 kicker、title、children 放到对应位置。
3. 写 `MemberCard` 时，把 `status` 和 `statusTone` 传给 `Badge`；头像圈里用 `{name.charAt(0)}` 显示首字。
4. 最后回到 `Lesson01Exercise`，删除占位内容，改为 `<Panel>` 包住两个 `<MemberCard />`。

</details>

<details>
<summary>提示 3 · 局部示例</summary>

`Badge` 的完整实现如下。`Panel` 和 `MemberCard` 请自己完成：

```jsx
export function Badge({ children, tone = 'default' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}
```

</details>

### 完成后

保存文件，回到对话告诉我“第一课完成”。我会检查代码、指出问题，通过后再进入第二课。

## 8. 自查问题

<details>
<summary>1. 为什么组件名必须大写开头？</summary>

JSX 编译时，小写标签会被当作字符串类型的原生元素（如 `'div'`），大写标签会被解析为作用域里的组件变量。`<avatar />` 会被当成不存在的 HTML 标签，而不是你的组件。

</details>

<details>
<summary>2. children 是从哪里来的？</summary>

父组件写在子组件标签中间的内容。React 会把它放进 props.children，子组件通过 `{children}` 渲染出来。

</details>

<details>
<summary>3. Vue 的 &lt;slot&gt; 在 React 里最接近什么？</summary>

`children`，或者把一段 JSX 作为普通 prop 传入。Vue 的具名插槽和作用域插槽需要更复杂的 React 模式来对应，后面会在组件复用课程里展开。

</details>
