const tasks = [
  {
    id: 'read-docs',
    title: '读完条件渲染与列表文档',
    category: 'React',
    done: true,
    priority: 'medium',
  },
  {
    id: 'build-list',
    title: '做出第一版任务列表',
    category: 'Practice',
    done: false,
    priority: 'high',
  },
  {
    id: 'rpc-notes',
    title: '整理 JSON-RPC 请求格式',
    category: 'Web3',
    done: false,
    priority: 'low',
  },
]

function EmptyTasks() {
  return (
    <div className="empty-state">
      <p>这个列表还是空的。</p>
      <span>新任务会出现在这里。</span>
    </div>
  )
}

function TaskSummary({ tasks }) {
  const pendingCount = tasks.filter((task) => !task.done).length

  if (tasks.length === 0) {
    return <span className="board-count">暂无任务</span>
  }

  return (
    <span className="board-count">
      {pendingCount > 0 ? `${pendingCount} 项待完成` : '全部完成'}
    </span>
  )
}

function StatusPill({ done }) {
  return (
    <span className={`status ${done ? 'status--done' : 'status--active'}`}>
      {done ? '已完成' : '进行中'}
    </span>
  )
}

function TaskItem({ task }) {
  const isHighPriority = task.priority === 'high'

  return (
    <li className={`task ${task.done ? 'task--done' : ''}`}>
      <div className="task__body">
        <div className="task__title-row">
          <h3 className="task__title">{task.title}</h3>
          {isHighPriority && <span className="priority">高优先级</span>}
        </div>
        <p className="task__meta">{task.category}</p>
      </div>
      <StatusPill done={task.done} />
    </li>
  )
}

function TaskList({ title, tasks }) {
  return (
    <section className="task-board">
      <header className="task-board__head">
        <div>
          <p className="board-kicker">TASK BOARD</p>
          <h2>{title}</h2>
        </div>
        <TaskSummary tasks={tasks} />
      </header>

      {tasks.length === 0 ? (
        <EmptyTasks />
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Lesson02Demo() {
  return (
    <div className="stack">
      <TaskList title="本周任务" tasks={tasks} />
      <TaskList title="已归档" tasks={[]} />

      <p className="demo-note">
        条件渲染决定“显示什么”，列表渲染决定“重复显示多少份”，
        <code>key</code> 帮助 React 识别每一个列表项。
      </p>
    </div>
  )
}
