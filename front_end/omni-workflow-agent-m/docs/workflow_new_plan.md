# 工作流内容区完整技术规划（二次实现）

## 一、目标与范围

- **目标**：在现有底部结构（快捷操作 + 输入条），动态内容区（可编辑区+录音模块）之上，完善**动态内容区**，欢迎态（已完成）、录音态（录音模块（已完成） + 时间轴 + 可编辑区（已完成））的逻辑联通（todo）、文档态（仅可编辑区）（todo），以及文档式块序列的展示与编辑规则。
---

## 二、展示模式（Mode）
目前存在问题缺少录音模式（recording）和（document）的切换逻辑


| 模式        | 触发条件                   | 顶部录音模块  | 左侧时间轴 | 主区可编辑内容 |
| --------- | ---------------------- | ------- | ----- | ------- |
| welcome   | 首次进入、无任何块且无进行中录音       | 不展示     | 不展示   | 仅展示欢迎语  |
| recording | 用户发起录音或上传音频，存在转写/录音上下文 | 展示（可折叠） | 展示    | 展示块序列   |
| document  | 用户仅文本输入或上传文档，无录音上下文    | 不展示     | 不展示   | 展示块序列   |


**模式判定逻辑(已实现部分)**  

- 初始为 welcome。  
- 若存在「录音会话」或「转写结果」则可为 recording；若用户主动折叠录音条，仍为 recording，仅 UI 折叠。  
- 若仅有文本/文档输入、从未进入录音流程，则为 document。  
- 从 recording 切到「仅编辑」时可保留为 recording（只折叠录音条）或新增 document，由产品决定；技术上前端维护一个 `mode` 枚举即可。

---

## 三、数据模型（类型与状态）

### 3.1 块（Block）抽象

- **唯一标识**：每个块有稳定 `id`（如 UUID 或前端生成的自增 id）。  
- **类型**：  
  - `user`：用户输入内容（文本或上传文件引用）。  
  - `ai`：AI 生成内容（当前仅考虑文本）；用户编辑后仍可标记为「用户已编辑」或转为 user 块，见下。
- **内容**：  
  - 文本块：`content: string`。  
  - 文件块（缺少）：`fileRef`（如 url、path、mimeType、fileName），可选附带 `content` 作摘要或 OCR 文本。
- **元数据**：  
  - `createdAt`：用于排序与展示时间。（可选）  
  - `sourceBlockId`：仅 AI 块需要，表示「由哪一块触发生成」，用于判断「是否由首问生成」以实现首问锁定。  
  - `editedByUser`：布尔，表示该块是否曾被用户编辑过；一旦某条 AI 块（且其 sourceBlockId 为首块 id）被编辑，则首问不可再编辑。

**块顺序**：使用有序数组 `Block[]` 表示，下标即文档顺序；不采用树形结构，以便「截断并重新生成」语义简单（删除某下标之后的所有块）。

### 3.2 首问锁定

- **含义**：第一个块（index 0）若为 user 块，视为「初始提问」。当用户对「由该首块直接或间接生成」的任意 AI 块进行过编辑并保存后，首问块不可再编辑。  
- **实现方式**：全局或页级状态 `firstQuestionLocked: boolean`。当用户保存对某 AI 块的编辑时，若该块 `sourceBlockId === blocks[0].id`，则置 `firstQuestionLocked = true`。渲染首块时，若 `firstQuestionLocked` 为 true，不展示编辑入口或置为禁用。

### 3.3 录音/转写相关（供录音态与时间轴使用）（录音模块已有完备ui样式和残留逻辑）

- **录音会话**：当前是否有录音中、是否有未关闭的「本次录音」会话；用于决定是否展示录音条与时间轴。  
- **转写结果**：建议结构为「带时间戳的段落或句子列表」，每项包含：`startTime`、`endTime`（秒或毫秒）、`text`、可选 `blockId`（关联到编辑区某块，便于点击时间轴定位）。  
- 转写完成后，可生成一个或多个 user 块（如整段转写为一个块，或按句拆块）；时间轴数据与块可分开存储，通过 `blockId` 或顺序对应。

---

## 四、编辑规则（行为规格）

### 4.1 编辑「初始提问」块（blocks[0] 且为 user）

- **允许条件**：`!firstQuestionLocked`。  
- **操作**：用户修改内容并确认后，  
  - 用新内容更新 `blocks[0]`；  
  - 将 `blocks` 截断为仅保留 `blocks[0]`（即删除其后所有块）；  
  - 触发「从首块重新生成」逻辑（调用后端或 mock：以 blocks[0] 为输入，在块序列末尾追加新的 AI 块）；  
  - 不修改 `firstQuestionLocked`（因为尚未对「该首问生成的 AI 块」做编辑）。

### 4.2 编辑「非首块」或「AI 块」

