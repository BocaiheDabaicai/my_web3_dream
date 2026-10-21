# Lesson 04 · 表单、受控组件与状态提升

> 对应 React 官方文档：
> [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state) ·
> [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) ·
> [`<input>`](https://react.dev/reference/react-dom/components/input) ·
> [`<select>`](https://react.dev/reference/react-dom/components/select) ·
> [`<textarea>`](https://react.dev/reference/react-dom/components/textarea) ·
> [`<form>`](https://react.dev/reference/react-dom/components/form)

## 一句话

受控组件的显示值来自 React state，用户输入只是“通知” state 变化；多个组件需要同一份数据时，把 state 提升到共同父组件，数据向下传、事件向上报。

## 本课目标

- 理解受控组件：`value` / `checked` 与 `onChange` 必须成对出现。
- 会处理文本、数字、`textarea`、`select` 和 `checkbox`。
- 会用 `onSubmit` + `event.preventDefault()` 处理表单提交。
- 会用 `name` + 通用 `handleChange` 管理一个对象的多个字段。
- 会区分“派生值”和 state，不把可计算的数据塞进 state。
- 理解并实践状态提升：state 放在共同父组件，子组件只负责显示和通知变化。

本课仍然不涉及网络请求和 `useEffect`。

## 1. 表单事件

### 1.1 `onSubmit` 与默认行为

浏览器提交表单时默认会刷新页面。单页应用里通常不希望这样，所以提交处理器第一件事是阻止默认行为：

```jsx
function handleSubmit(event) {
  event.preventDefault()
  // 处理数据
}

<form onSubmit={handleSubmit}>
  <button type="submit">提交</button>
</form>
```

- 表单里的按钮默认 `type="submit"`，点击会触发表单的 `onSubmit`。
- 不想触发表单提交的按钮要显式写 `type="button"`，例如“重置”。
- 在输入框里按 Enter 也会触发表单提交，所以 `preventDefault` 同样必要。

### 1.2 `onChange` 每次输入都会触发

React 的 `onChange` 对文本输入来说相当于原生的 `input` 事件，每敲一个字符都会触发，而不是等失焦。

```jsx
function handleChange(event) {
  console.log(event.target.name, event.target.value)
}

<input name="to" onChange={handleChange} />
```

### 1.3 `event.target` 上的关键字段

| 字段 | 用途 |
| --- | --- |
| `event.target.value` | 文本、数字、`textarea`、`select` 的值 |
| `event.target.name` | 对应 state 里的字段名，通用处理器靠它区分 |
| `event.target.type` | 区分 `checkbox`、`radio`、`number` 等 |
| `event.target.checked` | 复选框 / 单选框是否选中 |

注意：`type="number"` 的输入框，`event.target.value` 仍然是**字符串**。需要计算时再转换。

## 2. 受控组件

### 2.1 `value` + `onChange` 成对出现

受控组件的意思是：输入框显示什么，完全由 React state 决定。

```jsx
const [address, setAddress] = useState('')

<input
  value={address}
  onChange={(event) => setAddress(event.target.value)}
/>
```

一次输入背后的流程：

```text
用户敲键盘
  → 浏览器触发 onChange
  → 事件处理器调用 setAddress
  → React 重新渲染
  → input 的 value 属性变成新 state
  → 输入框显示新内容
```

state 是唯一数据源（single source of truth）。输入框本身不保存“最终值”。

### 2.2 只写 `value`、不写 `onChange` 会怎样

输入框会变成只读，React 在控制台给出警告：

```text
You provided a `value` prop to a form field without an `onChange` handler.
This will render a read-only field.
```

这不是 bug，是受控组件的规则：值由 state 决定，但没有事件去更新 state，用户当然改不了。

### 2.3 各种控件的受控写法

**文本 / 数字**

```jsx
<input value={form.to} onChange={handleChange} />
<input type="number" value={form.amount} onChange={handleChange} />
```

**textarea**

HTML 里 `textarea` 的值写在 children 里；React 里统一用 `value`：

```jsx
<textarea value={form.memo} onChange={handleChange} />
```

**select**

`value` 写在 `select` 上，`option` 用 `value` 属性：

```jsx
<select value={form.token} onChange={handleChange}>
  <option value="ETH">ETH</option>
  <option value="USDC">USDC</option>
</select>
```

不要给 `option` 写 `selected`，那会变成非受控写法。

**checkbox**

复选框用 `checked`，事件里读 `event.target.checked`：

```jsx
<input
  type="checkbox"
  checked={form.acknowledged}
  onChange={handleChange}
/>
```

**radio**

同一组 radio 共享 `name`，用 `checked` 判断当前选中项，仍用 `value` 读取选中值：

```jsx
<input
  type="radio"
  name="network"
  value="mainnet"
  checked={network === 'mainnet'}
  onChange={handleChange}
/>
```

### 2.4 受控 vs 非受控

| | 受控组件 | 非受控组件 |
| --- | --- | --- |
| 值由谁保存 | React state | DOM 自己 |
| 初始值 | `value` / `checked` | `defaultValue` / `defaultChecked` |
| 读取值 | 直接读 state | 通过 `ref` 或表单数据 |
| 适合场景 | 实时校验、联动、格式化、条件禁用 | 简单的一次性表单、文件上传 |

本课程优先使用受控组件。`useRef` 在第 07 课。

### 2.5 每次输入都会重新渲染

这是受控组件的正常代价：每次按键更新 state，组件重新渲染一次。对本项目的表单规模完全不是问题，不要提前优化。

## 3. 多字段与派生值

### 3.1 用一个对象管理多个字段

字段之间属于同一份草稿时，放在一个对象里更容易保持一致：

```jsx
const [form, setForm] = useState({
  to: '',
  amount: '',
  memo: '',
  token: 'ETH',
  acknowledged: false,
})
```

### 3.2 一个通用 `handleChange`

给每个输入加 `name`，让 `name` 和 state 字段同名，然后共用同一个处理器：

```jsx
function handleChange(event) {
  const { name, value, type, checked } = event.target

  setForm((current) => ({
    ...current,
    [name]: type === 'checkbox' ? checked : value,
  }))
}
```

三个关键点：

- `[name]` 是计算属性名，把 `name` 的值当作字段名。
- checkbox 读 `checked`，其他控件读 `value`。
- 仍然使用函数式 updater 和对象展开，不直接修改 `current`。

### 3.3 数字输入仍然是字符串

即使用户输入 `0.5`，state 里保存的也是字符串 `'0.5'`。让输入框保持字符串更好编辑，只有在计算时再转换：

```jsx
const amountNumber = Number(form.amount) || 0
const fee = amountNumber * 0.001
```

如果把 `Number(...)` 的结果直接写回 state，用户很难输入中间状态（比如空值或 `0.`）。

### 3.4 派生值不要放进 state

手续费、总额、是否可提交，都能由现有 state 算出来，就放在渲染期间计算：

```jsx
const amountNumber = Number(form.amount) || 0
const fee = amountNumber * 0.001
const isValid =
  form.to.trim() !== '' && amountNumber > 0 && form.acknowledged
```

不要额外维护 `const [fee, setFee] = useState(0)`。两个 state 需要手动同步，迟早会不一致。

### 3.5 重置表单

```jsx
setForm(initialForm)
```

前提是 `initialForm` 从未被修改。我们每次更新都用新对象，所以这个常量始终是干净的初始值。

### 3.6 常见陷阱

- `value` 写了，但忘了 `onChange`。
- checkbox 用了 `value` 而不是 `checked`。
- 输入框没有 `name`，通用处理器无法知道更新哪个字段。
- 在 `handleChange` 里直接 `form.to = ...`，修改了 state。
- 把 `isValid`、`fee` 这类派生值也放进 state。
- 表单提交忘了 `event.preventDefault()`，页面刷新后 state 全丢。

## 4. 状态提升

### 4.1 问题：两个组件需要同一份数据

假设表单组件自己保存 `draft`，预览组件也需要显示这份草稿。如果各存一份，两边会不一致；如果让预览组件去“读取”表单组件的内部 state，组件之间就产生了隐式依赖。

### 4.2 做法：把 state 提到共同父组件

把 state 放在两个组件的**最近共同父组件**里：

```text
Lesson04Exercise（拥有 draft、notice）
├─ TransferForm     ← 接收 draft / onChange / onSubmit / onReset
└─ TransferPreview  ← 接收 draft / fee / isValid / notice
```

- 数据向下传：父组件把 `draft` 作为 props 传给两个子组件。
- 事件向上报：子组件触发输入时，调用父组件传下来的 `onChange`。
- 父组件更新 state 后重新渲染，两个子组件同时拿到新值。

### 4.3 子组件保持“受控”

子组件不拥有 state，只负责两件事：把传入的值显示出来，把用户操作通知给父组件。

```jsx
function TransferForm({ draft, onChange }) {
  return (
    <input name="to" value={draft.to} onChange={onChange} />
  )
}
```

父组件：

```jsx
<TransferForm draft={draft} onChange={handleChange} />
```

`handleChange` 仍然定义在父组件里，因为它要调用父组件的 `setDraft`。

### 4.4 提升的边界

只提升到“需要共享这份数据的组件们的最近共同父组件”，不要一上来就放到全局。状态放得越高，更新影响的范围越大，组件也越难复用。

### 4.5 不要用 props 初始化 state

```jsx
const [value, setValue] = useState(props.value) // 之后 props 变化不会同步
```

这会让 state 和 prop 出现两份来源。需要完全受控就只用 props；确实需要“重置初始化”，用 `key` 让组件重新挂载（后续课程会遇到）。

## 5. 与 Vue 对照

| Vue | React |
| --- | --- |
| `v-model="form.to"` | `value={form.to}` + `onChange={handleChange}` |
| `.prevent` 修饰符 | `event.preventDefault()` |
| `:value` / `:checked` | `value` / `checked` |
| 子组件 `emit('update:modelValue')` | 子组件调用父组件传入的回调 |
| 状态放在共同父组件 | 状态提升（同样的思路） |
| `reactive` 自动追踪深层修改 | 创建新对象/数组，交给 setter |
| 修改后自动更新视图 | setter 请求重新渲染，用新快照更新 |

React 没有内置双向绑定，`value + onChange` 就是“手动版 v-model”。写几次之后会发现它只是显式，并不复杂。

## 6. 练习任务卡

### 背景

做一个只读的“交易预览台”：填写交易草稿，实时预览；表单和预览是两个兄弟组件，共享同一份草稿状态。

### 初始状态

在 `Lesson04Exercise` 中定义：

```js
const initialDraft = {
  to: '',
  amount: '',
  memo: '',
  token: 'ETH',
  acknowledged: false,
}
```

state 放在父组件：

```jsx
const [draft, setDraft] = useState(initialDraft)
const [notice, setNotice] = useState('')
```

派生值也在父组件计算：

```jsx
const amountNumber = Number(draft.amount) || 0
const fee = amountNumber * 0.001
const isValid =
  draft.to.trim() !== '' && amountNumber > 0 && draft.acknowledged
```

### 组件接口

**TransferForm**

```text
TransferForm({ draft, onChange, onSubmit, onReset, fee })

form.tx-form
  onSubmit={onSubmit}

  div.form-grid
    label.field
      span.field__label        ← "收款地址"
      input.input              ← name="to"，受控
    label.field
      span.field__label        ← "金额"
      input.input              ← name="amount" type="number" min="0" step="0.0001"，受控

  div.form-grid
    label.field
      span.field__label        ← "代币"
      select.select            ← name="token"，选项 ETH / USDC / DAI，受控
    div.field
      span.field__label        ← "预估手续费"
      div.input.input--readonly ← `${fee.toFixed(4)} ${draft.token}`

  label.field
    span.field__label          ← "备注"
    textarea.textarea          ← name="memo"，受控

  label.check
    input[type="checkbox"]     ← name="acknowledged"，受控，使用 checked
    span                       ← "我已知晓这是只读演示，不会发起真实交易。"

  div.form-actions
    button.btn.btn--primary[type="submit"]   ← "生成预览"
    button.btn.btn--ghost[type="button"]     ← "重置"，onClick={onReset}
```

**TransferPreview**

```text
TransferPreview({ draft, fee, isValid, notice })

section.control-card
  header.control-card__head
    div
      p.board-kicker           ← "LIVE PREVIEW"
      h2                       ← "实时预览"
    span.board-count           ← `${fee.toFixed(4)} ${draft.token}`
  div.preview-rows
    PreviewRow("收款地址", draft.to || "—")
    PreviewRow("金额", draft.amount ? `${draft.amount} ${draft.token}` : "—")
    PreviewRow("预估手续费", `${fee.toFixed(4)} ${draft.token}`)
    PreviewRow("备注", draft.memo || "—")
    PreviewRow("状态", isValid ? "可以生成预览" : "待完善")
  notice && p.notice.notice--success 或 notice--error ← notice
```

`PreviewRow({ label, value })` 的结构：

```text
div.preview-row
  ├─ span.preview-row__label ← label
  └─ span.preview-row__value ← value
```

### 行为契约

**handleChange(event)**

- 从 `event.target` 读取 `name`、`value`、`type`、`checked`。
- checkbox 使用 `checked`，其他控件使用 `value`。
- 使用函数式 updater + 对象展开更新 `draft`，不能修改 `current`。
- 每次输入同时调用 `setNotice('')`，清掉上一次提交提示。

**handleSubmit(event)**

- 调用 `event.preventDefault()`。
- `isValid` 为 false 时：`setNotice('请填写完整的地址和金额，并勾选确认。')`。
- `isValid` 为 true 时：`setNotice(\`预览已生成：${draft.amount} ${draft.token} → ${draft.to}\`)`。

**reset()**

- `setDraft(initialDraft)`。
- `setNotice('')`。

**Lesson04Exercise**

- 所有 state 都在这里，`TransferForm` 和 `TransferPreview` 不拥有 state。
- 把 `draft`、`onChange`、`onSubmit`、`onReset`、`fee` 传给表单；把 `draft`、`fee`、`isValid`、`notice` 传给预览。
- 用 `div.stack` 包住两个 `section.control-card`。

### 验收标准

- [ ] 初始：地址、金额、备注为空，代币为 ETH，复选框未选中；预览显示占位符，手续费为 `0.0000 ETH`。
- [ ] 在地址或备注输入时，预览内容实时变化，说明是受控组件。
- [ ] 金额输入 `0.5` 且代币为 ETH 时，手续费显示 `0.0005 ETH`；切换为 USDC 后同步变化。
- [ ] 勾选复选框后预览状态变为“可以生成预览”。
- [ ] 未填完整时点击“生成预览”，页面不刷新，显示错误提示。
- [ ] 地址、金额有效且已勾选时提交，显示成功提示。
- [ ] 点击“重置”后所有字段和提示恢复初始，代币回到 ETH。
- [ ] `TransferForm` 和 `TransferPreview` 内部没有 `useState`；所有状态在父组件。
- [ ] 输入框没有 “value prop without onChange” 警告。
- [ ] 更新过程中没有直接修改 `draft` 或 `initialDraft`；没有把 `fee`、`isValid` 存进 state。
- [ ] 浏览器控制台无报错，`npm run lint` 和 `npm run build` 通过。

### 页面结构

> `Exercise.jsx` 里的静态结构与 classname 已提前准备好。你只需要：添加 state、实现三个处理函数、把状态和回调传给子组件、给输入接上 `value`/`checked` + `onChange`，并把提交按钮改为 `type="submit"`、给表单补上 `onSubmit`。

```text
div.stack
├─ section.control-card                 ← 表单
└─ section.control-card                 ← 预览
```

### 分级提示

<details>
<summary>提示 1 · 概念</summary>

- 受控输入永远成对：`value`（checkbox 用 `checked`）+ `onChange`。
- 通用处理器靠 `name` 找到字段：`[event.target.name]`。
- checkbox 的 `event.target.checked` 是布尔值，其他控件的 `value` 是字符串。
- 表单提交先 `event.preventDefault()`，再校验。
- state 放在父组件，子组件通过 props 拿值、通过回调通知父组件。
- `fee` 和 `isValid` 在渲染时算，不要用 `useState`。

</details>

<details>
<summary>提示 2 · 结构</summary>

1. 在 `Lesson04Exercise` 里把占位的 `draft` 换成 `useState(initialDraft)`，再添加 `notice` state。
2. 写 `handleChange`：解构 `event.target`，用 updater + 展开更新 `[name]`，checkbox 用 `checked`。
3. 用已有的 `amountNumber` 写 `fee` 和 `isValid`（脚手架里已经给了一半，确认它们仍然正确）。
4. 写 `handleSubmit` 和 `reset`。
5. 把 props 传给 `TransferForm` 和 `TransferPreview`。
6. 在 `TransferForm` 里给每个输入补 `value`/`checked` 和 `onChange`，表单补 `onSubmit`，提交按钮改成 `type="submit"`。

</details>

<details>
<summary>提示 3 · 局部示例</summary>

`handleChange` 的参考实现如下，提交、重置和输入接线自己完成：

```jsx
function handleChange(event) {
  const { name, value, type, checked } = event.target

  setDraft((current) => ({
    ...current,
    [name]: type === 'checkbox' ? checked : value,
  }))
  setNotice('')
}
```

受控输入的样子：

```jsx
<input
  className="input"
  name="to"
  value={draft.to}
  onChange={onChange}
/>
```

</details>

### 完成后

保存文件，回到对话告诉我“第四课完成”。我会检查受控输入、提交行为、状态提升和派生值，通过后进入第五课：`useReducer` 与 Context。

## 7. 自查问题

<details>
<summary>1. 为什么只写 value、不写 onChange，输入框会变成只读？</summary>

受控组件的显示值来自 state。用户输入触发 onChange，处理器更新 state，React 重新渲染后才显示新值。没有 onChange 就没有更新 state 的路径，所以值永远停在初始 state；React 也会在控制台警告。

</details>

<details>
<summary>2. 为什么 checkbox 用 checked 而不是 value？</summary>

checkbox 的“选中状态”是布尔值，DOM 用 `checked` 属性表达；`value` 是它提交时携带的值，两者不是一回事。受控 checkbox 要绑 `checked`，事件里读 `event.target.checked`。

</details>

<details>
<summary>3. 为什么金额 state 保存字符串，而不是直接存 number？</summary>

输入框的 `value` 始终是字符串，而且用户编辑过程中会出现空字符串、`0.` 等中间状态。保持字符串让输入自然；需要计算时再 `Number(...)`，并把非法值当作 0 或判定为无效。

</details>

<details>
<summary>4. 为什么两个兄弟组件共享数据时，要把 state 放到父组件？</summary>

state 在子组件里时，另一个兄弟无法直接读取，只能通过隐式的组件引用或复制数据来同步，容易不一致。放到共同父组件后，父组件是唯一数据源，两个子组件接收同一份 props；子组件通过父组件传下来的回调通知更新。

</details>

<details>
<summary>5. 为什么表单提交一定要 preventDefault？</summary>

浏览器默认的表单提交会导航到新页面或刷新当前页面，React state 会全部丢失。单页应用里通常由 JavaScript 接管提交，所以先阻止默认行为，再执行自己的校验和状态更新。

</details>
