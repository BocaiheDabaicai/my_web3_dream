# Onchain Analyst · 链上智能分析助手

> A read-only AI agent that answers questions about Ethereum addresses, transactions, tokens, and contracts — with every claim traceable to its source and block height.

一个只读的链上智能分析助手：用自然语言查询地址、交易、代币与合约数据。项目同时是一条从企业前端转向 AI + Web3 应用工程师的系统学习路径，按检查点推进，边学边构建。

## 当前状态

- **当前检查点：C0 · 环境可行性 + 行走骨架**（进行中）
- 已实现：JSON-RPC 客户端（含 failover）、`RpcChainDataProvider`、2 个 MockTransport 测试
- 待实现：FastAPI 路由与错误映射、provider/接口测试、CI
- 当前任务书：[docs/tasks/c0-walking-skeleton.md](docs/tasks/c0-walking-skeleton.md)
- 进度记录：[docs/progress.md](docs/progress.md)

完整路线见 [docs/roadmap.md](docs/roadmap.md)。

## 为什么是只读

第一版不连接真实资金、不自动交易、不把私钥交给模型。工具层只有只读白名单，所有工具调用写审计日志。详见 [docs/security.md](docs/security.md)。

## 目标架构

```
apps/web (Next.js + TypeScript)
    │ HTTP / SSE
apps/api (FastAPI)
    ├── Agent 循环（DeepSeek tool calling）
    ├── PostgreSQL：会话 / 工具调用审计 / 结果缓存 / 评测记录
    └── MCP client
            │
    MCP server（同仓库独立进程，FastMCP）
            │
    链上工具层（Python：httpx + eth-abi + EIP-55）
            ├── RPC providers（PublicNode / 1RPC / dRPC，故障切换）
            └── Routescan（交易历史、代币转账）
```

设计取舍见 [docs/architecture.md](docs/architecture.md) 与 [ADR-0001](docs/adr/0001-stack-and-environment.md)。

## 仓库结构

```
apps/api/          FastAPI 后端（当前）
apps/web/          Next.js 前端（C2 起）
labs/viem/         viem 链上练习（C1）
contracts/         Hardhat 合约（C4）
docs/              路线图、架构、安全、任务书、笔记、devlog
scripts/           跨平台开发脚本
infra/             Docker / 部署（C0 决策，C9 落地）
```

## 快速开始（后端）

前置：Python 3.12+（当前在 3.13 验证）、Git。前端需要 Node 20+（C2 起）。

```bash
cp .env.example .env

cd apps/api
python -m venv .venv

# Windows PowerShell:
#   .venv\Scripts\Activate.ps1
# Windows Git Bash:
#   source .venv/Scripts/activate
# macOS / Linux:
#   source .venv/bin/activate

pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

大陆网络访问 PyPI 较慢时使用上面的清华镜像；其他地区可去掉 `-i ...`。

验证：

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/chain/block/latest
```

接口文档：<http://127.0.0.1:8000/docs>

C0 完成前，`/api/chain/block/latest` 尚未实现并返回 404，这是预期状态。实现要求见 [C0 任务书](docs/tasks/c0-walking-skeleton.md)。

完整的环境配置、Docker 决策与 macOS 迁移清单见 [docs/setup.md](docs/setup.md)。

## 开发约定

- 每个检查点统一交付：可运行代码 + 自动化测试 + 笔记 + 英文 devlog 摘要 + 口头复述 + 追问与破坏任务。
- 单元测试使用录制 fixture，不依赖外网。
- 所有密钥只放在本地 `.env`，不进入 Git。
- 代码与文档保持 Windows / macOS 双平台可运行（LF 换行、Python 脚本、Docker）。

## 路线

检查点 C0 → C10：环境、链上基础、纵向切片、PostgreSQL、合约、Agent、MCP、界面、评测、部署、技术公信力。见 [docs/roadmap.md](docs/roadmap.md)。

## 资源

官方文档与学习资料汇总见 [docs/resources.md](docs/resources.md)。
