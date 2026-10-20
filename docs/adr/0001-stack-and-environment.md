# ADR-0001 · 技术栈与环境基线

- **状态**：Accepted
- **日期**：2026-10-20
- **背景**：从企业前端转向 AI + Web3 应用工程师，完成一个只读的链上智能分析助手，同时系统学习链上数据、Agent、MCP、PostgreSQL 与部署。

## Context

已验证的环境：Windows 10，Node 24，Python 3.13，无 Docker/WSL2/Foundry/本地 PostgreSQL；PyPI、Docker Hub、Etherscan、公共 Blockscout 不可直连；Routescan、Sourcify、PublicNode、1RPC、dRPC 可直连。后续可能切换到 MacBook Pro（Apple Silicon）。

项目需要同时满足：学习深度、可公开展示、只读安全边界、跨平台可运行。

## Decisions

### D1 · 链上工具与 Agent 都放在 Python 后端

`apps/api` 负责 JSON-RPC 访问、ABI 编解码、工具定义、Agent 循环与数据持久化。v1 不引入独立的 TypeScript 链上服务，避免双运行时、Schema 同步与进程守护成本。

**收益**：单一数据源；可以直接学习 JSON-RPC/ABI 的底层细节；部署简单。  
**代价**：少了一个“TS Web3 服务”的作品亮点；用 viem labs 与前端练习补足。

### D2 · viem 放在 labs，产品链路不重复实现

C1 用 viem 完成钱包、签名、区块、余额、回执与日志实验，保持对主流 Web3 TS 生态的熟悉度。生产链路只保留 Python 工具层，避免同一数据两套实现。

### D3 · 数据源：RPC + Routescan + Sourcify

- 状态与调用：RPC（PublicNode/1RPC 主网，dRPC Sepolia）。
- 交易历史/代币转账：Routescan（Etherscan 兼容 API）。
- 源码验证：Sourcify。

Etherscan 与公共 Blockscout 当前不可达，不作为依赖。所有数据访问走 `ChainDataProvider` 抽象，允许后续替换供应商。

**风险**：Routescan 无 SLA；必须限流、缓存、超时与失败降级。

### D4 · MCP 后置为同仓库独立进程

C5 先用普通 function calling 验证工具与循环；C6 用 FastMCP 将同一批 handler 暴露为 MCP server，Agent 通过 MCP client 调用。独立进程，便于理解协议边界，也方便后续容器化。

### D5 · 前端使用 Next.js + TypeScript

虽然现有主力是 Vue，但 Web3 前端生态（viem、wagmi 等）与招聘信号更偏 React/Next。采用 App Router，界面从 C2 开始以纵向切片方式生长。

### D6 · PostgreSQL 为唯一持久化；Docker 先探测

会话、审计、缓存与评测记录都进 PostgreSQL，不先用 SQLite 过渡，避免迁移幻觉。C0 探测 Docker/WSL2 可行性：

1. WSL2 + Docker Desktop；
2. WSL2 + Docker Engine；
3. 远程 Docker（阿里云）；
4. 本机 PostgreSQL 回退。

无论哪条路，C9 都要在阿里云服务器上完成一次容器化部署。

### D7 · 合约工具链使用 Hardhat

Windows 原生没有 Foundry，且 WSL2 尚未安装。C4 使用 Hardhat + TypeScript，跨平台稳定；WSL 就绪后可以用 Foundry 做一次对照实验。

### D8 · 检查点驱动，核心代码由学习者完成

不设日期与小时数。每个检查点以「可运行代码 + 测试 + 笔记 + devlog + 口头复述 + 破坏任务」过关。脚手架与工具链由助手完成，核心逻辑由学习者实现并接受 Review。

### D9 · 跨平台约定

Windows 与 macOS 都要能跑：LF 换行（`.gitattributes`）、Python 脚本而不是 shell-only、路径使用 `pathlib`、Docker 镜像使用多架构、文档给出双平台命令。避免依赖 Windows 专有 API 或硬编码路径。

## Consequences

- 项目结构简单，学习焦点在链上数据、Agent 与工程化，而不是多服务编排。
- 链上数据供应商风险被隔离在 provider 层。
- 没有 Docker 时仍可推进 C1/C2；C3 前必须解决数据库运行环境。
- 作品集里“多 Agent 系统”由已有的 TriCore 承担，本项目专注“链上数据 + 可审计 Agent”。

## Alternatives considered

- **全 TypeScript（Next.js + viem + AI SDK）**：交付最快，但 Python/FastAPI/Postgres 的深度目标无法满足，且与已有作品重复。
- **独立 TS 链上服务 + Python Agent**：边界清晰，但 v1 复杂度高；等有明确性能或复用需求再拆分。
- **SQLite 起步**：降低环境门槛，但会掩盖 PostgreSQL 的学习目标，且审计/缓存/并发场景差异大。
- **Foundry 优先**：更贴近专业 Solidity 工作流，但当前 Windows 环境不可用；Hardhat 足够完成学习目标。

## Follow-ups

- C0：完成环境探测并记录 Docker 决策。
- C3：实现 provider 抽象、缓存与 finality 处理。
- C6：评估 MCP transport（stdio vs HTTP）。
- C9：在阿里云服务器完成容器化部署，补足 Docker 深度。
- 切到 Mac 后：重新验证 Python 3.13 arm64 依赖、Docker 镜像与脚本。
