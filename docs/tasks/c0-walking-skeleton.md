# C0 任务书 · 行走骨架与第一条链上数据

> 目标不是“写完”，而是你能讲清楚每个设计选择，并能自己定位失败原因。  
> 完成这一关后，项目第一次从 HTTP 请求走到真实链上数据。

## 目标

在现有脚手架上实现一条只读纵切：

```
curl → FastAPI → RpcChainDataProvider → JsonRpcClient → 公共 RPC
```

交付两个接口：

- `GET /health`
- `GET /api/chain/block/latest`

## 当前进度

- [x] `JsonRpcClient` 单端点 happy path + 一个 MockTransport 测试
- [x] `JsonRpcClient` 失败处理与多端点 failover（第 1 节）
- [x] `RpcChainDataProvider` 实现（第 2 节）
- [ ] 收尾：`call` 返回注解改为 `Any`，修正 ruff 的 import/格式
- [ ] provider 验证与测试（第 2 节验收）
- [ ] FastAPI 路由与错误映射（第 3 节）
- [ ] 完整测试（第 4 节）

任务书是最终契约。可以分多次验收，但每一步都必须落在对应小节的要求内，不能用简化版替代最终要求。

## 已提供的脚手架（可以读、可以改，但先说明理由）

- `apps/api/requirements.txt` / `requirements-dev.txt` / `pyproject.toml`
- `apps/api/app/config.py`：读取仓库根目录 `.env`，提供 `CHAIN_ID`、`RPC_URLS`、`REQUEST_TIMEOUT_SECONDS` 与 `get_settings()`
- `apps/api/app/errors.py`：`ChainError` / `ChainRpcError` / `ChainConfigurationError`
- `apps/api/tests/fixtures/rpc/`：2026-10-20 录制的主网 `eth_blockNumber`、`eth_chainId` 响应
- `apps/api/app/main.py`：只有 FastAPI 实例，没有业务实现
- 环境与启动说明：[../setup.md](../setup.md)

## 你要实现的接口契约

### 1. `apps/api/app/chain/rpc.py` · `JsonRpcClient`

```python
class JsonRpcClient:
    def __init__(
        self,
        endpoints: Sequence[str],
        *,
        timeout_seconds: float = 10.0,
        client: httpx.AsyncClient | None = None,
    ) -> None: ...

    async def call(self, method: str, params: list[Any] | None = None) -> Any: ...

    async def aclose(self) -> None: ...
```

行为要求：

- 生成 JSON-RPC 2.0 请求；`params` 缺省为空列表。
- 按顺序尝试多个 endpoint，第一个成功结果直接返回。
- 以下都视为该 endpoint 失败，继续尝试下一个：
  - 网络错误 / 超时；
  - HTTP 非 2xx；
  - 响应不是 JSON、不是对象；
  - JSON-RPC `error` 字段非空；
  - 响应缺少 `result`。
- 所有 endpoint 都失败时抛 `ChainRpcError`，错误信息包含方法名，便于定位。
- 传入的 `httpx.AsyncClient` 用于测试注入；**不要关闭别人传进来的 client**。自己创建的 client 由 `aclose()` 关闭。
- 日志里不要打印敏感参数。当前只有公开地址可以接受，但保持这个习惯。

### 2. `apps/api/app/chain/provider.py`

```python
class ChainDataProvider(Protocol):
    async def get_chain_id(self) -> int: ...
    async def get_latest_block_number(self) -> int: ...
    async def aclose(self) -> None: ...


class RpcChainDataProvider:
    def __init__(self, rpc: JsonRpcClient, *, expected_chain_id: int | None = None) -> None: ...
```

行为要求：

- `get_latest_block_number`：调用 `eth_blockNumber`，把十六进制字符串转为整数。
- `get_chain_id`：调用 `eth_chainId`，转为整数。
  - 如果传入了 `expected_chain_id` 且不匹配，抛 `ChainConfigurationError`。
  - 成功后缓存到实例属性，后续调用不重复请求 RPC。
- 返回类型不是字符串，或不是合法的十六进制 → 抛 `ChainRpcError`。
- `aclose()` 委托给 `JsonRpcClient`。

### 3. `apps/api/app/main.py`

- 用 FastAPI lifespan 创建：
  - `JsonRpcClient(settings.rpc_endpoints, timeout_seconds=settings.request_timeout_seconds)`
  - `RpcChainDataProvider(rpc, expected_chain_id=settings.chain_id)`
- 保存到 `app.state.chain_provider`，应用关闭时调用 `aclose()`。
- 提供依赖 `get_chain_provider(request) -> ChainDataProvider`，路由通过 `Depends` 获取。
- 接口：
  - `GET /health` → `{"status": "ok", "service": "onchain-analyst-api"}`
  - `GET /api/chain/block/latest` → `{"chain_id": <int>, "block_number": <int>}`
