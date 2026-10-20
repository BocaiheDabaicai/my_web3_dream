# my_web3_dream

一个面向 Web3 的长期学习仓库。当前阶段先打牢 Web 前端基础，再进入链上数据与 Web3 应用开发。

当前模块：**Web Foundations** — React → Next.js → TypeScript → API 调用。

当前课程：[Lesson 03 · 事件处理与 useState](web-foundations/react-lab/src/lessons/lesson-03/README.md)

当前进度（2026-10-20）：Lesson 03 的讲义与 Demo 已完成，练习待完成。下次从 `lesson-03/Exercise.jsx` 的“区块脉冲”练习继续。

## 学习方式

每一课固定四个环节：

1. **示例**：我写一份可运行的代码，并讲清原理。
2. **理解**：对照浏览器效果与源码，弄懂概念和边界。
3. **练习**：你根据任务卡、接口契约与分级提示独立完成。
4. **复盘**：我审查代码、讲透问题，再进入下一课。

原则：核心代码由你自己写；卡住时先要提示，不直接抄答案。

## 课程路线

### 阶段一 · React（`web-foundations/react-lab`）

目标：掌握组件化思维、JSX、状态、副作用与组件复用。

- [x] 01 组件、JSX、Props、children 与组件组合
- [x] 02 条件渲染、列表渲染、key 与纯函数组件
- [ ] 03 事件处理与 useState（快照、批处理、更新函数）
- [ ] 04 表单、受控组件与状态提升
- [ ] 05 useReducer 与 Context
- [ ] 06 useEffect（依赖数组、清理函数、同步外部系统）
- [ ] 07 useRef 与 DOM 操作
- [ ] 08 自定义 Hook 与组件复用
- [ ] 09 综合练习：静态链上资产面板

### 阶段二 · Next.js（`web-foundations/next-lab`，后续创建）

目标：理解 App Router、服务端组件与全栈开发模式。

- [ ] 10 App Router：目录即路由、page 与 layout
- [ ] 11 Server Components 与 Client Components
- [ ] 12 动态路由、导航、loading 与 error
- [ ] 13 服务端数据获取与缓存基础
- [ ] 14 Route Handlers：编写 API
- [ ] 15 综合练习：链上资产面板 v2（mock 数据）

### 阶段三 · TypeScript

目标：为 React 与 Next.js 代码建立可靠的类型边界。

- [ ] 16 类型系统基础与类型收窄
- [ ] 17 interface、type、联合类型与泛型
- [ ] 18 React + TS：props、state、事件与 ref
- [ ] 19 Next.js + TS：路由参数、API 数据与严格模式
- [ ] 20 把 next-lab 迁移为 TypeScript

### 阶段四 · API 调用

目标：安全、稳定地消费真实数据。

- [ ] 21 HTTP、REST、JSON 与状态码
- [ ] 22 fetch、async/await、错误处理与 AbortController
- [ ] 23 客户端数据获取模式与自定义 Hook
- [ ] 24 Next.js 服务端请求、Route Handler 与密钥安全
- [ ] 25 综合练习：公开 API + 链上 JSON-RPC 数据面板

## 目录结构

```text
my_web3_dream/
├── README.md
└── web-foundations/
    ├── react-lab/       # 阶段一：React
    │   └── src/
    │       └── lessons/ # 每课的 demo、练习与讲义
    └── next-lab/        # 阶段二至四（后续创建）
```

## 运行 React Lab

依赖已安装。首次拉取仓库后执行：

```bash
cd web-foundations/react-lab
npm install
npm run dev
```

浏览器打开终端显示的地址（默认 `http://localhost:5173`）。

环境要求：Node.js 20.19+ 或 22.12+、npm 10+（当前验证环境：Node 24 / npm 11）。

## 学习记录

- 2026-10-20：完成 Lesson 01（组件、JSX、Props）和 Lesson 02（条件渲染、列表与 key）；Lesson 03（事件与 useState）已讲解并完成 Demo，练习待完成。

## 官方文档

- [React Learn](https://react.dev/learn)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [MDN：使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
