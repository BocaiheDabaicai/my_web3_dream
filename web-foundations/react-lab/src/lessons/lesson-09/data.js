export const NETWORKS = [
  { id: 'ethereum', label: 'Ethereum', mark: 'ETH' },
  { id: 'arbitrum', label: 'Arbitrum', mark: 'ARB' },
  { id: 'base', label: 'Base', mark: 'BASE' },
]

export const INITIAL_ASSETS = {
  ethereum: [
    {
      id: 'eth-ETH',
      symbol: 'ETH',
      name: 'Ether',
      balance: 12.84,
      price: 3421.18,
      change24h: 2.4,
      watched: true,
    },
    {
      id: 'eth-USDC',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 8400,
      price: 1,
      change24h: 0.01,
      watched: false,
    },
    {
      id: 'eth-ARB',
      symbol: 'ARB',
      name: 'Arbitrum',
      balance: 2400,
      price: 0.92,
      change24h: -3.1,
      watched: true,
    },
    {
      id: 'eth-LINK',
      symbol: 'LINK',
      name: 'Chainlink',
      balance: 310,
      price: 18.42,
      change24h: 4.7,
      watched: false,
    },
  ],
  arbitrum: [
    {
      id: 'arb-ETH',
      symbol: 'ETH',
      name: 'Ether',
      balance: 4.21,
      price: 3421.18,
      change24h: 2.4,
      watched: true,
    },
    {
      id: 'arb-USDC',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 5200,
      price: 1,
      change24h: 0.01,
      watched: false,
    },
    {
      id: 'arb-GMX',
      symbol: 'GMX',
      name: 'GMX',
      balance: 85,
      price: 32.16,
      change24h: -1.8,
      watched: true,
    },
    {
      id: 'arb-MAGIC',
      symbol: 'MAGIC',
      name: 'Treasure',
      balance: 12500,
      price: 0.54,
      change24h: 6.3,
      watched: false,
    },
  ],
  base: [
    {
      id: 'base-ETH',
      symbol: 'ETH',
      name: 'Ether',
      balance: 2.08,
      price: 3421.18,
      change24h: 2.4,
      watched: false,
    },
    {
      id: 'base-USDC',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 3100,
      price: 1,
      change24h: 0.01,
      watched: true,
    },
    {
      id: 'base-AERO',
      symbol: 'AERO',
      name: 'Aerodrome',
      balance: 7600,
      price: 0.78,
      change24h: 9.2,
      watched: true,
    },
    {
      id: 'base-DEGEN',
      symbol: 'DEGEN',
      name: 'Degen',
      balance: 42000,
      price: 0.018,
      change24h: -5.4,
      watched: false,
    },
  ],
}

export const ACCOUNT_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'

export function formatUsd(value) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
}

export function formatPercent(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatToken(value, symbol) {
  const digits = value >= 1000 ? 0 : value >= 1 ? 2 : 4

  return `${value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
  })} ${symbol}`
}

export function changeTone(value) {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

export function shortAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
