# 进度记录

按检查点记录，最新在上。

## 2026-10-20 · C0 行走骨架（进行中）

**已完成**

- 仓库脚手架、文档、ADR、C0 任务书、环境自检脚本
- 环境：Windows 10；Python 3.13 + venv；Node 24；无 Docker/WSL2 内核/Foundry；RPC、Routescan、Sourcify、PyPI 镜像可达
- `JsonRpcClient`：单端点请求、JSON-RPC 错误检测、多端点 failover、client 归属处理
- 2 个 MockTransport 测试通过（happy path + failover）
- `RpcChainDataProvider`：`get_latest_block_number`、`get_chain_id`（校验 + 缓存）、`aclose` 已实现

**下次继续**

1. 收尾 `rpc.py`：返回注解改为 `Any`；修正 ruff 的 import 来源与排序
2. 验证 provider：区块返回 `int`、chain id 返回 `1`、错误网络抛 `ChainConfigurationError`；补 provider 测试
3. 任务书第 3 节：FastAPI lifespan + `GET /health` + `GET /api/chain/block/latest` + 502/503
4. 任务书第 4 节：补齐测试；删除 `scratch_rpc.py`；接 CI

**注意**

- Docker / WSL / PostgreSQL 在 C3 前解决即可
- `scratch_rpc.py` 是临时文件，CI 前删除
- 任务书：[tasks/c0-walking-skeleton.md](tasks/c0-walking-skeleton.md)
