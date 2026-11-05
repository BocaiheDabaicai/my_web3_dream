import Link from "next/link";

export default function BlocksPage() {
    return (
        <div className="panel">
            <h2>区块</h2>
            <p>
                对应文件：<code>src/app/exercise/blocks/page.jsx</code>
            </p>
            <ul>
                <li><Link className="card" key={`21000001`} href={`/exercise/blocks/21000001`}>#21,000,001</Link></li>
                <li><Link className="card" key={`21000002`} href={`/exercise/blocks/21000002`}>#21,000,002</Link></li>
                <li><Link className="card" key={`21000003`} href={`/exercise/blocks/21000003`}>#21,000,003</Link></li>
            </ul>
        </div>
    )
}
