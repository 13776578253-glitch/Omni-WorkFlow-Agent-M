/**
 * 工作流输出框测试用文本与文档
 * 用于 mock 生成、占位展示、可编辑区联调
 */

export const SAMPLE_USER_PROMPTS = [
  '请总结以下文档的要点。',
  '请用英文重写下面这段话。',
  '将以下内容翻译成中文。',
  '请列出上述内容的三条改进建议。',
] as const;

export const SAMPLE_AI_RESPONSES = [
  `根据文档内容，主要要点如下：\n\n1. 项目采用模块化架构，便于维护与扩展。\n2. 前后端通过 REST API 通信，数据格式为 JSON。\n3. 部署建议使用容器化方案，支持多环境一致。`,
  `Here is the rewritten version in English:\n\nThe system supports real-time collaboration and version control. All changes are synced across devices within seconds.`,
  `翻译结果：\n\n本系统支持实时协作与版本控制。所有修改会在数秒内同步至各设备。`,
  `改进建议：\n\n1. 增加单元测试覆盖率，重点覆盖核心业务逻辑。\n2. 对长列表做虚拟滚动，提升首屏渲染性能。\n3. 将敏感配置移至环境变量，避免硬编码。`,
] as const;

/** 模拟「长文档」片段，用于测试可编辑区滚动与换行 */
export const SAMPLE_LONG_DOC = `
# 项目说明

## 一、背景

本项目为工作流助手前端，用于在移动端完成录音转写、文档编辑与 AI 辅助生成。内容区采用文档式块序列，支持用户与 AI 内容的混合编辑。

## 二、功能概览

- 欢迎态：首次进入展示欢迎语。
- 录音态：展示录音条、时间轴与可编辑区。
- 文档态：仅展示可编辑区，支持文本与文件块。

## 三、编辑规则

- 修改初始提问将重置其下所有内容并重新生成。
- 修改 AI 生成内容将在下方追加，不重置。
- 一旦对首问生成内容做过编辑，首问不可再改。
`.trim();

/** 测试用「单条用户输入」默认文案 */
export const DEFAULT_TEST_USER_INPUT = SAMPLE_USER_PROMPTS[0];

/** 测试用「单条 AI 输出」默认文案 */
export const DEFAULT_TEST_AI_OUTPUT = SAMPLE_AI_RESPONSES[0];
