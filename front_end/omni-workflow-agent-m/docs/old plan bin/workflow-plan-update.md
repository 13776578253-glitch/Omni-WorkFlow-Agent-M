# 工作流内容区技术规划更新（翻译与概要生成）

## 更新日期
基于原规划文档 `工作流内容区完整技术规划_a43deada.plan.md` 的补充更新。

---

## 新增功能说明

### 1. 翻译功能

**需求**：所有上传的文档、录音后转写生成的内容，如果是英文，都可以被翻译成中文。

**类型定义**（已更新至 `constants/workflow_type.ts`）：

- **WorkflowUserBlock** 新增字段：
  - `originalLanguage?: string` - 原始语言（如 'en', 'zh'）
  - `translatedContent?: string` - 翻译后的中文内容（若原始为英文）
  - `isTranslated?: boolean` - 是否已翻译

- **WorkflowTranscriptSegment** 新增字段：
  - `originalLanguage?: string` - 原始语言
  - `translatedText?: string` - 翻译后的中文文本
  - `isTranslated?: boolean` - 是否已翻译

**实现逻辑**：
- 当用户上传英文文档或录音转写结果为英文时，前端可调用后端翻译接口（或后端自动检测并翻译）。
- 翻译后的中文内容存储在 `translatedContent`（用户块）或 `translatedText`（转写片段）中。
- UI 层可提供「显示原文/显示翻译」切换，或默认显示翻译后的中文。

---

### 2. 概要生成功能

**需求**：
- 录音转写的文档**必定触发**概要生成
- 用户手动上传的文档，需要**判断是否生成概要**（由后端判断）
- 用户输入的内容**不会触发**概要生成

**类型定义**（已更新至 `constants/workflow_type.ts`）：

- **新增类型**：
  ```ts
  export type UserContentSource = 'transcript' | 'uploaded_file' | 'manual_input';
  ```

- **WorkflowUserBlock** 新增字段：
  - `source?: UserContentSource` - 内容来源类型
    - `'transcript'`: 录音转写 → 必定触发概要生成
    - `'uploaded_file'`: 上传文档 → 后端判断是否生成概要
    - `'manual_input'`: 手动输入 → 不触发概要生成
  - `hasSummary?: boolean` - 是否已生成概要
  - `summaryContent?: string` - 概要内容
  - `shouldGenerateSummary?: boolean` - 是否应该生成概要

**实现规则**：

| 内容来源 | shouldGenerateSummary 值 | 触发时机 |
|---------|-------------------------|---------|
| `transcript` | `true`（必定） | 转写完成后立即触发 |
| `uploaded_file` | 由后端判断 | 上传完成后，后端返回 `shouldGenerateSummary` 值 |
| `manual_input` | `false`（不生成） | 不触发 |

**后端 API 更新**（建议在 `api/workflow-api.ts` 中补充）：

- **转写接口响应**：若为英文，可同时返回 `translatedText` 和 `summaryContent`（因为转写必定生成概要）。
- **上传文档接口响应**：返回 `shouldGenerateSummary` 布尔值，前端据此决定是否调用概要生成接口。
- **概要生成接口**（若需要独立调用）：
  ```ts
  interface WorkflowGenerateSummaryRequest {
    blockId: string;
    content: string;
  }
  interface WorkflowGenerateSummaryResponse {
    summaryContent: string;
  }
  ```

---

## 数据流更新

### 录音转写流程（带翻译与概要）

1. 用户录音完成 → 调用转写接口
2. 后端返回转写结果（`WorkflowTranscriptSegment[]`）
3. **若为英文**：后端同时返回 `translatedText`（或前端再调翻译接口）
4. 前端生成用户块，`source='transcript'`，`shouldGenerateSummary=true`
5. **必定触发概要生成**：调用概要生成接口，将结果写入 `summaryContent`
6. 用户块显示：原文（可选）+ 翻译（可选）+ 概要（显示）

### 上传文档流程（带翻译与条件概要）

1. 用户上传文档 → 调用上传接口
2. 后端返回文件引用 + 文档解析后的文本内容
3. **若为英文**：后端返回 `translatedContent`（或前端再调翻译接口）
4. 后端返回 `shouldGenerateSummary`（判断是否需要概要）
5. 前端生成用户块，`source='uploaded_file'`，`shouldGenerateSummary` 由后端决定
6. **若 shouldGenerateSummary=true**：调用概要生成接口，写入 `summaryContent`
7. 用户块显示：文档预览 + 翻译（可选）+ 概要（若生成）

### 手动输入流程（无概要）

1. 用户在输入框输入文本 → 提交
2. 前端生成用户块，`source='manual_input'`，`shouldGenerateSummary=false`
3. **不触发概要生成**
4. 仅触发常规 AI 生成（回答用户问题）

---

## UI 层更新建议

### 用户块展示组件

- **翻译切换**：若 `isTranslated=true`，提供「原文/翻译」切换按钮
- **概要展示**：若 `hasSummary=true`，在用户块下方或折叠区域展示 `summaryContent`
- **来源标识**：根据 `source` 显示不同图标或标签（录音/文档/输入）

### 转写时间轴

- 若转写片段 `isTranslated=true`，时间轴可显示翻译后的文本（或提供切换）
- 点击时间轴项时，若关联的块有概要，可高亮显示

---

## 与原规划的衔接

- **数据模型**：已在 `WorkflowUserBlock` 和 `WorkflowTranscriptSegment` 中补充字段，不影响现有块序列结构
- **编辑规则**：概要生成不影响「改首问重置」「改AI追加」等编辑规则
- **模式切换**：翻译与概要功能在 `recording` 和 `document` 模式下均可用，`welcome` 模式不涉及

---

## 测试场景补充

### 测试场景 4：英文转写 + 翻译 + 概要

- 用户录音（英文）→ 转写完成
- 验证：`translatedText` 存在，`isTranslated=true`
- 验证：`shouldGenerateSummary=true`，`summaryContent` 已生成
- UI 验证：可切换原文/翻译，概要正确显示

### 测试场景 5：上传英文文档 + 条件概要

- 用户上传 PDF（英文）→ 后端判断需要概要
- 验证：`source='uploaded_file'`，`shouldGenerateSummary=true`（由后端返回）
- 验证：`translatedContent` 存在，`summaryContent` 已生成

### 测试场景 6：手动输入不触发概要

- 用户输入「请总结以下文档」→ 提交
- 验证：`source='manual_input'`，`shouldGenerateSummary=false`
- 验证：不调用概要生成接口，仅触发常规 AI 回答
