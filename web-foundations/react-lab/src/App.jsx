import Lesson05Demo from './lessons/lesson-05/Demo'
import Lesson05Exercise from './lessons/lesson-05/Exercise'

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
            05
          </span>
          <div>
            <h1>把状态逻辑收进一处</h1>
            <p>useReducer · Context · 跨组件共享状态</p>
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
          <Lesson05Demo />
          <p className="column-note">源码：src/lessons/lesson-05/Demo.jsx</p>
        </section>

        <section className="lab__column lab__column--exercise">
          <div className="column-head">
            <div>
              <span className="column-kicker">EXERCISE</span>
              <h2>你的练习</h2>
            </div>
            <span className="column-badge column-badge--exercise">WRITE</span>
          </div>
          <Lesson05Exercise />
          <p className="column-note">任务卡：src/lessons/lesson-05/README.md</p>
        </section>
      </main>

      <footer className="site-footer">
        <span>my_web3_dream · Web Foundations</span>
        <span>下一课：useEffect</span>
      </footer>
    </div>
  )
}
