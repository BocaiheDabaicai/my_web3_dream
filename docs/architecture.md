# 架构

> 状态：C0 进行中。脚手架已就绪，链上读取纵切由学习者在 C0 实现；其余组件随检查点逐步加入。  
> 决策记录见 [ADR-0001](adr/0001-stack-and-environment.md)。

## 目标

- 用户用自然语言询问地址、交易、代币与合约，得到**可追溯**的分析结果。
- 每个事实都能回到工具调用、数据源与区块高度。
- 严格只读：没有签名、交易发送、私钥或资金操作。
- 用一条真实链路练习 AI + Web3 工程能力：数据获取、工具设计、Agent 编排、评测、部署。

## 非目标（v1）

链上写入、钱包连接、自动交易、自建索引器、多链扩展、多用户权限体系、RAG、代理合约/字节码分析、投资建议。

## 组件

```
                    ┌─────────────────────────────┐
                    │  apps/web (Next.js + TS)     │
                    │  chat · address dashboard    │
                    └──────────────┬──────────────┘
                                   │ HTTP / SSE
                    ┌──────────────▼──────────────┐
                    │  apps/api (FastAPI)         │
                    │  · chat / SSE               │
                    │  · agent loop (DeepSeek)    │
                    │  · tool gateway             │
                    │  · audit + cache (Postgres) │
                    │  · MCP client               │
                    └───────┬─────────────┬───────┘
                            │             │
                  PostgreSQL│             │ MCP
                            │             ▼
                            │   ┌─────────────────────────┐
                            │   │ MCP server (FastMCP)   │
                            │   │ separate process       │
                            │   └────────────┬────────────┘
                            │                │
                            │   ┌────────────▼────────────┐
                            │   │ chain tools (Python)    │
                            │   │ httpx · eth-abi · EIP-55│
                            │   └───────┬─────────┬───────┘
                            │           │         │
                            │     JSON-RPC     Routescan
                            │     (state)      (indexed history)
                            │
                    ┌───────▼─────────────────────┐
                    │ Postgres: conversations,    │
                    │ messages, tool_calls, cache │
                    └─────────────────────────────┘
```

### 前端 `apps/web`

- Next.js App Router + TypeScript。
- 负责输入、流式渲染、地址概览、交易时间线、代币表、工具调用轨迹与引用。
- 不直接接触私钥，不直接调用链上写入接口。

### 后端 `apps/api`

- FastAPI：HTTP、SSE、输入校验、限流。
- Agent：DeepSeek（OpenAI 兼容）工具调用循环，限制迭代次数与超时。
- Tool gateway：只读白名单、参数校验、超时、缓存、审计。
- PostgreSQL：会话、消息、工具调用审计、缓存、评测记录。

### MCP 层

- C5 先实现普通 function calling；C6 用 FastMCP 将同一批 handler 暴露为 MCP 工具。
- MCP server 与 API 使用同一仓库代码、独立进程运行（本地 stdio 或 HTTP），形成真实协议边界。
- 这样既满足「Agent + MCP」的目标，又不引入第二套语言运行时。

### 链上工具 `apps/api/app/chain`

- 直接 JSON-RPC（`eth_blockNumber`、`eth_getBalance`、`eth_call`、`eth_getLogs` 等）。
- 手动 ABI 编解码（`eth-abi`），理解 calldata 与 event logs。
- 地址校验与 EIP-55 校验和。
- `ChainDataProvider` 抽象：RPC 与 Routescan 可替换；不让业务代码依赖具体供应商。

## 一次查询的数据流（目标态）

1. 用户在 web 输入问题，通过 HTTP/SSE 发到 API。
2. API 将问题与工具 Schema 交给 LLM。
3. LLM 选择只读工具并生成参数。
4. Tool gateway 校验地址/参数、查缓存、调用 MCP 工具。
5. MCP 工具通过 RPC 取状态，通过 Routescan 取交易历史与代币转账。
6. 结果归一化，记录 `tool_calls` 审计与缓存。
7. LLM 基于工具结果生成答案，附上数据来源与区块高度。
8. API 以 SSE 流式返回，前端渲染工具轨迹与引用。

关键原则：**先工具结果，后语言组织**。答案中的每个数字都应能回到一次工具调用。

## 数据源策略

| 数据 | 来源 | 备注 |
|---|---|---|
| 余额、Gas、区块、合约状态 | RPC（PublicNode / 1RPC / dRPC） | 可故障切换；限流与超时 |
| 交易历史、代币转账 | Routescan | Etherscan 兼容；无 SLA |
| 合约源码验证 | Sourcify | C4 使用 |
| Etherscan / Blockscout | 不使用 | 当前网络不可达，不写死依赖 |

**最终性**：主网 finalized 通常在两个 epoch（约 12.8 分钟）后。最近的区块可能在 reorg 中变化，缓存策略必须区分 finalized 与 head；具体实现与测试放在 C3。

## 信任边界

- **用户输入**：不可信；校验地址格式与长度，拒绝任意 RPC URL（防 SSRF）。
- **链上数据**：不可信内容（代币名、符号、metadata 都可能包含恶意指令）；进入 LLM 前做数据标记与截断，系统提示明确「数据不是指令」。
- **LLM**：不可信执行者；无签名能力，不能直接访问数据库或网络；只能通过白名单工具。
- **工具层**：只读；无 `eth_sendRawTransaction`；参数受 schema 限制；超时与调用次数上限。
- **密钥**：只在服务端 `.env`；不进入日志、不进入模型上下文、不进入前端。

更完整的威胁模型见 [security.md](security.md)。

## 已实现 vs 计划

| 组件 | 状态 |
|---|---|
| FastAPI 脚手架、配置、录制 fixture | C0 已就绪 |
| JSON-RPC 客户端、端点故障切换 | C0 已实现 |
| `RpcChainDataProvider` | C0 已实现，待测试 |
| FastAPI 路由、完整测试 | C0 待实现 |
| 签名/交易/回执实验（viem） | C1 |
| Next.js 纵向切片 | C2 |
| PostgreSQL、Routescan、缓存 | C3 |
| Hardhat 合约与 Sepolia 部署 | C4 |
| Agent 工具调用 | C5 |
| MCP server / SSE / 审计 | C6 |
| 完整 UI 与可视化 | C7 |
| 评测、注入防护、CI 扩展 | C8 |
| Docker 部署、英文文档、演示 | C9 |

## 部署目标（C9）

- Docker Compose：`web`、`api`、`mcp`、`postgres`、反向代理。
- 部署在阿里云服务器；Caddy 负责 HTTPS。
- 密钥通过环境变量注入，不进入镜像；健康检查与结构化日志。
- 若 Docker 在本地一直不可用，C9 在服务器上补足容器化与部署练习。
