import json
from pathlib import Path

import httpx

from app.chain.rpc import JsonRpcClient

FIXTURE = json.loads(
    (Path(__file__).parent / "fixtures" / "rpc" / "eth_block_number.json").read_text(
        encoding="utf-8"
    )
)


async def test_call_returns_result() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content)
        assert payload["jsonrpc"] == "2.0"
        assert payload["method"] == "eth_blockNumber"
        return httpx.Response(200, json=FIXTURE)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        rpc = JsonRpcClient(["https://rpc.example"], client=client)

        result = await rpc.call("eth_blockNumber")

        assert result == "0x1903fb2"


async def test_falls_back_to_next_endpoint() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.host == "bad.example":
            return httpx.Response(500)
        return httpx.Response(200, json=FIXTURE)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        rpc = JsonRpcClient(
            ["https://bad.example", "https://good.example"],
            client=client,
        )

        result = await rpc.call("eth_blockNumber")

        assert result == "0x1903fb2"
