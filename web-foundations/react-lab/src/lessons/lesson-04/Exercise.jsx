import {useState} from "react";

const initialDraft = {
    to: '',
    amount: '',
    memo: '',
    token: 'ETH',

    acknowledged: false,
}

function PreviewRow({label, value}) {
    return (
        <div className="preview-row">
            <span className="preview-row__label">{label}</span>
            <span className="preview-row__value">{value}</span>
        </div>
    )
}

function TransferForm({ draft, onChange, onSubmit, onReset, fee }) {
    return (
        <form className="tx-form" onSubmit={onSubmit}>
            <div className="form-grid">
                <label className="field">
                    <span className="field__label">收款地址</span>
                    <input className="input" name="to" placeholder="0x..." value={draft.to} onChange={onChange}/>
                </label>
                <label className="field">
                    <span className="field__label">金额</span>
                    <input
                        className="input"
                        name="amount"
                        type="number"
                        min="0"
                        step="0.0001"
                        placeholder="0.0"
                        value={draft.amount}
                        onChange={onChange}
                    />
                </label>
            </div>

            <div className="form-grid">
                <label className="field">
                    <span className="field__label">代币</span>
                    <select className="select" name="token" value={draft.token} onChange={onChange}>
                        <option value="ETH">ETH</option>
                        <option value="USDC">USDC</option>
                        <option value="DAI">DAI</option>
                    </select>
                </label>
                <div className="field">
                    <span className="field__label">预估手续费</span>
                    <div className="input input--readonly">
                        {fee.toFixed(4)} {draft.token}
                    </div>
                </div>
            </div>

            <label className="field">
                <span className="field__label">备注</span>
                <textarea className="textarea" name="memo" placeholder="可选" value={draft.memo} onChange={onChange} />
            </label>

            <label className="check">
                <input type="checkbox" name="acknowledged" checked={draft.acknowledged} onChange={onChange} />
                <span>我已知晓这是只读演示，不会发起真实交易。</span>
            </label>

            <div className="form-actions">
                <button type="submit" className="btn btn--primary">
                    生成预览
                </button>
                <button type="button" className="btn btn--ghost" onClick={onReset}>
                    重置
                </button>
            </div>
        </form>
    )
}

function TransferPreview({draft, fee, isValid, notice}) {
    return (
        <section className="control-card">
            <header className="control-card__head">
                <div>
                    <p className="board-kicker">LIVE PREVIEW</p>
                    <h2>实时预览</h2>
                </div>
                <span className="board-count">
          {fee.toFixed(4)} {draft.token}
        </span>
            </header>

            <div className="preview-rows">
                <PreviewRow label="收款地址" value={draft.to || '—'}/>
                <PreviewRow
                    label="金额"
                    value={draft.amount ? `${draft.amount} ${draft.token}` : '—'}
                />
                <PreviewRow
                    label="预估手续费"
                    value={`${fee.toFixed(4)} ${draft.token}`}
                />
                <PreviewRow label="备注" value={draft.memo || '—'}/>
                <PreviewRow
                    label="状态"
                    value={isValid ? '可以生成预览' : '待完善'}
                />
            </div>

            {notice && (
                <p className={`notice ${isValid ? 'notice--success' : 'notice--error'}`}>
                    {notice}
                </p>
            )}
        </section>
    )
}

export default function Lesson04Exercise() {
    const [draft, setDraft] = useState(initialDraft)
    const [notice, setNotice] = useState('')

    const amountNumber = Number(draft.amount) || 0
    const fee = amountNumber * 0.001
    const isValid =
        draft.to.trim() !== '' && amountNumber > 0 && draft.acknowledged

    const handleChange = function (event) {
        const { name, value, type, checked } = event.target

        setDraft((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }))
        setNotice('')
    }
    const handleSubmit = function (event) {
        event.preventDefault()
        if (!isValid) {
            setNotice('请填写完整的地址和金额，并勾选确认。')
            return
        }
        setNotice(`预览已生成：${draft.amount} ${draft.token} → ${draft.to}`)
    }
    const reset = function () {
        setDraft(initialDraft)
        setNotice('')
    }


    return (
        <div className="stack">
            <section className="control-card">
                <header className="control-card__head">
                    <div>
                        <p className="board-kicker">TRANSFER DRAFT</p>
                        <h2>交易预览台</h2>
                    </div>
                    <span className="board-count">
            {isValid ? '可以生成' : '待完善'}
          </span>
                </header>

                <TransferForm draft={draft}
                              onChange={handleChange}
                              onSubmit={handleSubmit}
                              onReset={reset}
                              fee={fee}/>

                <p className="control-note">
                    表单和预览是兄弟组件，草稿 state 只在父组件里。输入通过
                    onChange 把变化上报给父组件，预览再通过 props 拿到最新值。
                </p>
            </section>

            <TransferPreview
                draft={draft}
                fee={fee}
                isValid={isValid}
                notice={notice}
            />
        </div>
    )
}
