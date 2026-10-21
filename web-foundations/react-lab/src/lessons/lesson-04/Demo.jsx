import { useState } from 'react'

const tokens = ['ETH', 'USDC', 'DAI']

const initialTransfer = {
  to: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  amount: '0.5',
  memo: '给区块浏览器样例账户转账',
  token: 'ETH',
  acknowledged: true,
}

function PreviewRow({ label, value }) {
  return (
    <div className="preview-row">
      <span className="preview-row__label">{label}</span>
      <span className="preview-row__value">{value}</span>
    </div>
  )
}

function ControlledTransferDemo() {
  const [form, setForm] = useState(initialTransfer)
  const [notice, setNotice] = useState('')

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setNotice('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    const amountNumber = Number(form.amount)
    const valid =
      form.to.trim() !== '' && amountNumber > 0 && form.acknowledged

    if (!valid) {
      setNotice('请填写完整的地址和金额，并勾选确认。')
      return
    }

    setNotice(`已生成预览：${form.amount} ${form.token} → ${form.to}`)
  }

  function resetForm() {
    setForm(initialTransfer)
    setNotice('')
  }

  const amountNumber = Number(form.amount) || 0
  const fee = amountNumber * 0.001
  const isValid =
    form.to.trim() !== '' && amountNumber > 0 && form.acknowledged

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">CONTROLLED FORM</p>
          <h2>受控转账表单</h2>
        </div>
        <span className="board-count">{isValid ? '可提交' : '待完善'}</span>
      </header>

      <form className="tx-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">收款地址</span>
            <input
              className="input"
              name="to"
              value={form.to}
              onChange={handleChange}
            />
          </label>
          <label className="field">
            <span className="field__label">金额</span>
            <input
              className="input"
              name="amount"
              type="number"
              min="0"
              step="0.0001"
              value={form.amount}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field__label">代币</span>
            <select
              className="select"
              name="token"
              value={form.token}
              onChange={handleChange}
            >
              {tokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </label>
          <div className="field">
            <span className="field__label">预估手续费</span>
            <div className="input input--readonly">
              {fee.toFixed(4)} {form.token}
            </div>
          </div>
        </div>

        <label className="field">
          <span className="field__label">备注</span>
          <textarea
            className="textarea"
            name="memo"
            value={form.memo}
            onChange={handleChange}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            name="acknowledged"
            checked={form.acknowledged}
            onChange={handleChange}
          />
          <span>我已知晓这只是只读演示，不会发起真实交易。</span>
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary">
            生成预览
          </button>
          <button type="button" className="btn btn--ghost" onClick={resetForm}>
            重置
          </button>
        </div>
      </form>

      <div className="preview-card">
        <h3>实时预览</h3>
        <div className="preview-rows">
          <PreviewRow label="收款地址" value={form.to || '—'} />
          <PreviewRow
            label="金额"
            value={form.amount ? `${form.amount} ${form.token}` : '—'}
          />
          <PreviewRow
            label="预估手续费"
            value={`${fee.toFixed(4)} ${form.token}`}
          />
          <PreviewRow label="备注" value={form.memo || '—'} />
        </div>

        {notice && (
          <p className={`notice ${isValid ? 'notice--success' : 'notice--error'}`}>
            {notice}
          </p>
        )}
      </div>

      <p className="control-note">
        每个输入都同时绑定 value/checked 和 onChange，state 是唯一数据源。
        onChange 用 name 找到字段，checkbox 读取 checked，其他控件读取 value。
      </p>
    </section>
  )
}

const tokenBook = {
  eth: { symbol: 'ETH', name: 'Ethereum', price: 2480, balance: 1.24 },
  usdc: { symbol: 'USDC', name: 'USD Coin', price: 1, balance: 820 },
  arb: { symbol: 'ARB', name: 'Arbitrum', price: 0.72, balance: 420 },
}

function TokenSelect({ value, onChange }) {
  return (
    <select className="select" value={value} onChange={onChange}>
      {Object.entries(tokenBook).map(([id, token]) => (
        <option key={id} value={id}>
          {token.symbol} · {token.name}
        </option>
      ))}
    </select>
  )
}

function TokenSnapshot({ token, amount }) {
  const amountNumber = Number(amount) || 0

  return (
    <div className="preview-card">
      <h3>资产快照</h3>
      <div className="preview-rows">
        <PreviewRow label="代币" value={`${token.symbol} · ${token.name}`} />
        <PreviewRow label="参考价格" value={`$${token.price}`} />
        <PreviewRow label="持有数量" value={`${token.balance} ${token.symbol}`} />
        <PreviewRow
          label="输入数量估值"
          value={`$${(amountNumber * token.price).toFixed(2)}`}
        />
      </div>
    </div>
  )
}

function StateLiftingDemo() {
  const [tokenId, setTokenId] = useState('eth')
  const [amount, setAmount] = useState('1')
  const token = tokenBook[tokenId]

  return (
    <section className="control-card">
      <header className="control-card__head">
        <div>
          <p className="board-kicker">LIFTING STATE</p>
          <h2>状态提升</h2>
        </div>
        <span className="board-count">父组件持有 2 份 state</span>
      </header>

      <div className="form-grid">
        <label className="field">
          <span className="field__label">选择代币</span>
          <TokenSelect
            value={tokenId}
            onChange={(event) => setTokenId(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">数量</span>
          <input
            className="input"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
          />
        </label>
      </div>

      <TokenSnapshot token={token} amount={amount} />

      <p className="control-note">
        tokenId 和 amount 都在父组件 StateLiftingDemo 中。TokenSelect
        只负责显示和通知变化，TokenSnapshot 只负责按最新值渲染，
        两个兄弟组件因此始终同步。
      </p>
    </section>
  )
}

export default function Lesson04Demo() {
  return (
    <div className="stack">
      <ControlledTransferDemo />
      <StateLiftingDemo />

      <p className="demo-note">
        受控组件用 value/checked + onChange 把 state 变成唯一数据源；
        状态提升把共享 state 放到共同父组件，数据向下传、事件向上报。
      </p>
    </div>
  )
}
