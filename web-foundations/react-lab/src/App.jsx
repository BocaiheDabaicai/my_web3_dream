import Lesson03Demo from './lessons/lesson-03/Demo'
import Lesson03Exercise from './lessons/lesson-03/Exercise'

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
            03
          </span>
          <div>
            <h1>让页面真正动起来</h1>
            <p>事件处理 · useState · 状态快照 · 函数式更新</p>
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
          <Lesson03Demo />
          <p className="column-note">源码：src/lessons/lesson-03/Demo.jsx</p>
        </section>

        <section className="lab__column lab__column--exercise">
          <div className="column-head">
            <div>
              <span className="column-kicker">EXERCISE</span>
              <h2>你的练习</h2>
            </div>
            <span className="column-badge column-badge--exercise">WRITE</span>
          </div>
          <Lesson03Exercise />
          <p className="column-note">任务卡：src/lessons/lesson-03/README.md</p>
        </section>
      </main>

      <footer className="site-footer">
        <span>my_web3_dream · Web Foundations</span>
        <span>下一课：表单与状态提升</span>
      </footer>
    </div>
  )
}
