import asyncio

from app.chain.rpc import JsonRpcClient
from app.chain.provider import RpcChainDataProvider


# async def main() -> None:
#     rpc = JsonRpcClient(
#         endpoints=[
#             "https://ethereum-rpc.publicnode.com",
#             "https://1rpc.io/eth",
#         ],
#         timeout_seconds=10.0,
#     )
#     try:
#         block_hex = await rpc.call("eth_blockNumber")
#         print("type:", type(block_hex).__name__)
#         print("raw:", block_hex)
#         print("block:", int(block_hex, 16))
#     finally:
#         await rpc.aclose()

async def main() -> None:
    rpc = JsonRpcClient(
        endpoints=["https://ethereum-rpc.publicnode.com", "https://1rpc.io/eth"],
        timeout_seconds=10.0,
    )
    try:
        print("最新区块:", await rpc.call("eth_blockNumber"))
        print("链 ID:", await rpc.call("eth_chainId"))
        print(
            "Vitalik 余额(wei, hex):",
            await rpc.call(
                "eth_getBalance",
                ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", "latest"],
            ),
        )
    finally:
        await rpc.aclose()


    provider = RpcChainDataProvider(rpc, expected_chain_id=1)
    print(await provider.get_latest_block_number())  # 应该是 int
    print(await provider.get_chain_id())  # 应该是 1


asyncio.run(main())
