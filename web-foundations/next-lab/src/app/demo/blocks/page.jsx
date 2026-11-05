import Link from 'next/link'

const BLOCKS = [
  {height: '21000001', txs: 12},
  {height: '21000002', txs: 8},
  {height: '21000003', txs: 21},
]

export default function DemoBlocksPage() {
  return (
    <div>
      <h2>区块列表</h2>
      <p>
        点进任意一个区块，地址里的数字会被文件夹名 <code>[height]</code>
        捕获成 <code>params.height</code>。
      </p>

      <div className="card-row">
        {BLOCKS.map((block) => (
          <Link
            className="card"
            key={block.height}
            href={`/demo/blocks/${block.height}`}
          >
            <h2>#{block.height}</h2>
            <p>{block.txs} 笔交易</p>
          </Link>
        ))}
      </div>

      <p style={{marginTop: '24px'}}>
        这个链接会触发一个假错误，用来看 error.js：
        <Link href="/demo/blocks/0"> 区块 #0</Link>
      </p>
    </div>
  )
}
