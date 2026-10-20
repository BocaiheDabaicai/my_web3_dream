function Avatar({ src, alt, size = 84 }) {
  return (
    <img
      className="avatar"
      src={src}
      alt={alt}
      width={size}
      height={size}
    />
  )
}

function Tag({ children }) {
  return <span className="tag">{children}</span>
}

function Card({ eyebrow, title, children }) {
  return (
    <article className="card">
      <p className="card__eyebrow">{eyebrow}</p>
      <h2 className="card__title">{title}</h2>
      <div className="card__body">{children}</div>
    </article>
  )
}

export default function Lesson01Demo() {
  return (
    <Card eyebrow="COMPONENT COMPOSITION" title="组件是返回 JSX 的函数">
      <div className="profile">
        <Avatar src="/avatar.svg" alt="林舟的头像" />
        <div className="profile__info">
          <h3>林舟</h3>
          <p className="muted">Frontend Engineer · Shanghai</p>
          <div className="tag-row">
            <Tag>React</Tag>
            <Tag>Vue</Tag>
            <Tag>Web3</Tag>
          </div>
        </div>
      </div>

      <p className="demo-note">
        这张卡片由 <code>Card</code>、<code>Avatar</code> 与 <code>Tag</code>{' '}
        组合而成。数据通过 props 流入，界面由 JSX 描述。
      </p>
    </Card>
  )
}
