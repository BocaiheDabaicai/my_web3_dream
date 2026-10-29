import Lesson09Demo from './lessons/lesson-09/Demo'
import Lesson09Exercise from './lessons/lesson-09/Exercise'

export default function App() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="site-header__meta">
          <span className="pill">WEB FOUNDATIONS</span>
          <span className="slash">/</span>
          <span>REACT LAB</span>
        </div>

        <div className="site-header__lesson">
          <span className="lesson-index" aria-hidden="true">
            09
          </span>
          <div>
            <h1>把八课拼成一件作品</h1>
            <p>综合练习 · 链上资产面板 · React 阶段收官</p>
          </div>
        </div>
      </header>

      <main className="lab">
        <section className="lab__column lab__column--demo">
          <div className="column-head">
            <div>
              <span className="column-kicker">DEMO</span>
              <h2>我写的示例</h2>
            </div>
            <span className="column-badge column-badge--demo">READ</span>
          </div>
          <Lesson09Demo />
          <p className="column-note">源码：src/lessons/lesson-09/Demo.jsx</p>
        </section>

        <section className="lab__column lab__column--exercise">
          <div className="column-head">
            <div>
              <span className="column-kicker">EXERCISE</span>
              <h2>你的练习</h2>
            </div>
            <span className="column-badge column-badge--exercise">WRITE</span>
          </div>
          <Lesson09Exercise />
          <p className="column-note">
            任务卡：src/lessons/lesson-09/README.md
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <span>my_web3_dream · Web Foundations</span>
        <span>React 阶段收官 · 下一阶段：Next.js</span>
      </footer>
    </div>
  )
}
