// Badge({ children, tone = 'default' }) → span.badge.badge--{tone}
export function Badge({children, tone = 'default'}) {
    return <span className={`badge badge--${tone}`}>{children}</span>
}

// Panel({ kicker, title, children }) → section.panel + p.panel__kicker + h2 + div.panel__body
export function Panel({kicker, title, children}) {
    return (
        <section className="panel">
            <p className="panel__kicker">{kicker}</p>
            <h2>{title}</h2>
            <div className="panel__body">{children}</div>
        </section>
    )
}

// MemberCard({ name, role, location, status, statusTone, intro }) → article.member
export function MemberCard({name, role, location, status, statusTone, intro}) {
    return (
        <article className="member">
            <div className="member__avatar">{name[0]}</div>
            <div className="member__content">
                <div className="member__head">
                    <h3>{name}</h3>
                    <Badge tone={statusTone}>{status}</Badge>
                </div>
                <p className="muted">{role} · {location}</p>
                <p className="member__intro">{intro}</p>
            </div>
        </article>
    )
}

export default function Lesson01Exercise() {
    return (
        <Panel kicker="TEAM" title="链上研究小组">
            <MemberCard
                name="林舟"
                role="Frontend Engineer"
                location="Shanghai"
                status="开放合作"
                statusTone="success"

                intro="正在把 Vue 的经验迁移到 React，目标是能独立做链上数据面板。"
            />
            <MemberCard
                name="Maya Chen"
                role="Protocol Researcher"
                location="Remote"
                status="专注中"
                statusTone="warning"
                intro="研究 L2 状态增长与数据可用性，喜欢把复杂问题画成图。"
            />
        </Panel>
    )
}
