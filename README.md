# my_web3_dream

一个面向 Web3 的长期学习仓库。当前阶段先打牢 Web 前端基础，再进入链上数据与 Web3 应用开发。

当前模块：**Web Foundations** — React → Next.js → TypeScript → API 调用。

当前课程：[Lesson 09 · 综合练习：静态链上资产面板](web-foundations/react-lab/src/lessons/lesson-09/README.md)（进行中）

当前进度（2026-10-29）：Lesson 01–08 已完成并通过验收（交易池、链上监听台、链上终端、链上数据看板）。Lesson 09 综合练习进行中：M1 状态层已完成（四个 reducer action、selectSummary；网络切换、关注、总览验收通过），M2 交互层待完成（selectVisibleAssets、"/" 聚焦、添加资产表单）。

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
- [x] 03 事件处理与 useState（快照、批处理、更新函数）
- [x] 04 表单、受控组件与状态提升
- [x] 05 useReducer 与 Context
- [x] 06 useEffect（依赖数组、清理函数、同步外部系统）
- [x] 07 useRef 与 DOM 操作
- [x] 08 自定义 Hook 与组件复用
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

- 2026-10-20：完成 Lesson 01（组件、JSX、Props）和 Lesson 02（条件渲染、列表与 key）；Lesson 03（事件与 useState）完成讲义与 Demo。
- 2026-10-21：完成 Lesson 03 练习“区块脉冲”，掌握函数式更新、快照陷阱与不可变更新。
- 2026-10-21：开始 Lesson 04，完成讲义、受控表单 Demo、状态提升 Demo 与练习界面骨架。
- 2026-10-21：完成 Lesson 04 练习“交易预览台”，掌握受控输入、表单提交与状态提升。
- 2026-10-21：开始 Lesson 05，完成 useReducer 状态机 Demo、Context 钱包 Demo 与“交易池”练习骨架；练习停在起点，下次实现 `txReducer` 四个 action 并接上 dispatch。
- 2026-10-28：完成 Lesson 05 练习“交易池”（reducer 四个 action、dispatch 接线、验收全过）；开始 Lesson 06，完成 useEffect 讲义、Demo 与“链上监听台”练习骨架。
- 2026-10-28：完成 Lesson 06 练习“链上监听台”（定时器 cleanup、网络监听、标题同步，无头浏览器 24 项验收全过）；开始 Lesson 07，完成 useRef 讲义、Demo 与“链上终端”练习骨架。
- 2026-10-28：完成 Lesson 07 练习“链上终端”（useRef 聚焦/全选、日志哨兵自动滚动，验收全过）。下次开始 Lesson 08 · 自定义 Hook 与组件复用。
- 2026-10-29：开始 Lesson 08，完成自定义 Hook 讲义、Demo 与“链上数据看板”练习骨架（三个 Hook：useOnlineStatus、useBlockHeight、useDebouncedValue），等待练习。
- 2026-10-29：完成 Lesson 08 练习“链上数据看板”（三个自定义 Hook、多实例状态隔离、间隔切换清理、卸载重建、防抖重置，验收全过）。
- 2026-10-29：开始 Lesson 09 · 综合练习：静态链上资产面板，完成参考 Demo、UI 骨架与 M1–M3 三阶段任务卡（状态层、交互层、行情同步），等待练习。
- 2026-10-29：Lesson 09 M1 完成（reducer 四个 action、selectSummary；复盘不可变更新、map 回调返回值、switch case 作用域与 selector 纯函数；Ethereum 总览、网络切换、关注状态验收通过）。下次继续 M2：selectVisibleAssets、"/" 聚焦、添加资产表单。

## 官方文档

- [React Learn](https://react.dev/learn)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [MDN：使用 Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)