- 错误映射（JSON body 均为 `{"detail": "..."}`）：
  - `ChainRpcError` → 502
  - `ChainConfigurationError` → 503
- 不要在路由里每次新建 httpx client。连接复用与测试可控性都靠 lifespan + 注入。

### 4. `apps/api/tests/`

自己建立测试结构（`conftest.py` 可选）。至少覆盖：

1. `/health` 返回 200 与约定结构。
2. `/api/chain/block/latest` 返回 200，`chain_id=1`，`block_number` 等于 fixture 中十六进制转换后的值。
3. 第一个 RPC endpoint 失败、第二个成功时，仍返回正确结果（故障切换）。
4. 所有 endpoint 失败 → HTTP 502。
5. RPC 返回的 chain id 与 `CHAIN_ID` 不一致 → HTTP 503。
6. RPC 返回非法十六进制（如 `0xZZ`）→ HTTP 502。
7. chain id 被缓存：连续两次调用只发出一次 `eth_chainId`。

约束：

- 测试**不得访问公网**。使用 `httpx.MockTransport` 模拟 RPC，使用 `httpx.ASGITransport` 调 FastAPI。
- 用 `tests/fixtures/rpc/` 里的录制响应，不要每次重新抓取。
- 不要 mock 掉被测逻辑本身（可以替身网络层，不能替身 `JsonRpcClient` 的核心逻辑）。
- `pytest-asyncio` 已配置为 auto 模式，异步测试无需额外装饰器。

## 建议的实现顺序

1. 读 `config.py` 和 `errors.py`，确认 `.env` 与默认值。
2. 创建虚拟环境、安装依赖，启动空应用，打开 `/docs`。
3. 写一个最小脚本或测试，用录制 fixture 确认 `eth_blockNumber` 的请求/响应形状。
4. 实现单 endpoint 的 `JsonRpcClient.call`，先让一个测试通过。
5. 加 failover、错误分类与 `aclose`。
6. 实现 provider 的解析、校验与缓存。
7. 接 lifespan、依赖与两个路由，加异常处理。
8. 补全 7 个场景的测试，跑 `ruff` 与 `pytest`。
9. 本地启动 uvicorn，用 curl 请求真实 RPC。
10. 写笔记与英文摘要，请求 Code Review。

## 验收方式

**命令**

```bash
cd apps/api
ruff check .
ruff format --check .
pytest -q
uvicorn app.main:app --port 8000
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/chain/block/latest
```

**材料**

- 代码与测试在上述目录。
- `docs/notes/00-json-rpc.md`：一页，讲清 JSON-RPC 报文、failover、缓存与错误映射，附 3~5 句英文摘要。
- 一次 5 分钟口头复述：从 curl 到 RPC 的完整路径，以及每个失败点会发生什么。

**破坏任务**（Review 时我会挑一个）

- 让第一个 endpoint 返回 500，验证故障切换。
- 返回 Sepolia 的 chain id（`0xaa36a7`）而配置是主网，验证 503。
- 返回 `0xZZ`，验证错误分类。
- 在测试里把真实网络关掉，验证测试仍然通过。

## 自检问题

1. 为什么要做端点故障切换？哪些错误其实不该切换？
2. 为什么 chain id 要缓存和校验？它在防止什么事故？
3. 为什么测试要用录制 fixture，而不是每次直连 RPC？
4. `raise_for_status()` 覆盖哪些失败？JSON-RPC error 为什么还要单独判断？
5. 如果以后切换到 Sepolia，需要改哪些配置和代码？
6. 为什么不能在每次请求里新建 httpx client？

## 卡住时怎么问

直接告诉我等级，或贴出**最小可复现信息**（相关代码、完整报错、期望 vs 实际、已尝试过什么）：

- **H1 概念提示**：JSON-RPC 报文、httpx 用法、FastAPI lifespan/依赖注入、测试替身的概念。
- **H2 结构提示**：函数签名、伪代码、边界条件清单，不给完整实现。
- **H3 定位提示**：指出具体文件/行为中的问题与最小修改方向。

如果你明确想用“你写我看”的方式换取速度，也可以直接说，但默认不替你做核心实现。

## 概念提示

JSON-RPC 请求/响应的最小形状：

```json
{"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}
{"jsonrpc": "2.0", "id": 1, "result": "0x1903fb2"}
```

测试替身的思路：

```python
transport = httpx.MockTransport(handler)   # handler(request) -> httpx.Response
client = httpx.AsyncClient(transport=transport)
app_client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")
```

FastAPI 生命周期与依赖的形状（自己补细节）：

```python
@asynccontextmanager
async def lifespan(app: FastAPI): ...
def get_chain_provider(request: Request) -> ChainDataProvider: ...
```

## 明确不做

- 不接触私钥、不签名、不发送交易。
- 不接 Etherscan（当前网络不可达）。
- 不引入新框架或新依赖；当前依赖足够。
- 不在测试里访问公网。
