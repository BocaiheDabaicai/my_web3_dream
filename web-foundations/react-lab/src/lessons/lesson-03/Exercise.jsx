// 目标：用 useState 管理 chain = { block, logs }，实现一个区块脉冲面板。
// 状态结构、行为契约与验收标准见 lesson-03/README.md。

export default function Lesson03Exercise() {
  return (
    <div className="exercise-placeholder">
      <span className="exercise-placeholder__index">TODO · LESSON 03</span>
      <h3>轮到你了</h3>
      <p>
        用 <code>useState</code> 管理区块高度和出块日志，做一个可交互的区块脉冲面板。
      </p>
      <ul>
        <li>一个 state 对象同时保存 block 和 logs。</li>
        <li>“三连出块”一次点击必须加 3 个块并写入 3 条日志。</li>
        <li>清空日志不能改变当前区块高度。</li>
        <li>用不可变更新，不要直接修改 state 对象或数组。</li>
      </ul>
      <p className="muted">完整契约、初始状态与验收标准见 lesson-03/README.md</p>
    </div>
  )
}
