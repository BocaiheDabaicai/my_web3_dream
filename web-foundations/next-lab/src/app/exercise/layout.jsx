import Link from 'next/link'

export default function ExerciseLayout({children}) {
    return (
        <section>
            <p className="kicker">EXERCISE</p>
            <h1>练习路由</h1>

            <nav className="sub-nav">
                <Link href="/exercise">首页</Link>
                <Link href="/exercise/blocks">区块</Link>
                <Link href="/exercise/about">关于</Link>
                <Link href="/exercise/server-client">Server/Client</Link>
                <Link href="/exercise/blocks">区块</Link>
            </nav>

            {children}
        </section>
    )
}
