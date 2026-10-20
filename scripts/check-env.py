#!/usr/bin/env python3
"""Cross-platform environment probe for the Onchain Analyst project.

Uses only the standard library so it can run before the virtualenv exists.

    python scripts/check-env.py

Exit code is 1 only when a critical check fails (unsupported Python or no
reachable mainnet RPC endpoint). Missing Docker/WSL/tooling is a warning.
"""

from __future__ import annotations

import json
import platform
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass

TIMEOUT_SECONDS = 8.0
RPC_ENDPOINTS = {
    "PublicNode": "https://ethereum-rpc.publicnode.com",
    "1RPC": "https://1rpc.io/eth",
    "dRPC Sepolia": "https://sepolia.drpc.org",
}
HTTP_ENDPOINTS = {
    "Routescan": "https://api.routescan.io/v2/network/mainnet/evm/1/etherscan/api"
    "?module=stats&action=ethprice",
    "Sourcify": "https://sourcify.dev/server/chains",
    "PyPI mirror": "https://pypi.tuna.tsinghua.edu.cn/simple/fastapi/",
    "Docker mirror": "https://docker.m.daocloud.io/v2/",
}


@dataclass
class Result:
    name: str
    status: str
    detail: str


def run_command(*command: str) -> str | None:
    executable = shutil.which(command[0])
    if executable is None:
        return None
    try:
        completed = subprocess.run(
            [executable, *command[1:]],
            capture_output=True,
            timeout=5,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return "installed"
    raw = (completed.stdout or completed.stderr or b"").strip()
    lines = raw.decode("utf-8", errors="replace").splitlines()
    if lines:
        return lines[0].strip()
    return f"installed (exit {completed.returncode})"


def tool_check(name: str, *command: str) -> Result:
    version = run_command(*command)
    if version is None:
        return Result(name, "WARN", "not found on PATH")
    return Result(name, "OK", version)


def wsl_check() -> Result:
    if shutil.which("wsl") is None:
        return Result("WSL", "WARN", "not found; Docker Desktop needs WSL2 on Windows")
    return Result("WSL", "OK", "installed (run `wsl --status` to verify the kernel)")


def http_get(name: str, url: str) -> Result:
    request = urllib.request.Request(url, headers={"User-Agent": "onchain-analyst-env-check"})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            return Result(name, "OK", f"HTTP {response.status}")
    except urllib.error.HTTPError as exc:
        if exc.code in (401, 403):
            return Result(name, "OK", f"HTTP {exc.code} (reachable, auth expected)")
        return Result(name, "WARN", f"HTTP {exc.code}")
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return Result(name, "WARN", f"unreachable: {exc}")


def rpc_check(name: str, url: str) -> Result:
    payload = json.dumps(
        {"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}
    ).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "onchain-analyst-env-check"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            body = json.loads(response.read().decode("utf-8"))
        result = body.get("result")
        if not isinstance(result, str):
            return Result(f"RPC {name}", "WARN", f"unexpected response: {body}")
        return Result(f"RPC {name}", "OK", f"block {int(result, 16)}")
    except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
        return Result(f"RPC {name}", "WARN", f"unreachable: {exc}")


def python_check() -> Result:
    version = platform.python_version()
    if sys.version_info >= (3, 12):
        return Result("Python", "OK", f"{version} (requires 3.12+)")
    return Result("Python", "FAIL", f"{version} is too old; install 3.12+")


def print_results(results: list[Result]) -> None:
    for result in results:
        print(f"[{result.status:<4}] {result.name}: {result.detail}")


def main() -> int:
    print(f"Platform: {platform.system()} {platform.release()} ({platform.machine()})")

    tools = [
        python_check(),
        tool_check("Git", "git", "--version"),
        tool_check("Node", "node", "--version"),
        tool_check("npm", "npm", "--version"),
        tool_check("Docker", "docker", "--version"),
        tool_check("psql", "psql", "--version"),
        tool_check("Foundry", "forge", "--version"),
    ]
    tools.append(wsl_check() if platform.system() == "Windows" else tool_check("Homebrew", "brew", "--version"))

    print("\nToolchain:")
    print_results(tools)

    network = [rpc_check(name, url) for name, url in RPC_ENDPOINTS.items()]
    network.extend(http_get(name, url) for name, url in HTTP_ENDPOINTS.items())

    print("\nNetwork:")
    print_results(network)

    results = tools + network
    failures = [result for result in results if result.status == "FAIL"]
    warnings = [result for result in results if result.status == "WARN"]
    print(
        f"\nSummary: {len(results) - len(failures) - len(warnings)} OK, "
        f"{len(warnings)} WARN, {len(failures)} FAIL"
    )

    if failures:
        print("Critical checks failed. Fix those before starting C0.")
        return 1

    if warnings:
        print("Warnings are okay for C0. Docker/WSL can be resolved before C3/C9.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
