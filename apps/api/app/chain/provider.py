from typing import Protocol

from app.chain.rpc import JsonRpcClient
from app.errors import ChainConfigurationError, ChainRpcError


class ChainDataProvider(Protocol):
    async def get_chain_id(self) -> int: ...

    async def get_latest_block_number(self) -> int: ...

    async def aclose(self) -> None: ...


class RpcChainDataProvider:
    def __init__(self, rpc: JsonRpcClient, *, expected_chain_id: int | None = None) -> None:
        self._rpc = rpc
        self._expected_chain_id = expected_chain_id
        self._chain_id: int | None = None

    async def get_latest_block_number(self) -> int:
        raw = await self._rpc.call("eth_blockNumber")
        return _parse_hex_int(raw, method="eth_blockNumber")

    async def get_chain_id(self) -> int:
        if self._chain_id is None:
            raw = await self._rpc.call("eth_chainId")
            chain_id = _parse_hex_int(raw, method="eth_chainId")

            if self._expected_chain_id is not None and chain_id != self._expected_chain_id:
                raise ChainConfigurationError(
                    f"Configured CHAIN_ID={self._expected_chain_id}, "
                    f"but the RPC endpoint reports chain ID {chain_id}"
                )

            self._chain_id = chain_id

        return self._chain_id

    async def aclose(self) -> None:
        await self._rpc.aclose()


def _parse_hex_int(raw: object, *, method: str) -> int:
    if not isinstance(raw, str):
        raise ChainRpcError(f"{method} returned a non-string result", method=method)

    try:
        return int(raw, 16)
    except ValueError as exc:
        raise ChainRpcError(f"{method} returned invalid hex: {raw!r}", method=method) from exc