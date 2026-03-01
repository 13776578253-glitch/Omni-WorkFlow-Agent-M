---
name: 工作流内容区完整技术规划
overview: 在工作流页实现三种展示模式（欢迎/录音/文档）、文档式可编辑块序列、编辑规则（改首问重置/改AI追加/首问锁定），以及录音模块与时间轴的可选展示；规划以技术细节与实现顺序为主，不包含具体代码。
todos: []
isProject: false
---

# 工作流内容区完整技术规划

## 一、目标与范围

- **页面**：[app/(main)/workflow.tsx](app/(main)/workflow.tsx) 所承载的工作流主界面。
- **目标**：在现有底部结构（快捷操作 + 输入条）之上，增加**动态内容区**，支持欢迎态、录音态（录音模块 + 时间轴 + 可编辑区）、文档态（仅可编辑区），以及文档式块序列的展示与编辑规则。
- **不包含**：后端 API 真实对接、录音/转写 SDK 选型与集成细节（仅约定前端所需数据结构与调用时机）。

---

## 二、展示模式（Mode）


| 模式        | 触发条件                   | 顶部录音模块  | 左侧时间轴 | 主区可编辑内容 |
| --------- | ---------------------- | ------- | ----- | ------- |
| welcome   | 首次进入、无任何块且无进行中录音       | 不展示     | 不展示   | 仅展示欢迎语  |
| recording | 用户发起录音或上传音频，存在转写/录音上下文 | 展示（可折叠） | 展示    | 展示块序列   |
| document  | 用户仅文本输入或上传文档，无录音上下文    | 不展示     | 不展示   | 展示块序列   |


**模式判定逻辑（建议）**  

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
  - 文件块：`fileRef`（如 url、path、mimeType、fileName），可选附带 `content` 作摘要或 OCR 文本。
- **元数据**：  
  - `createdAt`：用于排序与展示时间。  
  - `sourceBlockId`：仅 AI 块需要，表示「由哪一块触发生成」，用于判断「是否由首问生成」以实现首问锁定。  
  - `editedByUser`：布尔，表示该块是否曾被用户编辑过；一旦某条 AI 块（且其 sourceBlockId 为首块 id）被编辑，则首问不可再编辑。

**块顺序**：使用有序数组 `Block[]` 表示，下标即文档顺序；不采用树形结构，以便「截断并重新生成」语义简单（删除某下标之后的所有块）。

### 3.2 首问锁定

- **含义**：第一个块（index 0）若为 user 块，视为「初始提问」。当用户对「由该首块直接或间接生成」的任意 AI 块进行过编辑并保存后，首问块不可再编辑。  
- **实现方式**：全局或页级状态 `firstQuestionLocked: boolean`。当用户保存对某 AI 块的编辑时，若该块 `sourceBlockId === blocks[0].id`，则置 `firstQuestionLocked = true`。渲染首块时，若 `firstQuestionLocked` 为 true，不展示编辑入口或置为禁用。

### 3.3 录音/转写相关（供录音态与时间轴使用）

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

1. **内容区容器**（占满除底部栏外的空间，可滚动或内部再分栏）
  - 条件渲染：  
    - **welcome**：仅渲染欢迎语组件（居中或靠上）。  
    - **recording / document**：渲染「可编辑文档区」；若为 recording，其上方与左侧再挂载录音条与时间轴。
2. **录音模块（仅 recording 时）**
  - 顶部横条，可折叠；折叠后可保留一条窄条或图标。  
  - 内部：录音控制（开始/暂停/结束）、波形或时长展示、上传/转写状态等（具体控件不展开）。
3. **时间轴（仅 recording 时）**
  - 左侧固定宽度竖条，根据转写结果渲染时间戳/句列表；点击某条可滚动主区到对应块（若存在 blockId 关联）。
4. **可编辑文档区（主区）**
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

### 5.3 与现有 workflow 页的衔接

- [workflow.tsx](app/(main)/workflow.tsx) 保留：键盘监听、inputBarMarginBottom、TouchableWithoutFeedback、底部快捷操作与输入条。  
- 新增状态：`mode`、`blocks`、`firstQuestionLocked`、可选 `recordingState` / `transcriptWithTimestamps`。  
- 「内容区」注释处插入上述**内容区容器**，由 mode 决定渲染欢迎语或「录音条 + 时间轴 + 可编辑区」组合。  
- 输入条提交时：在 blocks 末尾追加 user 块，清空输入框，触发生成（mock 或 API），并滚动到底部。

---

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

---

## 七、实现顺序（分阶段）


