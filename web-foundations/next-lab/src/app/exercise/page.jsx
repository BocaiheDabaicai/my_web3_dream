import Link from 'next/link'

export default function ExercisePage() {
    return (
        <div className="panel">
            <h2>这个页面是 /exercise</h2>
            <p>
                对应文件：<code>src/app/exercise/page.jsx</code>
            </p>
            <p>
                上面的导航来自 <code>src/app/exercise/layout.jsx</code>。
                切到区块或关于页面时，导航不会消失。
            </p>

            <Link className="button" href="/exercise/blocks">
                去看 /exercise/blocks
            </Link>
        </div>
    )
}
