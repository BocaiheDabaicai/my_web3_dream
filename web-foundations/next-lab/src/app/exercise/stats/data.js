export async function getNetworkStats() {
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    queryId: Math.random().toString(16).slice(2, 8),
    blockHeight: 21000042,
    gasPrice: 18,
    peers: 24,
  }
}
