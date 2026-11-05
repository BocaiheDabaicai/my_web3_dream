import Link from 'next/link'

const BLOCKS = {
  '21000001': {hash: '0xa1c4f3', txs: 12},
  '21000002': {hash: '0xb2d5a8', txs: 8},
  '21000003': {hash: '0xc3e6b1', txs: 21},
}

export default async function DemoBlockPage({params}) {
  const {height} = await params

  if (height === '0') {
    throw new Error('区块 #0 读取失败：这是用来演示 error.js 的假错误。')
  }

  // 故意慢一点，让同目录的 loading.jsx 有机会出现
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const block = BLOCKS[height]

  if (!block) {
    return (
      <div className="panel">
        <h2>没有区块 #{height}</h2>
        <p>这个页面没有调用 notFound()，只是自己判断数据不存在。</p>
        <Link className="button" href="/demo/blocks">
          返回列表
        </Link>
      </div>
    )
  }

  return (
    <div className="panel">
      <h2>区块 #{height}</h2>
      <p>
        Hash：<code>{block.hash}</code>
      </p>
      <p>交易数：{block.txs}</p>
      <p>
        <code>#</code> 后面的数字来自地址栏，通过{' '}
        <code>const {'{ height }'} = await params</code> 取到。
      </p>
      <Link className="button" href="/demo/blocks">
        返回列表
      </Link>
    </div>
  )
}