- **非首块 user 块**：若产品允许编辑，则更新该块 content；是否「其下重置」由产品决定，当前规划为「不重置，仅更新本条」。  
- **AI 块**：  
  - 用户修改内容并确认后，更新该块 content，并设置 `editedByUser = true`；若该块 `sourceBlockId === blocks[0].id`，则置 `firstQuestionLocked = true`。  
  - **不**删除该块之后的块；在该 AI 块**之后**发起一次「基于当前上下文」的生成请求，将返回结果**追加**为新的 AI 块（新块 `sourceBlockId` 可设为当前被编辑块的 id 或首块 id，视产品语义而定）。

### 4.3 新增用户内容（输入框发送 / 上传文件 / 快捷指令）

- 在 `blocks` 末尾追加新的 user 块；若当前为 welcome 模式，先切到 document 或 recording（视是否有录音上下文）。  
- 随后触发「基于最新块序列」的生成，结果追加为 AI 块。

---

## 五、UI 结构（组件职责与层级）

### 5.1 整体布局（自上而下）

1. **内容区容器**（占满除底部栏外的空间，可滚动或内部再分栏） （已有）
  - 条件渲染：  
    - **welcome**：仅渲染欢迎语组件（居中或靠上）。  
    - **recording / document**：渲染「可编辑文档区」；若为 recording，其上方与左侧再挂载录音条与时间轴。
2. **录音模块（仅 recording 时）** （已有）（出现时机需要优化）
  - 顶部横条，可折叠；折叠后可保留一条窄条或图标。  
  - 内部：录音控制（开始/暂停/结束）、波形或时长展示、上传/转写状态等（具体控件不展开）。
3. **时间轴（仅 recording 时）** 
  - 左侧固定宽度竖条，根据转写结果渲染时间戳/句列表；点击某条可滚动主区到对应块（若存在 blockId 关联）。
4. **可编辑文档区（主区）** （已有）（需要优化）
  - 垂直列表，每项为一「块」：用户块与 AI 块采用文档式样式（非聊天气泡），例如统一左对齐、不同背景或边框区分角色、块内可内联编辑或点击编辑按钮进入编辑态。
5. **底部固定**（已有）
  - 快捷操作条、输入框；不随内容区滚动。

### 5.2 可编辑文档区内部

- **列表**：使用 ScrollView 或 FlatList；块较多时建议 FlatList 以保性能。  
- **单块组件**：  
  - 接收单条 block、是否允许编辑、onEdit、onSave 等回调。  
  - 展示：用户块展示文本或文件卡片；AI 块展示文本，样式与用户块区分。  
  - 编辑态：点击编辑后，该块变为可编辑输入框（或弹出层），提供「取消」「保存」；保存时调用上层传入的 onSave(blockId, newContent)，由上层按「编辑规则」更新 blocks 与 firstQuestionLocked，并决定是否触发重新生成或追加生成。
- **滚动与定位**：新块追加后滚动到底部；时间轴点击时若带 blockId，可计算该块在列表中的位置并 scrollToOffset。

## 六、状态流与回调（无代码，仅契约）

### 6.1 workflow 页持有并下发的状态

- `mode`：三选一。  
- `blocks`：有序块数组。  
- `firstQuestionLocked`：布尔。  
- （可选）`transcriptWithTimestamps`、录音条折叠状态等。

### 6.2 子组件回调约定

- **可编辑文档区**：  
  - `onBlockEdit(blockId)`：进入编辑（由父层可决定是否允许，如根据 firstQuestionLocked 与 block 下标）。  
  - `onBlockSave(blockId, newContent)`：父层更新对应块、执行编辑规则（截断/追加/设 firstQuestionLocked）、触发生成。
- **输入条**：  
  - `onSubmit(text)` 或 `onSubmit(text, files)`：追加 user 块、触发生成、滚动到底。
- **录音模块**（若本阶段实现）：  
  - 录音结束或上传完成后，将转写结果写入 `transcriptWithTimestamps` 并生成对应 user 块；父层将 mode 设为 recording（若尚未），并刷新时间轴与块列表。

## 参考数据模型（可结合上文以及现有模式进行修补）

在 [constants/type.ts](constants/type.ts) 中扩展或新增「工作流消息」类型，用于内容区列表与编辑/二次提交：

```ts
// 单条消息/输出
export type WorkflowMessageRole = 'user' | 'assistant' | 'system';

export interface WorkflowMessage {
  id: string;
  role: WorkflowMessageRole;
  content: string;
  createdAt: number;           // 用于排序与展示时间
  isEditable?: boolean;       // 是否允许编辑（通常仅 user）
  status?: 'pending' | 'done' | 'error';  // 可选：流式/异步状态
}
```

## 参考执行逻辑（仅参考）
TODO：
1.读取理解 Workflow_ContentArea 核心逻辑，理解架构
2.补录理解录音ui样式/逻辑和目前整个workflow大致架构
3.修改现有type
4....

## 总进度（目前已完成）
1.录音样式/展开/收起逻辑，只需修改何时触发，目前为输入录音字符触发
2.整页面布局确定（顶部录音样式+中间可滚动区域+底部输入区域）（不要再修改），目前主要修改的只有context内容
3.目前内容已实现可编辑逻辑，目前数据为Workflow_Context_Data内mockdata循环展示