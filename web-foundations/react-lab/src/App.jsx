import Lesson07Demo from './lessons/lesson-07/Demo'
import Lesson07Exercise from './lessons/lesson-07/Exercise'

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
            07
          </span>
          <div>
            <h1>直接和 DOM 说话</h1>
            <p>useRef · DOM refs · 不触发渲染的容器</p>
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
          <Lesson07Demo />
          <p className="column-note">源码：src/lessons/lesson-07/Demo.jsx</p>
        </section>

        <section className="lab__column lab__column--exercise">
          <div className="column-head">
            <div>
              <span className="column-kicker">EXERCISE</span>
              <h2>你的练习</h2>
            </div>
            <span className="column-badge column-badge--exercise">WRITE</span>
          </div>
          <Lesson07Exercise />
          <p className="column-note">任务卡：src/lessons/lesson-07/README.md</p>
        </section>
      </main>

      <footer className="site-footer">
        <span>my_web3_dream · Web Foundations</span>
        <span>下一课：自定义 Hook 与组件复用</span>
      </footer>
    </div>
  )
}
