# 环境与启动

覆盖 Windows 10（当前）与 macOS（后续可能切换）。所有仓库内的脚本使用 Python 或跨平台命令编写。

## 当前环境事实（2026-10-20 实测）

| 项目 | 状态 |
|---|---|
| Node / npm / pnpm | 24.11.1 / 11.6.2 / 8.14.0 |
| Python | 3.13.2 |
| Git | 2.39.2 |
| Docker / WSL2 / Foundry / psql | 未安装 |
| 可直连 RPC | `ethereum-rpc.publicnode.com`、`1rpc.io/eth`、`sepolia.drpc.org` |
| 可直连数据 API | Routescan、Sourcify |
| 不可直连 | Etherscan、公共 Blockscout、PyPI、Docker Hub、Docker Desktop 下载域名 |
| 可用镜像 | 清华/Aliyun PyPI、daocloud Docker Hub、npmmirror |
| LLM | DeepSeek（OpenAI 兼容）可用 |

网络会变化。每次换网络（包括切换 Mac）后运行：

```bash
python scripts/check-env.py
```

## 后端启动

```bash
cp .env.example .env

cd apps/api
python -m venv .venv
```

按平台激活虚拟环境：

- Windows PowerShell：`.venv\Scripts\Activate.ps1`
- Windows Git Bash：`source .venv/Scripts/activate`
- macOS / Linux：`source .venv/bin/activate`

安装依赖：

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt -r requirements-dev.txt
```

启动：

```bash
uvicorn app.main:app --reload --port 8000
```

验证：

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/chain/block/latest
```

或直接打开 <http://127.0.0.1:8000/docs>。

C0 完成前，`/api/chain/block/latest` 尚未实现并返回 404，这是预期状态；实现要求见 [C0 任务书](tasks/c0-walking-skeleton.md)。

`.env` 放在仓库根目录，后端会从仓库根目录读取。不要提交它。

## 网络与镜像

### PyPI（大陆网络必需）

```bash
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple ...
```

也可以临时设置 `PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple`。不要把个人镜像配置写进仓库。

### npm（可选，仅在本机网络慢时）

```bash
npm config set registry https://registry.npmmirror.com
# 恢复默认
npm config delete registry
```

这是用户级配置，不进仓库。

### Docker Hub

Docker Hub 直连不通。安装 Docker 后可在 Docker Engine 配置中加入镜像：

```json
{
  "registry-mirrors": ["https://docker.m.daocloud.io"]
}
```

第三方镜像仅用于本地开发，生产构建应使用可信来源并固定版本。

## Docker 决策

当前机器没有 Docker、WSL2 内核和 Foundry。需要在 C0 决定走哪条路：

### 方案 A：WSL2 + Docker Desktop（Windows 推荐）

前置：BIOS 开启虚拟化；管理员 PowerShell。

```powershell
wsl --install
# 重启后
wsl --update
```

然后安装 Docker Desktop。当前网络下载 Docker Desktop 安装包会失败，需要代理/换网络，或从其他可信渠道获取官方安装包。安装后在设置里启用 WSL2 后端，并配置上面的 registry mirror。

优点：最接近日常 Docker 工作流，方便后续容器化。  
风险：安装包下载与 WSL 内核更新可能被网络阻断。

### 方案 B：WSL2 + Docker Engine（不用 Docker Desktop）

在 WSL Ubuntu 内安装 Docker Engine 与 compose 插件，Windows 侧通过 `wsl docker ...` 使用。更接近 Linux 服务器，但需要自己维护。

### 方案 C：远程 Docker（阿里云服务器）

在服务器上安装 Docker，本地通过 SSH 使用远程 daemon，或直接 ssh 到服务器构建。安全要求高（不要暴露未加密的 2375 端口），适合 C9 前后的部署练习。

### 方案 D：本机 PostgreSQL 回退

C3 需要数据库。如果 Docker 暂时不可用：

- Windows：安装 EDB PostgreSQL 17，创建数据库 `onchain` 和用户。
- macOS：`brew install postgresql@17 && brew services start postgresql@17 && createdb onchain`。

`.env` 中配置：

```text
DATABASE_URL=postgresql+asyncpg://onchain:change-me@localhost:5432/onchain
```

Docker 深度可以在 C9 部署到阿里云服务器时集中补。无论选哪条路，先记录到 ADR-0001。

### Foundry

Windows 原生不装 Foundry。C4 使用 Hardhat（Node 生态，跨平台）。如果后续 WSL 就绪，再用 Foundry 做一次对照实验。

## 链上数据端点

- 主网 RPC：`https://ethereum-rpc.publicnode.com`、`https://1rpc.io/eth`
- Sepolia RPC：`https://sepolia.drpc.org`
- 交易历史：Routescan（Etherscan 兼容 API）  
  `https://api.routescan.io/v2/network/mainnet/evm/1`
- 合约源码验证：Sourcify（`https://sourcify.dev`）

Etherscan API 与公共 Blockscout 当前网络不可用，不作为依赖。所有链上数据访问走 `ChainDataProvider` 抽象，后续可以替换 provider。

## macOS 迁移清单（MacBook Pro M4 Pro）

1. 安装 Xcode Command Line Tools：`xcode-select --install`
2. 安装 Homebrew（若未安装），再装工具：
   `brew install python@3.13 node git`
3. 安装容器运行时：`brew install --cask docker` 或 OrbStack。Apple Silicon 使用 arm64 镜像，官方 Python/Node/Postgres 镜像均支持。
4. 克隆仓库，复制 `.env`，重建虚拟环境：
   `python3.13 -m venv .venv && source .venv/bin/activate`
5. 安装依赖并运行测试：
   `pip install -r apps/api/requirements.txt -r apps/api/requirements-dev.txt && cd apps/api && pytest`
6. 运行 `python scripts/check-env.py` 检查网络与端点。
7. 从 Windows 带过去的内容：`.env`（不要提交）、Docker 镜像列表、本地数据库备份；代码通过 Git 同步即可。
8. 换机后重新确认 Python 3.13 的依赖轮子（尤其 eth-abi/eth-utils）在 arm64 上可用。

仓库使用 LF 换行，macOS 上无需额外配置。

## 常见问题

- **`uvicorn` 找不到**：确认虚拟环境已激活，且从 `apps/api` 目录运行。
- **curl 超时**：先跑 `python scripts/check-env.py`；确认 RPC 端点可用，必要时更换网络或代理。
- **端口占用**：换 `--port 8010` 并相应调整调用地址。
- **PyPI 安装慢**：使用清华或 Aliyun 镜像。
- **Docker 拉取失败**：配置 registry mirror 或使用远程 Docker。
- **Windows 防火墙弹窗**：允许 Python 访问专用网络即可。

## 安全提醒

- 只复制 `.env.example` 到 `.env`，从不提交 `.env`。
- 数据库文件、日志、密钥不得入仓。
- 链上练习只用一次性测试钱包，不连接真实资金。
