from typing import Sequence, Any

import httpx

from app.errors import ChainRpcError


#   1. 为什么返回 body["result"]，而不是 body？
#  因为要拿到响应的结果
#   2. params or [] 在 params=None 时做了什么？
#  不知道
#   3. 如果 self._client 是测试传进来的，aclose() 为什么不能关它？
#  不知道

class JsonRpcClient:
    def __init__(
            self,
            endpoints: Sequence[str],
            *,
            timeout_seconds: float = 10.0,
            client: httpx.AsyncClient | None = None,
    ) -> None:
        self._endpoints = tuple(endpoints)
        self._owns_client = client is None
        self._client = client or httpx.AsyncClient(
            timeout=httpx.Timeout(timeout_seconds),
        )

    async def call(self, method: str, params: list[Any] | None = None) -> dict:
        failures: list[str] = []

        for endpoint in self._endpoints:
            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": method,
                "params": params or [],
            }

            try:
                response = await self._client.post(endpoint, json=payload)
                response.raise_for_status()
                body = response.json()

                if not isinstance(body, dict):
                    raise ChainRpcError("RPC response is not a JSON object", method=method)

                if body.get("error") is not None:
                    raise ChainRpcError(f"RPC error: {body['error']}", method=method)

                if "result" not in body:
                    raise ChainRpcError("RPC response is missing result", method=method)

                return body["result"]

            except (httpx.HTTPError, ValueError, ChainRpcError) as exc:
                failures.append(f"{endpoint}: {exc}")

        raise ChainRpcError(
            f"All RPC endpoints failed for {method}: {' | '.join(failures)}",
            method=method,
        )

    async def aclose(self) -> None:
        if self._owns_client:
            await self._client.aclose()