| 阶段  | 内容                                                                                                                                      | 产出               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1   | 类型与状态：在 [constants/type.ts](constants/type.ts) 或新建 workflow 类型文件中定义 Block、Mode、转写项等类型；在 workflow 页增加 mode、blocks、firstQuestionLocked 状态 | 类型定义与页面 state 就绪 |
| 2   | 欢迎态 + 文档态最小闭环：mode 为 welcome 时仅渲染欢迎语；为 document 时渲染可编辑区（块列表），使用 ScrollView + 简单块项占位；输入条增加提交回调，提交后追加 user 块并切到 document，mock 追加一条 AI 块   | 可输入、可看到块序列、可滚动   |
| 3   | 块编辑与规则：单块支持编辑入口与编辑态；实现 onBlockSave 中「首问截断重跑」「AI 块更新并下方追加」「首问锁定」逻辑；用 mock 生成模拟「重跑」与「追加」                                                  | 编辑规则全部生效         |
| 4   | 样式与体验：用户块/AI 块文档式样式、滚动到底、键盘与安全区与现有逻辑一致                                                                                                  | 文档式 UI 完成        |
| 5   | 录音态与时间轴（可选）：录音条组件、时间轴组件、转写数据结构与块关联；mode 为 recording 时的布局（上+左+主区）                                                                        | 录音模式可用           |


---

## 八、测试场景与预设数据

### 8.1 欢迎 → 首问 → 改首问重置

- 初始：blocks 空，mode welcome，显示欢迎语。  
- 用户输入「请总结以下文档」并提交：blocks = [user1]，mode document，mock 生成 ai1，blocks = [user1, ai1]。  
- 用户编辑 user1 为「请用英文总结」并保存：blocks 截断为 [user1']，触发 mock 重跑，得到 [user1', ai1']。  
- **验证**：原 ai1 消失，仅新 ai1'；首问仍可编辑（因尚未编辑过 AI 块）。

### 8.2 改 AI 块追加 + 首问锁定

- 当前 blocks = [user1, ai1, ai2]，ai1、ai2 的 sourceBlockId 均为 user1.id。  
- 用户编辑 ai1 内容并保存：ai1 更新为 ai1'，editedByUser = true，firstQuestionLocked = true；在 ai1' 后触发一次生成，得到新块 ai3 追加，blocks = [user1, ai1', ai2, ai3]。  
- 用户尝试编辑 user1：因 firstQuestionLocked 为 true，编辑入口禁用或点击无效果。  
- **验证**：ai2 未删；新内容在 ai1' 下追加；首问不可再改。

### 8.3 模式切换

- 仅通过输入框提交文字：始终不出现录音条与时间轴，mode 为 document。  
- 通过「录音」入口开始录音并完成转写：mode 为 recording，出现录音条（可折叠）与时间轴；编辑区显示转写生成的块。  
- 折叠录音条：录音条 UI 折叠，时间轴与编辑区仍展示。

---

## 九、文件与职责（建议）

- **类型**：[constants/type.ts](constants/type.ts) 或 `constants/workflow.ts`：Block、Mode、TranscriptItem 等。  
- **页面**：[app/(main)/workflow.tsx](app/(main)/workflow.tsx)：mode/blocks/firstQuestionLocked、键盘与底部逻辑、内容区容器与模式分支。  
- **组件**（均置于 `components/workflow/` 下）：  
  - WorkflowContentArea：根据 mode 渲染欢迎语或「录音条+时间轴+可编辑区」布局容器。  
  - WorkflowWelcome：欢迎语展示。  
  - WorkflowRecordBar：录音条（可折叠），仅 recording 时渲染。  
  - WorkflowTimestampSidebar：时间轴，仅 recording 时渲染。  
  - WorkflowEditableDoc：可滚动块列表，渲染 BlockList + 单块。  
  - WorkflowBlockItem：单块展示与编辑态，触发 onBlockSave 等。
- **输入条**：[WorkflowInputBar](components/workflow/WorkflowInputBar.tsx)：增加 onSubmit 等回调，由 workflow 页追加 user 块并触发生成。

---

## 十、与后端的边界（预留）

- **生成请求**：前端将「当前 blocks 序列」（或从某 blockId 开始的子序列）与「操作类型：首问重跑 / 追加」传给后端；后端返回新 AI 内容，前端追加为 AI 块并设置 sourceBlockId。  
- **流式输出**：若后端支持流式，前端可先追加一个「生成中」占位块，随 chunk 更新 content，结束时标记完成。  
- **文件上传**：用户块若为文件，上传接口返回 fileRef，块内保存该引用；转写/解析可由后端在生成前完成，前端只消费「文本或带时间戳的转写」即可。

以上为完整技术规划，无代码实现，仅规格与结构说明；实现时按第七节阶段顺序推进即可。